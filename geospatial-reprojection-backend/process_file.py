import sys
import os
import pandas as pd
import geopandas as gpd
from shapely import wkt
from shapely.ops import transform
from shapely.geometry import MultiLineString, Point
from pyproj import Transformer
from sklearn.preprocessing import StandardScaler
import boto3
from io import BytesIO

def is_lat_lon_column(column_values):
    scaler = StandardScaler()
    scaled_values = scaler.fit_transform(column_values.values.reshape(-1, 1))
    return all(-1.5 <= v <= 1.5 for v in scaled_values.flatten())

def reproject_coordinates(s3_url):
    s3 = boto3.client('s3')
    bucket_name = s3_url.split('/')[2].split('.')[0]
    key = '/'.join(s3_url.split('/')[3:])

    print(f"Processing file from S3: {s3_url}")

    try:
        # Download file from S3
        response = s3.get_object(Bucket=bucket_name, Key=key)
        file_content = response['Body'].read()

        # Determine file type and read accordingly
        if key.endswith('.xlsx'):
            df = pd.read_excel(BytesIO(file_content))
            output_suffix = '.xlsx'
            content_type = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        elif key.endswith('.csv'):
            df = pd.read_csv(BytesIO(file_content), low_memory=False)
            output_suffix = '.csv'
            content_type = 'text/csv'
        elif key.endswith('.geojson'):
            gdf = gpd.read_file(BytesIO(file_content))
            df = pd.DataFrame(gdf)
            output_suffix = '.geojson'
            content_type = 'application/geo+json'
        else:
            raise ValueError("Unsupported file format")

        # Detect columns with coordinates
        geometry_column = None
        lat_column = None
        lon_column = None

        for column in df.columns:
            if 'geom' in column.lower() or 'wkt' in column.lower():
                geometry_column = column
                break
            elif is_lat_lon_column(df[column]) and all(-90 <= v <= 90 for v in df[column]):
                lat_column = column
            elif is_lat_lon_column(df[column]) and all(-180 <= v <= 180 for v in df[column]):
                lon_column = column

        if geometry_column:
            df['geometry'] = df[geometry_column].apply(wkt.loads)
        elif lat_column and lon_column:
            df['geometry'] = df.apply(lambda row: Point(row[lon_column], row[lat_column]), axis=1)
        else:
            raise ValueError("No recognizable geometry or latitude/longitude columns found")

        # Create GeoDataFrame
        gdf = gpd.GeoDataFrame(df, geometry='geometry')

        # Define the transformer
        transformer = Transformer.from_crs("epsg:4326", "epsg:2263", always_xy=True)

        # Reproject the coordinates
        gdf['updated_geometry'] = gdf['geometry'].apply(lambda geom: transform_geometry(transformer, geom))

        # Extract latitude and longitude from the updated geometry
        gdf['updated_lat'], gdf['updated_long'] = zip(*gdf['updated_geometry'].apply(extract_lat_long))

        # Drop the intermediate geometry columns
        gdf.drop(columns=['geometry', 'updated_geometry'], inplace=True)

        # Prepare the output
        output_buffer = BytesIO()
        if output_suffix == '.xlsx':
            gdf.to_excel(output_buffer, index=False)
        elif output_suffix == '.csv':
            gdf.to_csv(output_buffer, index=False)
        elif output_suffix == '.geojson':
            gdf.to_file(output_buffer, driver='GeoJSON')
        output_buffer.seek(0)

        # Upload the processed file back to S3
        output_key = f"processed/{os.path.basename(key).split('.')[0]}_reprojected{output_suffix}"
        s3.put_object(
            Bucket=bucket_name, 
            Key=output_key, 
            Body=output_buffer.getvalue(),
            ContentType=content_type
        )

        print(f"Processed file uploaded to S3: s3://{bucket_name}/{output_key}")

    except Exception as e:
        print(f"Error: {e}")
        raise

def transform_geometry(transformer, geom):
    if geom.is_empty:
        return geom
    return transform(transformer.transform, geom)

def extract_lat_long(geom):
    if isinstance(geom, MultiLineString):
        centroid = geom.centroid
        return centroid.y, centroid.x
    return geom.y, geom.x

if __name__ == "__main__":
    s3_url = sys.argv[1]
    reproject_coordinates(s3_url)
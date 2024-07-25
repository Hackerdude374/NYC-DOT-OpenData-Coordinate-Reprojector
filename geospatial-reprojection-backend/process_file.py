import sys
import pandas as pd
import geopandas as gpd
from shapely import wkt
from shapely.ops import transform
from shapely.geometry import MultiLineString
from pyproj import Transformer
from tempfile import NamedTemporaryFile

def reproject_coordinates(file_path):
    print(f"Processing file: {file_path}")

    df = None
    output_file = None
    try:
        # Check the file extension and read the file accordingly
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path)
            output_suffix = '.xlsx'
            print("File is an Excel file.")
        elif file_path.endswith('.csv'):
            try:
                df = pd.read_csv(file_path, low_memory=False)
                output_suffix = '.csv'
                print("File is a CSV file.")
                print("Columns in the file:", df.columns)
            except Exception as e:
                print(f"Error reading CSV file: {e}")
                with open(file_path, 'r') as f:
                    print("First few lines of the CSV file:")
                    for _ in range(5):
                        print(f.readline().strip())
                raise
        elif file_path.endswith('.geojson'):
            gdf = gpd.read_file(file_path)
            df = pd.DataFrame(gdf)
            output_suffix = '.geojson'
            print("File is a GeoJSON file.")
            print("Columns in the file:", df.columns)
        else:
            print("File format not supported.")
            raise ValueError("Unsupported file format")

        # Detect columns with coordinates
        geometry_column = None
        for column in df.columns:
            if 'geom' in column.lower() or 'wkt' in column.lower():
                geometry_column = column
                break

        if geometry_column:
            df['geometry'] = df[geometry_column].apply(wkt.loads)
            print(f"Geometry column detected: '{geometry_column}'")
        else:
            print("No recognizable geometry column found")
            raise ValueError("No recognizable geometry column found")

        # Create GeoDataFrame
        gdf = gpd.GeoDataFrame(df, geometry='geometry')

        # Define the transformer (modify the EPSG codes as needed)
        transformer = Transformer.from_crs("epsg:4326", "epsg:2263", always_xy=True)  # Change 4326 to your input CRS and 2263 to NY State Plane

        # Reproject the coordinates
        gdf['updated_geometry'] = gdf['geometry'].apply(lambda geom: transform_geometry(transformer, geom))

        # Extract latitude and longitude from the updated geometry
        def extract_lat_long(geom):
            if isinstance(geom, MultiLineString):
                # Use the centroid for MultiLineString
                centroid = geom.centroid
                return centroid.y, centroid.x
            return geom.y, geom.x

        gdf['updated_lat'], gdf['updated_long'] = zip(*gdf['updated_geometry'].apply(extract_lat_long))

        # Drop the intermediate geometry columns
        gdf.drop(columns=['geometry', 'updated_geometry'], inplace=True)

        # Save the updated dataframe to a new file with the same format as the input file
        with NamedTemporaryFile(delete=False, suffix=output_suffix) as temp_file:
            if output_suffix == '.xlsx':
                gdf.to_excel(temp_file.name, index=False)
            elif output_suffix == '.csv':
                gdf.to_csv(temp_file.name, index=False)
            elif output_suffix == '.geojson':
                gdf.to_file(temp_file.name, driver='GeoJSON')
            output_file = temp_file.name
            return output_file
    except Exception as e:
        print(f"Error: {e}")
        if df is not None:
            print(f"DataFrame content: {df.head()}")
        raise

def transform_geometry(transformer, geom):
    if geom.is_empty:
        return geom
    return transform(transformer.transform, geom)

if __name__ == "__main__":
    input_file = sys.argv[1]
    print(f"Input file: {input_file}")
    output_file = reproject_coordinates(input_file)
    print(f"Output file: {output_file}")

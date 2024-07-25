import sys
import pandas as pd
import geopandas as gpd
from shapely import wkt
from shapely.ops import transform
from pyproj import Transformer
from tempfile import NamedTemporaryFile

def reproject_coordinates(file_path):
    print(f"Processing file: {file_path}")

    # Check the file extension and read the file accordingly
    if file_path.endswith('.xlsx'):
        df = pd.read_excel(file_path)
        print("File is an Excel file.")
    elif file_path.endswith('.csv'):
        df = pd.read_csv(file_path)
        print("File is a CSV file.")
    elif file_path.endswith('.geojson'):
        gdf = gpd.read_file(file_path)
        df = pd.DataFrame(gdf)
        print("File is a GeoJSON file.")
    else:
        print("File format not supported.")
        raise ValueError("Unsupported file format")

    # Print column names for debugging
    print("Columns in the file:", df.columns)

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

    # Split the updated_geometry into latitude and longitude
    gdf['updated_lat'] = gdf['updated_geometry'].apply(lambda geom: geom.y)
    gdf['updated_long'] = gdf['updated_geometry'].apply(lambda geom: geom.x)

    # Drop the intermediate geometry columns
    gdf.drop(columns=['geometry', 'updated_geometry'], inplace=True)

    # Save the updated dataframe to a new Excel file
    with NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
        gdf.to_excel(temp_file.name, index=False)
        return temp_file.name

def transform_geometry(transformer, geom):
    if geom.is_empty:
        return geom
    return transform(transformer.transform, geom)

if __name__ == "__main__":
    input_file = sys.argv[1]
    print(f"Input file: {input_file}")
    output_file = reproject_coordinates(input_file)
    print(f"Output file: {output_file}")

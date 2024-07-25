import sys
import pandas as pd
from pyproj import Transformer
from tempfile import NamedTemporaryFile

def reproject_coordinates(file_path):
    # Load the data (modify according to your file format)
    df = pd.read_excel(file_path)

    # Define the transformer (modify the EPSG codes as needed)
    transformer = Transformer.from_crs("epsg:4326", "epsg:2263")  # Change 4326 to your input CRS and 2263 to NY State Plane

    # Reproject the coordinates
    df['updated_lat'], df['updated_long'] = transformer.transform(df['latitude'].values, df['longitude'].values)

    # Save the updated dataframe to a new Excel file
    with NamedTemporaryFile(delete=False, suffix='.xlsx') as temp_file:
        df.to_excel(temp_file.name, index=False)
        return temp_file.name

if __name__ == "__main__":
    input_file = sys.argv[1]
    output_file = reproject_coordinates(input_file)
    print(output_file)

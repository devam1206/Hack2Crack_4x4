from flask import Flask, request, jsonify
import rasterio
from rasterio.transform import rowcol
from pyproj import Transformer, CRS
import numpy as np
import glob
import os
import re
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def get_raster_values(lat, lon, raster_paths, default_crs="EPSG:32643"):
    """
    Fetches raster values at the given latitude and longitude for multiple .asc and .tif raster files.
    Also prints the min and max values of each raster.

    Parameters:
    lat (float): Latitude coordinate
    lon (float): Longitude coordinate
    raster_paths (list): List of file paths to raster files (.asc, .tif)
    default_crs (str): Default CRS if the raster file lacks CRS info (default: "EPSG:32643")

    Returns:
    dict: Dictionary with filenames as keys and raster values as values
    """
    results = {}

    for raster_path in raster_paths:
        try:
            with rasterio.open(raster_path) as dataset:
                dataset_crs = dataset.crs if dataset.crs else CRS.from_string(default_crs)

                transformer = Transformer.from_crs("EPSG:4326", dataset_crs, always_xy=True)
                x, y = transformer.transform(lon, lat)
                row, col = rowcol(dataset.transform, x, y)

                value = dataset.read(1)[row, col]

                min_val = dataset.read(1).min()
                max_val = dataset.read(1).max()
                
                # Extract filename without extension and store the value
                file_name = os.path.splitext(os.path.basename(raster_path))[0]
                
                if file_name == 'meanticd':
                    file_name = "inorganic_carbon_density"
                elif file_name == 'meantocd':
                    file_name = "organic_carbon_density"
            
                elif file_name =='fsalt':
                    file_name = "salt_affected"
                    value = (value - min_val) / (max_val - min_val) * 100
                elif file_name =='fwatero':
                    file_name = "water_erosion"
                    value = (value - min_val) / (max_val - min_val) * 100
                elif file_name =='fwindero':
                    file_name = "wind_erosion"
                    value = (value - min_val) / (max_val - min_val) * 100
                elif file_name =='fwaterlog':
                    file_name = "water_logging"
                    value = (value - min_val) / (max_val - min_val) * 100

                elif file_name.startswith('ffallow'):
                    file_name = "fallow"
                    value = (value - min_val) / (max_val - min_val) * 100
                elif file_name.startswith('fkharif'):
                    file_name = "kharif"
                    value = (value - min_val) / (max_val - min_val) * 100
                elif file_name.startswith('frabi'):
                    file_name = "rabi"
                    value = (value - min_val) / (max_val - min_val) * 100
                elif file_name.startswith('fnsa'):
                    file_name = "net_sown_area"
                    value = (value - min_val) / (max_val - min_val) * 100
                
                elif file_name.startswith('rootsm'):
                    file_name = "root_level_surface_moisture"
                elif file_name.startswith('s_runoff'):
                    file_name = "surface_runoff"
                elif file_name.startswith('upSMNRSC'):
                    file_name = "upper_level_surface_moisture"
                elif file_name.startswith('ocm2_vf'):
                    file_name = "vegetation_fraction"
                elif file_name.startswith('ocm2_ndvi_filt'):
                    file_name = "filtered_ndvi"
                elif file_name.startswith('localocm2'):
                    file_name = "local_ndvi"
                elif file_name.startswith('globalocm2'):
                    file_name = "global_ndvi"
                elif file_name.startswith('evaNHP'):
                    file_name = "evapotranspiration"

                results[file_name] = float(round(value, 2))
        except Exception as e:
            print(f"Error processing {raster_path}: {str(e)}")
            continue

    return results

def classes_data(raster_values):
    new_dict = {}

    soil_keys = ("floamy", "fclayey", "fclayskeletal", "fsandy")
    soil_values = {key: raster_values.get(key, 0) for key in soil_keys}
    if soil_values:
        max_soil_type = max(soil_values, key=soil_values.get)
        new_dict['soil_type'] = max_soil_type[1:] if max_soil_type.startswith('f') else max_soil_type
    else:
        new_dict['soil_type'] = "unknown"
    
    soil_depth_keys = (
        "fsoildep0_25", "fsoildep25_50", "fsoildep50_75",
        "fsoildep75_100", "fsoildep100_150", "fsoildep150_200"
    )
    soil_depth_values = {key: raster_values.get(key, 0) for key in soil_depth_keys}
    if soil_depth_values:
        max_soil_depth = max(soil_depth_values, key=soil_depth_values.get)
        match = re.search(r"(\d+)_(\d+)", max_soil_depth)
        if match:
            start, end = match.groups()
            soil_depth = f"{start}-{end}cm"
        else:
            soil_depth = "unknown"
        new_dict['soil_depth'] = soil_depth
    else:
        new_dict['soil_depth'] = "unknown"
    
    for key in list(raster_values.keys()):  
        if key not in soil_keys and key not in soil_depth_keys:
            new_dict[key] = raster_values[key]

    # Ensure these keys exist with default values if they don't
    if 'organic_carbon_density' not in new_dict:
        new_dict['organic_carbon_density'] = 0
    else:
        new_dict['organic_carbon_density'] = round(new_dict['organic_carbon_density'], 2)
        
    if 'inorganic_carbon_density' not in new_dict:
        new_dict['inorganic_carbon_density'] = 0
    else:
        new_dict['inorganic_carbon_density'] = round(new_dict['inorganic_carbon_density'], 2)
    
    # Add default values for missing keys that are needed by the frontend
    for key in ['net_sown_area', 'kharif', 'rabi']:
        if key not in new_dict:
            new_dict[key] = 0

    return new_dict

@app.route('/get_data', methods=['GET'])
def get_data():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)
    
    if lat is None or lon is None:
        return jsonify({"error": "Missing lat or lon parameters"}), 400
    
    folder_path = "gis_data"
    raster_files = glob.glob(os.path.join(folder_path, "*.asc")) + glob.glob(os.path.join(folder_path, "*.tif"))
    
    try:
        # If no raster files found, return dummy data for testing
        if not raster_files:
            dummy_data = {
                "organic_carbon_density": 26.02,
                "inorganic_carbon_density": 62.77,
                "net_sown_area": 52.42,
                "kharif": 49.92,
                "rabi": 50.08,
                "soil_type": "loamy",
                "soil_depth": "75-100cm"
            }
            return jsonify(dummy_data)
            
        raster_values = get_raster_values(lat, lon, raster_files, "EPSG:32643")
        raster_values = classes_data(raster_values)
        return jsonify(raster_values)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=7000)


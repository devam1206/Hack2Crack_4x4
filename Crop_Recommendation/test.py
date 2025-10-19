import streamlit as st
from datetime import datetime
from PIL import Image
import pytesseract
import re
import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
import joblib
import matplotlib.pyplot as plt
import requests

# Set the Tesseract command path
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Function to fetch seasonal weather data from the API
def fetch_seasonal_data(latitude, longitude):
    url = f"https://seasonal-api.open-meteo.com/v1/seasonal?latitude={latitude}&longitude={longitude}&six_hourly=temperature_2m,precipitation,relative_humidity_2m&forecast_days=183"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        st.error(f"Error fetching data: {response.status_code}")
        return None

# Function to multiply rainfall value by 1000
def convert_rainfall_value(rainfall_value):
    return rainfall_value * 1000

# Function to perform OCR on image
def ocr_image(image_path):
    image = Image.open(image_path)
    text = pytesseract.image_to_string(image)
    return text

# Function to extract soil data using regular expressions
def extract_soil_data(ocr_text):
    patterns = {
        'Nitrogen': r'(Available Nitrogen|Nitrogen|N)\s*\(.?\)\s(\d+)\s*(kg/ha|mg-N/kg)',
        'Phosphorus': r'(Available Phosphorus|Phosphorus|P)\s*\(.?\)\s(\d+)\s*(kg/ha|mg-N/kg)',
        'Potassium': r'(Available Potassium|Potassium|K)\s*\(.?\)\s(\d+)\s*(kg/ha|mg-N/kg)',
        'pH': r'(pH)\s*\(.?\)\s(\d+(\.\d+)?)'
    }
    extracted_data = {}
    units = {}
    for nutrient, pattern in patterns.items():
        match = re.search(pattern, ocr_text, re.IGNORECASE)
        if match:
            extracted_data[nutrient] = float(match.group(2)) if nutrient == 'pH' else int(match.group(2))
            if nutrient != 'pH':
                units[nutrient] = match.group(3)

    if 'pH' not in extracted_data:
        extracted_data['pH'] = 6.5  # Default pH value

    return extracted_data, units

# Function to validate soil data
def validate_soil_data(soil_data, units):
    if soil_data is None:
        st.error("Error: Soil data is None.")
        return None
    for key in soil_data:
        if key != 'pH':  # Skip pH conversion
            if units[key] == 'kg/ha':
                soil_data[key] = soil_data[key] * (1000 / 1500)  # Convert kg/ha to mg-N/kg
            elif units[key] == 'mg-N/kg':
                soil_data[key] = soil_data[key]  # Already in mg-N/kg
    return soil_data

# Class to handle crop recommendation model
class CropRecommendationModel:
    def _init_(self):
        self.model_rf = None
        self.model_gb = None
        self.scaler = None
        self.unique_crops = None

    def load_dataset_from_drive(self, file_path):
        try:
            dataset = pd.read_csv(file_path)
            st.success("Dataset loaded successfully!")
            return dataset
        except Exception as e:
            st.error(f"Error loading dataset: {e}")
            return None

    def train_model(self, dataset):
        features = dataset[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        labels = dataset['label']
        X_train, X_test, y_train, y_test = train_test_split(features, labels, test_size=0.2, random_state=42)

        scaler = MinMaxScaler()
        X_train_scaled = scaler.fit_transform(X_train)

        model_rf = RandomForestClassifier(n_estimators=100, random_state=42)
        model_rf.fit(X_train_scaled, y_train)

        model_gb = GradientBoostingClassifier(n_estimators=100, random_state=42)
        model_gb.fit(X_train_scaled, y_train)

        model_components = {
            'model_rf': model_rf,
            'model_gb': model_gb,
            'scaler': scaler,
            'unique_crops': labels.unique()
        }

        return model_components

    def save_model(self, model_components, save_path):
        joblib.dump(model_components, save_path)
        st.success(f"Model saved to {save_path}")

# Class to handle crop recommendations
class CropRecommendationPredictor:
    def _init_(self, model_components):
        self.model_rf = model_components['model_rf']
        self.model_gb = model_components['model_gb']
        self.scaler = model_components['scaler']
        self.unique_crops = model_components['unique_crops']

    def get_crop_recommendations(self, input_data, dataset):
        features = dataset[['N', 'P', 'K', 'temperature', 'humidity', 'ph', 'rainfall']]
        features_normalized = self.scaler.transform(features)

        input_features = np.array([input_data['N'], input_data['P'], input_data['K'],
                                   input_data['temperature'], input_data['humidity'],
                                   input_data['ph'], input_data['rainfall']])
        input_normalized = self.scaler.transform([input_features])[0]

        distances = np.linalg.norm(features_normalized - input_normalized, axis=1)
        affinity_scores = 1 / (1 + distances)
        dataset['affinity_score'] = affinity_scores

        yield_scores_rf = dataset.groupby('label')['affinity_score'].sum()
        max_score_rf = yield_scores_rf.max()
        scaled_scores_rf = (yield_scores_rf / max_score_rf) * 95

        yield_scores_gb = dataset.groupby('label')['affinity_score'].sum()
        max_score_gb = yield_scores_gb.max()
        scaled_scores_gb = (yield_scores_gb / max_score_gb) * 95

        combined_scores = (scaled_scores_rf + scaled_scores_gb) / 2
        remaining_percentage = 5
        combined_scores = combined_scores.sort_values(ascending=False)
        remaining_scores = (combined_scores / combined_scores.sum()) * remaining_percentage
        final_scores = combined_scores + remaining_scores

        top_4_crops = final_scores.sort_values(ascending=False).head(4)

        return top_4_crops

    def visualize_recommendations(self, recommendations):
        plt.figure(figsize=(10, 6))
        plt.pie(recommendations, labels=recommendations.index, autopct='%1.1f%%')
        plt.title('Crop Yield Potential')
        plt.axis('equal')
        plt.tight_layout()
        st.pyplot(plt)

# Streamlit app
def main():
    st.title("Crop Recommendation System")
    st.write("Upload a soil report image and get crop recommendations based on the extracted data.")

    # Input latitude and longitude
    latitude = st.number_input("Latitude", value=19.0760)
    longitude = st.number_input("Longitude", value=72.8777)

    # Fetch seasonal data for the next 183 days
    if st.button("Fetch Seasonal Data"):
        seasonal_data = fetch_seasonal_data(latitude, longitude)
        if seasonal_data:
            # Extract all timestamps from the data
            times = seasonal_data['six_hourly']['time']
            # Convert timestamps to datetime objects
            time_dates = [datetime.strptime(time, "%Y-%m-%dT%H:%M") for time in times]

            # Group data by month
            monthly_data = {}
            for i, time_date in enumerate(time_dates):
                month_key = time_date.strftime("%Y-%m")  # Group by year and month (e.g., "2023-10")

                if month_key not in monthly_data:
                    monthly_data[month_key] = {
                        "temps": [],
                        "humidity": [],
                        "rainfall": []
                    }

                # Extract temperature, humidity, and rainfall for the current timestamp
                for member in ['temperature_2m_member01', 'temperature_2m_member02', 'temperature_2m_member03', 'temperature_2m_member04']:
                    temp = seasonal_data['six_hourly'][member][i]
                    if temp is not None:
                        monthly_data[month_key]["temps"].append(temp)

                for member in ['relative_humidity_2m_member01', 'relative_humidity_2m_member02', 'relative_humidity_2m_member03', 'relative_humidity_2m_member04']:
                    humid = seasonal_data['six_hourly'][member][i]
                    if humid is not None:
                        monthly_data[month_key]["humidity"].append(humid)

                for member in ['precipitation_member01', 'precipitation_member02', 'precipitation_member03', 'precipitation_member04']:
                    rain = seasonal_data['six_hourly'][member][i]
                    if rain is not None:
                        monthly_data[month_key]["rainfall"].append(convert_rainfall_value(rain))  # Multiply rainfall by 1000

            # Calculate monthly averages
            monthly_averages = {}
            for month_key, values in monthly_data.items():
                avg_temp = sum(values["temps"]) / len(values["temps"]) if values["temps"] else 0
                avg_humidity = sum(values["humidity"]) / len(values["humidity"]) if values["humidity"] else 0
                avg_rainfall = sum(values["rainfall"]) / len(values["rainfall"]) if values["rainfall"] else 0

                monthly_averages[month_key] = {
                    "avg_temp": avg_temp,
                    "avg_humidity": avg_humidity,
                    "avg_rainfall": avg_rainfall
                }

            # Calculate the average of the monthly averages
            num_months = len(monthly_averages)
            if num_months > 0:
                avg_of_avg_temp = sum(month["avg_temp"] for month in monthly_averages.values()) / num_months
                avg_of_avg_humidity = sum(month["avg_humidity"] for month in monthly_averages.values()) / num_months
                avg_of_avg_rainfall = sum(month["avg_rainfall"] for month in monthly_averages.values()) / num_months

                # Display results
                st.write(f"Average of Monthly Averages (for the next 183 days):")
                st.write(f"Temperature: {avg_of_avg_temp:.2f} °C")
                st.write(f"Humidity: {avg_of_avg_humidity:.2f} %")
                st.write(f"Rainfall: {avg_of_avg_rainfall:.2f} mm/6h")
            else:
                st.write("No data available for the given range.")
        else:
            st.write("No data available for the given coordinates.")

    # Upload soil report image
    uploaded_file = st.file_uploader("Upload Soil Report Image", type=["jpg", "jpeg", "png"])
    if uploaded_file is not None:
        image = Image.open(uploaded_file)
        st.image(image, caption="Uploaded Soil Report", use_column_width=True)

        # Perform OCR on image
        report_text = ocr_image(uploaded_file)
        st.write("OCR Extracted Text:\n", report_text)

        # Extract and validate soil data
        soil_data, units = extract_soil_data(report_text)
        if soil_data is not None:
            soil_data = validate_soil_data(soil_data, units)
            st.write("Validated Soil Data:", soil_data)

            # Load and train crop recommendation model
            recommender = CropRecommendationModel()
            dataset_path = 'recommend_vision.csv'  # Path to your dataset
            dataset = recommender.load_dataset_from_drive(dataset_path)
            if dataset is not None:
                model_components = recommender.train_model(dataset)
                save_path = 'crop_recommendation_model.pkl'  # Path to save the model
                recommender.save_model(model_components, save_path)

                # Define input data
                input_data = {
                    'N': soil_data['Nitrogen'],
                    'P': soil_data['Phosphorus'],
                    'K': soil_data['Potassium'],
                    'temperature': avg_of_avg_temp,
                    'humidity': avg_of_avg_humidity,
                    'ph': soil_data['pH'],
                    'rainfall': avg_of_avg_rainfall
                }
                st.write("Input Data for Prediction:", input_data)

                # Make predictions
                predictor = CropRecommendationPredictor(model_components)
                top_4_crops = predictor.get_crop_recommendations(input_data, dataset)
                st.write("\nTop 4 Crop Recommendations:")
                for crop, score in top_4_crops.items():
                    st.write(f"{crop}: {score:.2f}% yield potential")

                # Visualize recommendations
                predictor.visualize_recommendations(top_4_crops)
            else:
                st.write("Failed to load dataset.")
        else:
            st.write("Failed to extract soil data.")


main()
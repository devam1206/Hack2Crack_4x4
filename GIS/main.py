from flask import Flask, request, jsonify
from sklearn.preprocessing import MinMaxScaler
import torch
import torch.nn as nn
from rasterio.transform import rowcol
from pyproj import Transformer, CRS
import plotly.subplots as sp
import plotly.graph_objects as go
from flask_cors import CORS
import pandas as pd
import numpy as np
import rasterio
import requests
import datetime
import time
import glob
import os
import re

app = Flask(__name__)
CORS(app)


def fetch_weather_data(lat, lon, years=5, delay=0):
    today = datetime.date.today() - datetime.timedelta(days=5)  # Adjust start date to 5 days prior
    start_year = today.year - years 
    end_year = today.year  
    
    all_data = []
    for year in range(start_year, end_year):
        start_date = f"{year}-{today.month:02d}-{today.day:02d}"
        end_date = f"{year + 1}-{today.month:02d}-{today.day:02d}" 

        url = (f"https://archive-api.open-meteo.com/v1/archive?latitude={lat}&longitude={lon}"
               f"&start_date={start_date}&end_date={end_date}"
               f"&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean"
               f"&timezone=auto")
        
        response = requests.get(url)
        
        if response.status_code == 200:
            data = response.json()

            if ("daily" in data and 
                "time" in data["daily"] and 
                "temperature_2m_max" in data["daily"] and 
                "temperature_2m_min" in data["daily"] and 
                "precipitation_sum" in data["daily"]):
                
                dates = data["daily"]["time"]
                temp_max = data["daily"]["temperature_2m_max"]
                temp_min = data["daily"]["temperature_2m_min"]
                rainfall = data["daily"]["precipitation_sum"]

                if "relative_humidity_2m_mean" in data["daily"]:
                    humidity = data["daily"]["relative_humidity_2m_mean"]
                else:
                    humidity = [None] * len(dates)
                    print("Humidity data not available")
                
                for i in range(len(dates)):
                    if temp_max[i] is not None and temp_min[i] is not None:
                        avg_temp = (temp_max[i] + temp_min[i]) / 2
                    else:
                        avg_temp = None

                    rain_val = rainfall[i] if rainfall[i] is not None else None
                    hum_val = humidity[i] if i < len(humidity) else None
                    
                    all_data.append([dates[i], avg_temp, rain_val, hum_val])
            else:
                print(f"Missing required data fields for {year}")
                print(f"Available fields: {data.get('daily', {}).keys()}")
        else:
            print(f"Error fetching data for {year}: {response.status_code}")
            print(f"Error message: {response.text}") 
        
        # Add delay between requests to avoid rate limiting
        if delay > 0 and year < end_year - 1:  # Don't delay after the last request
            time.sleep(delay)
    
    if all_data:
        df = pd.DataFrame(all_data, columns=["date", "Temperature", "Rainfall", "Humidity"])
        df["date"] = pd.to_datetime(df["date"])
        return df
    else:
        print("No data collected")
        return pd.DataFrame()


class LSTMModel(nn.Module):
    def __init__(self, seq_length):
        super(LSTMModel, self).__init__()
        self.lstm1 = nn.LSTM(1, 50, batch_first=True)
        self.dropout1 = nn.Dropout(0.2)
        self.lstm2 = nn.LSTM(50, 50, batch_first=True)
        self.dropout2 = nn.Dropout(0.2)
        self.fc = nn.Linear(50, 1)
        
    def forward(self, x):
        # First LSTM layer
        x, _ = self.lstm1(x)
        x = self.dropout1(x)
        # Second LSTM layer (we only take the last output)
        _, (h_n, _) = self.lstm2(x)
        x = self.dropout2(h_n.squeeze(0))
        # Fully connected layer
        x = self.fc(x)
        return x


def forecast_lstm(df, forecast_periods=180, seq_length=10, epochs=50, batch_size=32):
    # Set device
    if torch.cuda.is_available():
        device = torch.device("cuda")
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        device = torch.device("mps")
    else:
        device = torch.device("cpu")
    
    print(f"Using device: {device}")
    
    forecast_start_date = df.index[-1] + pd.Timedelta(days=1)
    future_dates = pd.date_range(start=forecast_start_date + pd.Timedelta(days=1), 
                                periods=forecast_periods)
    forecast_df = pd.DataFrame(index=future_dates)
    
    models = {}
    
    for column in df.columns:
        scaler = MinMaxScaler(feature_range=(0, 1))
        scaled_data = scaler.fit_transform(df[column].values.reshape(-1, 1))
        
        X, y = [], []
        for i in range(len(scaled_data) - seq_length):
            X.append(scaled_data[i:(i + seq_length), 0])
            y.append(scaled_data[i + seq_length, 0])
        X, y = np.array(X), np.array(y)
        
        X = np.reshape(X, (X.shape[0], X.shape[1], 1))
        
        # Convert to torch tensors
        X = torch.tensor(X, dtype=torch.float32).to(device)
        y = torch.tensor(y, dtype=torch.float32).to(device)
        
        # Create model
        model = LSTMModel(seq_length).to(device)
        criterion = nn.MSELoss()
        optimizer = torch.optim.Adam(model.parameters())
        
        # Train model
        for epoch in range(epochs):
            model.train()
            for i in range(0, len(X), batch_size):
                batch_X = X[i:i+batch_size]
                batch_y = y[i:i+batch_size]
                
                # Forward pass
                outputs = model(batch_X).squeeze()
                loss = criterion(outputs, batch_y)
                
                # Backward and optimize
                optimizer.zero_grad()
                loss.backward()
                optimizer.step()
        
        models[column] = model
        
        # Make predictions
        model.eval()
        predictions = []
        current_batch = torch.tensor(scaled_data[-seq_length:].reshape(1, seq_length, 1), dtype=torch.float32).to(device)
        
        with torch.no_grad():
            for i in range(forecast_periods):
                # Get prediction
                pred = model(current_batch)
                current_pred = pred.item()
                
                predictions.append(current_pred)
                
                # Create a completely new tensor instead of trying to modify in place
                # This avoids the memory overlap error
                next_input = torch.zeros_like(current_batch)
                # Shift values - copy all but first element
                next_input[0, 0:seq_length-1, 0] = current_batch[0, 1:seq_length, 0]
                # Add the new prediction at the end
                next_input[0, -1, 0] = current_pred
                
                current_batch = next_input
        
        # Inverse transform predictions
        predictions = scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
        forecast_df[column] = predictions
    
    return forecast_df, models


def create_interactive_plots(df, output_file="weather.html"):
    df = df.copy()
    
    if 'Unnamed: 0' in df.columns:
        df.set_index('Unnamed: 0', inplace=True)
        df.index = pd.to_datetime(df.index)
    
    date_values = df.index
    
    fig = sp.make_subplots(
        rows=3, cols=1, 
        subplot_titles=('Air Temperature (°C)', 'Precipitation (mm)', 'Atmospheric Humidity (%)'),
        shared_xaxes=True,
        vertical_spacing=0.1
    )
    
    fig.add_trace(
        go.Scatter(x=date_values, y=df['Temperature'], mode='lines', name='Air Temperature', line=dict(color='red', width=3)),
        row=1, col=1
    )
    
    fig.add_trace(
        go.Scatter(x=date_values, y=df['Rainfall'], mode='lines', name='Precipitation', line=dict(color='blue', width=3)),
        row=2, col=1
    )
    
    fig.add_trace(
        go.Scatter(x=date_values, y=df['Humidity'], mode='lines', name='Atmospheric Humidity', line=dict(color='green', width=3)),
        row=3, col=1
    )
    
    fig.update_layout(
        height=800,
        width=900,
        plot_bgcolor="white",
        xaxis=dict(showgrid=True, gridcolor="lightgray"),
        yaxis=dict(title="Temperature (°C)", showgrid=True, gridcolor="lightgray"),
        xaxis2=dict(showgrid=True, gridcolor="lightgray"),
        yaxis2=dict(title="Rainfall (mm)", showgrid=True, gridcolor="lightgray"),
        xaxis3=dict(
            showgrid=True,
            gridcolor="lightgray",
            rangeselector=dict(
                buttons=list([
                    dict(count=3, label="3m", step="month", stepmode="backward"),
                    dict(count=6, label="6m", step="month", stepmode="backward"),
                    dict(count=9, label="9m", step="month", stepmode="backward"),
                    dict(count=12, label="1y", step="month", stepmode="backward"),
                ]),
                x=0.5,
                y=-0.15
            ),
            type="date"
        ),
        yaxis3=dict(title="Humidity (%)", showgrid=True, gridcolor="lightgray"),
        margin=dict(l=50, r=50, t=50, b=50),
    )
    
    output_folder = "output"
    os.makedirs(output_folder, exist_ok=True)
    
    output_path = os.path.join(output_folder, output_file)
    fig.write_html(output_path)


@app.route('/get_weather', methods=['GET'])
def get_data():
    lat = request.args.get('lat', type=float)
    lon = request.args.get('lon', type=float)

    forecast_period=120

    weather_df = fetch_weather_data(lat, lon, delay=2) 

    weather_df.set_index("date", inplace=True)
    weather_df.index = pd.to_datetime(weather_df.index)
    forecast_df, models = forecast_lstm(weather_df, forecast_periods=forecast_period)
    
    create_interactive_plots(forecast_df)
    weather_graph_path="output/weather.html"

    avg_temperature = forecast_df['Temperature'].mean()
    avg_humidity = forecast_df['Humidity'].mean()
    avg_rainfall = forecast_df['Rainfall'].mean()
    
    if lat is None or lon is None:
        return jsonify({"error": "Missing lat or lon parameters"}), 400
    
    output = {}

    output['avg_temperature'] = round(float(avg_temperature),2)
    output['avg_humidity'] = round(float(avg_humidity),2)
    output['avg_rainfall'] = round(float(avg_rainfall),2)
    output['weather_graph_path'] = weather_graph_path

    return jsonify(output)

if __name__ == '__main__':
    app.run(debug=True,port=5500)
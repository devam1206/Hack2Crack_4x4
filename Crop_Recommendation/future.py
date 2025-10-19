import requests
from datetime import datetime

# Input latitude and longitude
latitude = float(input("Enter latitude: "))
longitude = float(input("Enter longitude: "))

# Function to fetch data from the API
def fetch_seasonal_data(latitude, longitude):
    url = f"https://seasonal-api.open-meteo.com/v1/seasonal?latitude={latitude}&longitude={longitude}&six_hourly=temperature_2m,precipitation,relative_humidity_2m&forecast_days=183"
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Error fetching data: {response.status_code}")
        return None

# Fetch data from the API
data = fetch_seasonal_data(latitude, longitude)

if data:
    # Get current date
    current_date = datetime.now()
    # Calculate end of June (June 30th of the current year)
    june_end = datetime(current_date.year, 6, 30)

    # Extract all timestamps from the data
    times = data['six_hourly']['time']
    # Convert timestamps to datetime objects
    time_dates = [datetime.strptime(time, "%Y-%m-%dT%H:%M") for time in times]

    # Filter indices for the range: current date to June end
    filtered_indices = [
        i for i, time_date in enumerate(time_dates)
        if current_date <= time_date <= june_end
    ]

    # Group data by month
    monthly_data = {}
    for i in filtered_indices:
        time_date = time_dates[i]
        month_key = time_date.strftime("%Y-%m")  # Group by year and month (e.g., "2023-10")

        if month_key not in monthly_data:
            monthly_data[month_key] = {
                "temps": [],
                "humidity": [],
                "rainfall": []
            }

        # Extract temperature, humidity, and rainfall for the current timestamp
        for member in ['temperature_2m_member01', 'temperature_2m_member02', 'temperature_2m_member03', 'temperature_2m_member04']:
            temp = data['six_hourly'][member][i]
            if temp is not None:
                monthly_data[month_key]["temps"].append(temp)

        for member in ['relative_humidity_2m_member01', 'relative_humidity_2m_member02', 'relative_humidity_2m_member03', 'relative_humidity_2m_member04']:
            humid = data['six_hourly'][member][i]
            if humid is not None:
                monthly_data[month_key]["humidity"].append(humid)

        for member in ['precipitation_member01', 'precipitation_member02', 'precipitation_member03', 'precipitation_member04']:
            rain = data['six_hourly'][member][i]
            if rain is not None:
                monthly_data[month_key]["rainfall"].append(rain)

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

        # Print results
        print(f"Average of Monthly Averages (from {current_date.strftime('%Y-%m')} to June):")
        print(f"Temperature: {avg_of_avg_temp:.2f} °C")
        print(f"Humidity: {avg_of_avg_humidity:.2f} %")
        print(f"Rainfall: {avg_of_avg_rainfall:.2f} mm/6h")
    else:
        print("No data available for the given range.")
else:
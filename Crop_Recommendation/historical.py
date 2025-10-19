import requests

# Define the location (Mumbai, India)
latitude = 19.0760
longitude = 72.8777

# Define the time range (year 2022)
start_date = '2022-01-01'
end_date = '2022-12-31'

# Construct the API URL
url = f'https://archive-api.open-meteo.com/v1/archive?latitude={latitude}&longitude={longitude}&start_date={start_date}&end_date={end_date}&daily=temperature_2m_mean,relative_humidity_2m_mean,precipitation_sum&timezone=auto'

# Make the API request
response = requests.get(url)

if response.status_code == 200:
    data = response.json()
    daily_data = data['daily']

    # Calculate averages
    avg_temp = sum(daily_data['temperature_2m_mean']) / len(daily_data['temperature_2m_mean'])
    avg_humidity = sum(daily_data['relative_humidity_2m_mean']) / len(daily_data['relative_humidity_2m_mean'])
    total_rainfall = sum(daily_data['precipitation_sum'])

    print(f"Average Temperature: {avg_temp:.2f} °C")
    print(f"Average Humidity: {avg_humidity:.2f} %")
    print(f"Total Rainfall: {total_rainfall:.2f} mm")
else:
    print(f"Failed to retrieve data: {response.status_code}")
    print(response.text)
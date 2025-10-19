import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { Footer } from "./Footer";
import farmBg from '../images/farm1.jpeg'; // Ensure this path is correct
import { Bar, Pie } from "react-chartjs-2"; // Import Bar and Pie charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Weather = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [location, setLocation] = useState({ latitude: null, longitude: null });
  const [address, setAddress] = useState(""); // State to store the user's address
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState(null);
  const hasReadAloud = useRef(false); // Track if speech has been triggered
  const [geoData, setGeoData] = useState(null);
  // const [weatherData, setWeatherData] = useState(null)
  const [loading, setLoading] = useState(true);
  const API_KEY = import.meta.env.VITE_OPENWEATHER_API;
  const FLASK_API_URL = 'http://localhost:7000/get_data'; // Matches the Flask server port
  // const API_URL = 'https://localhost:5500/get_weather';

  const fetchGeoData = async (latitude, longitude) => {
    try {
      const response = await axios.get(`${FLASK_API_URL}?lat=${latitude}&lon=${longitude}`);
      setGeoData(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch geospatial data: " + err.message);
      setLoading(false);
    }
  };

  // const fetchWeatherData = async(latitude, longitude) => {
  //   try {
  //     const response = await axios.get(`${API_URL}?lat=${latitude}&lon=${longitude}`);
  //     setWeatherData(response.data)
  //     setLoading(false);
  //   } catch (err) {
  //     setError("Failed to fetch geospatial data: " + err.message);
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
          fetchGeoData(latitude, longitude);
          // fetchWeatherData(latitude, longitude)

          // Fetch 5-day / 3-hour forecast
          fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
          )
            .then((response) => response.json())
            .then((data) => {
              const dailyForecasts = processForecastData(data.list);
              setForecast(dailyForecasts);
            })
            .catch((err) => {
              setError('Failed to fetch weather data.');
            });

          // Fetch the user's address using OpenStreetMap's Nominatim API
          fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
            .then((response) => response.json())
            .then((data) => {
              if (data && data.display_name) {
                setAddress(data.display_name); // Set the formatted address
              } else {
                setAddress("Unable to determine location.");
              }
            })
            .catch((err) => {
              setAddress("Failed to fetch location.");
            });
        },
        (err) => {
          setError(err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  }, [API_KEY]);

  useEffect(() => {
    // Only read aloud if forecast data is available and hasn't been read yet
    if (forecast.length > 0 && !hasReadAloud.current) {
      readForecastAloud(forecast);
      hasReadAloud.current = true; // Mark as read
    }
  }, [forecast]); // Run only when forecast changes

  const processForecastData = (forecastList) => {
    const dailyForecasts = [];
    const seenDays = new Set();

    forecastList.forEach((item) => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      if (!seenDays.has(date) && dailyForecasts.length < 7) {
        seenDays.add(date);
        dailyForecasts.push({
          date: date,
          temperature: item.main.temp,
          description: item.weather[0].description,
          icon: item.weather[0].icon,
        });
      }
    });

    return dailyForecasts;
  };

  // Update this to use the real data from the Flask API
  const getBarChartData = () => {
    if (!geoData) return {
      labels: ["Organic Carbon Density", "Inorganic Carbon Density"],
      datasets: [
        {
          label: "Carbon Density (kg/km³)",
          data: [0, 0],
          backgroundColor: ["#4CAF50", "#FFC107"],
          borderColor: ["#388E3C", "#FFA000"],
          borderWidth: 1,
        },
      ],
    };

    return {
      labels: ["Organic Carbon Density", "Inorganic Carbon Density"],
      datasets: [
        {
          label: "Carbon Density (kg/km³)",
          data: [geoData.organic_carbon_density || 0, geoData.inorganic_carbon_density || 0],
          backgroundColor: ["#4CAF50", "#FFC107"],
          borderColor: ["#388E3C", "#FFA000"],
          borderWidth: 1,
        },
      ],
    };
  };

  const getPieChartData = () => {
    if (!geoData) return {
      labels: ["Net Sown Area", "Unsown Areas"],
      datasets: [
        {
          label: "Net Sown Area (%)",
          data: [0, 100],
          backgroundColor: ["#36A2EB", "#FF6384"],
          borderColor: ["#36A2EB", "#FF6384"],
          borderWidth: 1,
        },
      ],
    };

    const netSownArea = geoData.net_sown_area || 0;

    return {
      labels: ["Net Sown Area", "Unsown Areas"],
      datasets: [
        {
          label: "Net Sown Area (%)",
          data: [netSownArea, 100 - netSownArea],
          backgroundColor: ["#36A2EB", "#FF6384"],
          borderColor: ["#36A2EB", "#FF6384"],
          borderWidth: 1,
        },
      ],
    };
  };

  const getSeasonDistributionData = () => {
    if (!geoData) return {
      labels: ["Kharif", "Rabi"],
      datasets: [
        {
          label: "Time (%)",
          data: [0, 100],
          backgroundColor: ["#36A2EB", "#4BC0C0"],
          borderColor: ["#36A2EB", "#4BC0C0"],
          borderWidth: 1,
        },
      ],
    };

    const kharif = geoData.kharif || 0;
    const rabi = geoData.rabi || 0;
    const total = kharif + rabi;

    if (total === 0) return {
      labels: ["Kharif", "Rabi"],
      datasets: [
        {
          label: "Time (%)",
          data: [50, 50],
          backgroundColor: ["#36A2EB", "#4BC0C0"],
          borderColor: ["#36A2EB", "#4BC0C0"],
          borderWidth: 1,
        },
      ],
    };

    const kharifPercentage = (kharif / total) * 100;

    return {
      labels: ["Kharif", "Rabi"],
      datasets: [
        {
          label: "Time (%)",
          data: [kharifPercentage, 100 - kharifPercentage],
          backgroundColor: ["#36A2EB", "#FF6384"],
          borderColor: ["#36A2EB", "#FF6384"],
          borderWidth: 1,
        },
      ],
    };
  };

  // Options for the bar chart
  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Carbon Density Levels",
      },
    },
  };

  // Options for the pie chart
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Net Sown Area Distribution",
      },
    },
  };

  const readForecastAloud = (forecast) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance();
      let forecastText = "Here is the weather forecast for the next few days. ";

      forecast.forEach((day, index) => {
        forecastText += `On ${day.date}, the temperature will be ${day.temperature} degrees Celsius with ${day.description}. `;
      });

      utterance.text = forecastText;
      utterance.lang = 'en-US';
      utterance.rate = 1; // Speed of speech
      utterance.pitch = 1; // Pitch of speech

      speechSynthesis.speak(utterance);
    } else {
      console.error('Speech synthesis not supported in this browser.');
    }
  };

  return (
    <div
      className="w-screen h-screen relative flex flex-col overflow-x-hidden"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 bg-white text-[#131811] transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 z-30`}
      >
        <div className="p-6 relative">
          <h2 className="text-xl font-bold text-[#131811]">AgriVision AI</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-[#131811] text-xl"
          >
            &#10005;
          </button>
          <nav className="mt-8 space-y-4">
            <a onClick={() => {
              navigate("/welcome");
              setSidebarOpen(false);
            }} className="block text-base font-medium text-[#131811] hover:underline cursor-pointer">
              Home
            </a>
            <a onClick={() => {
              navigate("/Contact");
              setSidebarOpen(false);
            }} className="block text-base font-medium text-[#131811] hover:underline cursor-pointer">
              Contact Us
            </a>
            <a href="#" className="block text-base font-medium text-[#131811] hover:underline">
              Logout
            </a>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <header className="flex items-center justify-between w-full border-b border-solid border-[#f2f4f0] px-8 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-[#131811]">
              <div className="size-8">
                <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24 4H6V17.3333V30.6667H24V44H42V30.6667V17.3333H24V4Z"
                    fill="currentColor"
                  ></path>
                </svg>
              </div>
              <h2 className="text-[#131811] text-xl font-bold">AgroVision</h2>
            </div>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="sm:hidden text-[#131811] text-2xl"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            &#9776;
          </button>

          {/* Desktop menu */}
          <nav className="hidden sm:flex gap-8">
            <a className="text-[#131811] text-base font-medium cursor-pointer" onClick={() => navigate("/welcome")}>
              Home
            </a>
            <a className="text-[#131811] text-base font-medium cursor-pointer" onClick={() => navigate("/Contact")}>
              Contact Us
            </a>
            <a className="text-[#131811] text-base font-medium" href="#">
              Logout
            </a>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 justify-center py-5 w-full" style={{ paddingBottom: "100px" }}>
          <div className="flex flex-col flex-1 w-full max-w-[900px] px-4">
            <h1 className="text-2xl font-bold text-[#131811] mb-6">Weather Forecast</h1>
            {error ? (
              <p>Error: {error}</p>
            ) : (
              <>

                {/* User Location Section in a Card */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                  <h2 className="text-xl font-bold text-[#131811] mb-2">Your Location</h2>
                  {address ? (
                    <p className="text-sm text-gray-600">{address}</p>
                  ) : (
                    <p className="text-sm text-gray-600">Fetching your location...</p>
                  )}
                </div>

                {/* Geospatial Data Section */}
                <div className=" bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-bold text-[#131811] mb-4">Geospatial Data</h2>
                  {loading ? (
                    <p>Loading geospatial data...</p>
                  ) : error ? (
                    <p>Error: {error}</p>
                  ) : geoData ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {Object.entries(geoData)
                        .filter(([key]) =>
                        ["soil_type","soil_depth","vegetation_fraction"].includes(key)
                        )
                        .map(([key, value]) => (
                        <div key={key} className="bg-gray-50 p-4 rounded-lg">
                          <h3 className="font-medium text-[#131811] capitalize">{key.replace(/_/g, ' ')}</h3>
                          <p className="text-sm text-gray-600">{typeof value === 'number' ? value.toFixed(2) : value}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No geospatial data available.</p>
                  )}
                </div>

                {/* Erosion and Logging Section */}
                    <div className="mt-8 bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-bold text-[#131811] mb-4">Risk Factors</h2>
                    {geoData ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {[
                            { key: "water_erosion", label: "Water Erosion", value: geoData.water_erosion || 0 },
                            { key: "water_logging", label: "Water Logging", value: geoData.water_logging || 0 },
                            { key: "wind_erosion", label: "Wind Erosion", value: geoData.wind_erosion || 0 },
                        ].map(({ key, label, value }) => (
                            <div key={key} className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="font-medium text-[#131811]">{label}</h3>
                            <p
                                className={`text-sm font-bold ${
                                value < 30
                                    ? "text-black"
                                    : value < 60
                                    ? "text-yellow-500"
                                    : value < 80
                                    ? "text-orange-500"
                                    : "text-red-500"
                                }`}
                            >
                                {value.toFixed(2)}%
                            </p>
                            </div>
                        ))}
                        </div>
                    ) : (
                        <p>No erosion or logging data available.</p>
                    )}
                    </div>

                {/* Bar Chart Section */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-[#131811] mb-4 text-center">Carbon Density Levels</h2>
                  <Bar data={getBarChartData()} options={barChartOptions} />
                </div>

                {/* Pie Chart Section */}
                <div className="mt-8 flex flex-col items-center">
                  <h2 className="text-xl font-bold text-[#131811] mb-4">Insights</h2>
                  <div className="flex flex-wrap justify-center gap-8">
                    {/* Net Sown Area Pie Chart */}
                    <div style={{ width: "350px", height: "350px" }}>
                      <h3 className="text-lg font-bold text-[#131811] mb-2 text-center">Area</h3>
                      <Pie data={getPieChartData()} options={pieChartOptions} />
                    </div>

                    {/* Season Distribution Pie Chart */}
                    <div style={{ width: "350px", height: "350px" }}>
                      <h3 className="text-lg font-bold text-[#131811] mb-2 text-center">Season Distribution</h3>
                      <Pie
                        data={getSeasonDistributionData()}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                            title: {
                              display: true,
                              text: "Rabi/Kharif Distribution",
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Surface Runoff and Water Transpiration Section */}
                <div className="mt-14 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-[#131811] mb-4 text-center">Water Metrics</h2>
                  {geoData ? (
                    <div className="flex flex-wrap justify-center gap-6">
                      {[
                        { key: "surface_runoff", label: "Surface Runoff", value: geoData.surface_runoff || 0, color: "text-green-500" },
                        { key: "evapotranspiration", label: "Water Transpiration", value: geoData.water_transpiration || 0, color: "text-blue-500" },
                      ].map(({ key, label, value, color }) => (
                        <div
                          key={key}
                          className="bg-gray-50 p-6 w-64 h-26 rounded-lg flex flex-col items-center justify-center shadow-md"
                        >
                          <h3 className="font-medium text-[#131811] mb-2 text-center">{label}</h3>
                          <p className={`text-lg font-bold ${color}`}>
                            {value.toFixed(2)}%
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center">No water metrics data available.</p>
                  )}
                </div>

                {/* Combined Moisture Box */}
                <div className="mt-8">
                  <h2 className="text-xl font-bold text-[#131811] mb-4 text-center">Surface Moisture Levels</h2>
                  <div className="w-full max-w-[600px] h-24 bg-gray-200 rounded-lg overflow-hidden mx-auto shadow-md relative">
                    {/* Upper-Level Moisture */}
                    <div
                      style={{ width: "45%" }} // Adjust width based on the percentage (e.g., 45%)
                      className="h-1/2 bg-[#8B4513] flex items-center justify-left text-white text-sm font-bold pl-4"
                      title="Upper Level"
                    >
                      Upper Level
                    </div>
                    {/* Root-Level Moisture */}
                    <div
                      style={{ width: "65%" }} // Adjust width based on the percentage (e.g., 65%)
                      className="h-1/2 bg-[#A0522D] flex items-center justify-left text-white text-sm font-bold pl-4"
                      title="Root Level"
                    >
                      Root Level
                    </div>
                  </div>
                </div>

                {/* Embed weather.html */}
                <div className="mt-8 flex justify-center">
                  <iframe
                    src="/Output/weather.html"
                    title="Weather Visualization"
                    className="w-full max-w-4xl h-[819px] border rounded-lg shadow-md"
                  ></iframe>
                </div>


                <div className="mt-8 flex justify-center">
                  <iframe
                    src="/weather_avg_graph.html"
                    title="Weather Visualization"
                    className="w-[1600px] h-[600px] border rounded-lg shadow-md"
                  ></iframe>
                </div>


                {/* Button to navigate to Croppred.jsx */}
                <div className="mt-8 flex justify-center">
                  <button
                    onClick={() => navigate("/croppred")}
                    className="bg-[#80e619] text-white font-bold py-2 px-6 rounded-lg hover:bg-[#6dbf15] transition-colors"
                  >
                    Upload Soil Report
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Weather;
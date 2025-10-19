import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";

import { Footer } from './Footer'; // Import Footer component
import { NavBar } from './Navbar'; // Import Navbar component

const Market = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [marketData, setMarketData] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar state

  // Base URL for backend API - using port 1111 as specified
  const API_BASE_URL = 'http://localhost:1111';

  // Get user location on component mount
  useEffect(() => {
    const getUserLocation = () => {
      setLoading(true);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lon: longitude });
            fetchMarketData(latitude, longitude);
          },
          (error) => {
            console.error('Error getting location:', error);
            setError('Unable to get your location. Please enable location services or enter your coordinates manually.');
            setLoading(false);
          }
        );
      } else {
        setError('Geolocation is not supported by your browser.');
        setLoading(false);
      }
    };

    getUserLocation();
  }, []);

  // Fetch market data based on user location
  const fetchMarketData = async (lat, lon) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/get_market`, {
        params: { lat, lon },
      });

      setMarketData(response.data);
      // Set the first crop as selected by default if available
      if (response.data.crop_summaries && response.data.crop_summaries.length > 0) {
        setSelectedCrop(response.data.crop_summaries[0]);
      }

      setLoading(false);
    } catch (err) {
      console.error('Error fetching market data:', err);
      setError('Failed to fetch market data. Please try again later.');
      setLoading(false);
    }
  };

  // Handle manual location input
  const handleManualLocationSubmit = (e) => {
    e.preventDefault();
    const lat = parseFloat(e.target.latitude.value);
    const lon = parseFloat(e.target.longitude.value);

    if (isNaN(lat) || isNaN(lon)) {
      setError('Please enter valid coordinates.');
      return;
    }

    setUserLocation({ lat, lon });
    fetchMarketData(lat, lon);
  };

  // Format price trend with color coding
  const formatTrend = (trend) => {
    if (isNaN(trend)) return 'N/A';

    const color = trend >= 0 ? 'text-green-500' : 'text-red-500';
    const arrow = trend >= 0 ? '↑' : '↓';

    return (
      <span className={color}>
        {arrow} {Math.abs(trend).toFixed(2)}%
      </span>
    );
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
          <h2 className="text-xl font-bold text-[#131811]">AgroVision</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-[#131811] text-xl"
          >
            &#10005;
          </button>
          <nav className="mt-8 space-y-4">
            <a
              onClick={() => {
                navigate("/welcome");
                setSidebarOpen(false);
              }}
              className="block text-base font-medium text-[#131811] hover:underline"
            >
              Home
            </a>
            <a
              onClick={() => {
                navigate("/Contact");
                setSidebarOpen(false);
              }}
              className="block text-base font-medium text-[#131811] hover:underline"
            >
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
        <header className="flex items-center bg-white justify-between w-full border-b border-solid border-[#f2f4f0] px-8 py-4">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-[#131811]">
              <div className="size-8">
                <svg
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
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
            <a
              className="text-[#131811] text-base font-medium"
              href="#"
              onClick={() => navigate("/welcome")}
            >
              Home
            </a>
            <a
              className="text-[#131811] text-base font-medium"
              href="#"
              onClick={() => navigate("/Contact")}
            >
              Contact Us
            </a>
            <a className="text-[#131811] text-base font-medium" href="#">
              Logout
            </a>
          </nav>
        </header>

        {/* Market Analysis Section */}
        <div className="min-h-screen bg-gray-100 py-8 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Crop Market Analysis</h1>
              <p className="text-gray-600">
                Get insights on crop prices, trends, and forecasts based on your location
              </p>
              
              {/* Location Input */}
              <div className="mt-4">
                {userLocation ? (
                  <div className="flex items-center mb-4">
                    <div className="bg-blue-100 text-blue-800 py-2 px-4 rounded-md">
                      <span className="font-medium">Current Location:</span> Lat: {userLocation.lat.toFixed(4)}, Lon: {userLocation.lon.toFixed(4)}
                    </div>
                    <button 
                      onClick={() => {
                        setUserLocation(null);
                        setMarketData(null);
                        setSelectedCrop(null);
                      }}
                      className="ml-4 text-sm text-blue-600 hover:underline"
                    >
                      Change Location
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleManualLocationSubmit} className="flex flex-col md:flex-row gap-3">
                    <div>
                      <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <input
                        type="text"
                        id="latitude"
                        name="latitude"
                        placeholder="e.g. 28.6139"
                        className="p-2 border border-gray-300 rounded-md w-full md:w-40"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <input
                        type="text"
                        id="longitude"
                        name="longitude"
                        placeholder="e.g. 77.2090"
                        className="p-2 border border-gray-300 rounded-md w-full md:w-40"
                        required
                      />
                    </div>
                    <div className="self-end">
                      <button 
                        type="submit" 
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                      >
                        Get Market Data
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-700">Loading market data...</span>
              </div>
            )}
            
            {/* Error Message */}
            {error && !loading && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
                <p>{error}</p>
              </div>
            )}
            
            {/* Market Data */}
            {marketData && !loading && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overall Summary */}
                <div className="lg:col-span-3 bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Market Overview</h2>
                  <div className="whitespace-pre-line text-gray-700">
                    {marketData.overall_summary}
                  </div>
                </div>
                
                {/* Crop List */}
                <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-1">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Crop List</h2>
                  {marketData.crop_summaries && marketData.crop_summaries.length > 0 ? (
                    <div className="overflow-y-auto max-h-96">
                      <ul className="divide-y divide-gray-200">
                        {marketData.crop_summaries.map((crop) => (
                          <li 
                            key={crop.Crop} 
                            className={`py-3 px-2 cursor-pointer hover:bg-gray-50 ${selectedCrop?.Crop === crop.Crop ? 'bg-blue-50' : ''}`}
                            onClick={() => setSelectedCrop(crop)}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{crop.Crop}</span>
                              <span className="text-sm">
                                {formatTrend(crop["Long Term Trend (%)"])}
                              </span>
                            </div>
                            <div className="mt-1 text-sm text-gray-500">
                              ₹{crop["Current Price"]} per quintal
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-gray-500">No crop data available.</p>
                  )}
                </div>
                
                {/* Crop Details */}
                <div className="lg:col-span-2">
                  {selectedCrop ? (
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">{selectedCrop.Crop}</h2>
                        <div className="text-gray-500 text-sm">
                          <span>Growth Period: </span>
                          <span className="font-medium">
                            {selectedCrop["Sowing Month"] || 'N/A'} to {selectedCrop["Harvest Month"] || 'N/A'} 
                            ({selectedCrop["Growth Duration (Months)"] || 'N/A'} months)
                          </span>
                        </div>
                      </div>
                      
                      {/* Current Price & Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-gray-500 text-sm mb-1">Current Price</div>
                          <div className="text-3xl font-bold text-gray-800">
                            ₹{selectedCrop["Current Price"]}
                            <span className="text-sm font-normal text-gray-500 ml-1">per quintal</span>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                            <div>
                              <div className="text-xs text-gray-500">MIN</div>
                              <div className="font-medium">₹{selectedCrop["Min Price"]}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">AVG</div>
                              <div className="font-medium">₹{selectedCrop["Avg Price"]}</div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-500">MAX</div>
                              <div className="font-medium">₹{selectedCrop["Max Price"]}</div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-gray-500 text-sm mb-1">Year-over-Year</div>
                          <div className="flex items-baseline">
                            <div className="text-2xl font-bold">
                              {formatTrend(selectedCrop["YoY Change (%)"])}
                            </div>
                            <div className="ml-2 text-gray-500 text-sm">
                              from ₹{selectedCrop["Last Year Avg Price"]}
                            </div>
                          </div>
                          
                          <div className="mt-4 text-sm">
                            <div className="text-gray-500 mb-1">Volatility</div>
                            <div className="font-medium">
                              {selectedCrop["Price Volatility (%)"].toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Price Forecast */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Forecast</h3>
                        
                        <div className="overflow-x-auto">
                          <table className="min-w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="py-2 px-4 border-b text-left">Period</th>
                                <th className="py-2 px-4 border-b text-right">Forecasted Price</th>
                                <th className="py-2 px-4 border-b text-right">Change</th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr>
                                <td className="py-3 px-4 border-b">Next Month</td>
                                <td className="py-3 px-4 border-b text-right">
                                  ₹{selectedCrop["Forecasted Price (Next Month)"]}
                                </td>
                                <td className="py-3 px-4 border-b text-right">
                                  {formatTrend(selectedCrop["Short Term Trend (%)"])}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 px-4 border-b">6 Months</td>
                                <td className="py-3 px-4 border-b text-right">
                                  ₹{selectedCrop["Forecasted Price (6 Months)"]}
                                </td>
                                <td className="py-3 px-4 border-b text-right">
                                  {formatTrend(selectedCrop["Mid Term Trend (%)"])}
                                </td>
                              </tr>
                              <tr>
                                <td className="py-3 px-4 border-b">1 Year</td>
                                <td className="py-3 px-4 border-b text-right">
                                  ₹{selectedCrop["Forecasted Price (1 Year)"]}
                                </td>
                                <td className="py-3 px-4 border-b text-right">
                                  {formatTrend(selectedCrop["Long Term Trend (%)"])}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                      
                      {/* Image */}
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Price Trend & Forecast</h3>
                        <div className="border rounded-lg overflow-hidden">
                          <img 
                            src={`${API_BASE_URL}/output/${selectedCrop.Crop}_forecast.png`} 
                            alt={`${selectedCrop.Crop} price forecast`}
                            className="w-full h-auto"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/api/placeholder/800/400";
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-md p-6 flex justify-center items-center h-full">
                      <p className="text-gray-500">Select a crop from the list to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Market;
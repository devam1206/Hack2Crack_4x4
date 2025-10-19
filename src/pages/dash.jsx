import React from "react";
import { useNavigate } from "react-router-dom";

const FrontPage = () => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate("/Weather");
  };

  return (
    <div className="w-screen h-screen relative">
      {/* Background with Blur */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('./src/assets/7JCR.gif')", // Path to your GIF
          backgroundSize: "cover", // Ensures the GIF covers the entire screen
          backgroundRepeat: "no-repeat", // Prevents the GIF from repeating
          backgroundPosition: "center", // Centers the GIF
          zIndex: -1, // Places the background behind the content
        }}
      >
        {/* Apply blur effect using a child div */}
        <div
          className="absolute inset-0"
          style={{
            backdropFilter: "blur(8px)", // Applies blur effect to the background
            WebkitBackdropFilter: "blur(8px)", // Ensures compatibility with Safari
          }}
        ></div>
      </div>

      {/* Overlay to remove blur from text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-black bg-opacity-50">
        {/* Header Section */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-6">
          Welcome to AgriVision AI
        </h1>
        <p className="text-lg sm:text-xl text-gray-200 max-w-2xl mb-8">
          Empowering farmers with AI-driven insights for sustainable agriculture. Explore geoweather insights to make informed decisions for your crops.
        </p>

        {/* Navigate Button */}
        <button
          onClick={handleNavigate}
          className="bg-[#80e619] hover:bg-[#6cc017] text-white font-bold py-3 px-6 rounded-lg text-lg shadow-md transition duration-300"
        >
          Explore Geoweather Insights
        </button>
      </div>
    </div>
  );
};

export default FrontPage;

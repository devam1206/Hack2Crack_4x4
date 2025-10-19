import React, { useState, useEffect } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { auth } from "../functions/firebase"; // Import Firebase auth
import { Footer } from "./Footer";
import ChatbotPopup from "./ChatbotPopup";

const Welcome = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(""); // State to store the user's name or email
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        // Reload the user to ensure the latest data is fetched
        await user.reload();
        setUserName(user.displayName || user.email); // Use displayName if available, otherwise email
      }
    };

    fetchUser();
  }, []);

  const cards = [
    {
      title: "Market Data Analytics",
      description: "Analyze market trends and make informed decisions with AgriVision AI.",
      imageUrl: "/market.png", // Updated image URL
      onClick: () => navigate("/Market"),
    },
    {
      title: "Disease",
      description: "Identify and diagnose diseases in your crops using Agri AI's technology.",
      imageUrl: "https://cdn.usegalileo.ai/sdxl10/1335d8be-6160-4bd0-b4b4-b6a29a3f43b3.png",
      onClick: () => navigate("/Disease"),
    },
    {
      title: "Your Soil Report",
      description: "Get insights into your crop yield with our advanced prediction models.",
      imageUrl: "https://cdn.usegalileo.ai/sdxl10/d1cb9829-f26b-41f2-88d0-e072ccf1d9f0.png",
      onClick: () => navigate("/Croppred"),
    },
    {
      title: "GeoWeather Insights",
      description: "Plan ahead with our accurate weather forecasts for your fields.",
      imageUrl: "https://cdn.usegalileo.ai/sdxl10/a83fd6db-3b68-4fb7-b378-1501506d2455.png",
      onClick: () => navigate("/Weather"),
    },
  ];

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
          <h2 className="text-xl font-bold text-[#131811]">AgriVision</h2>
          <button
            onClick={() => setSidebarOpen(false)}
            className="absolute top-4 right-4 text-[#131811] text-xl"
          >
            &#10005;
          </button>
          <nav className="mt-8 space-y-4">
            <a onClick={() => {
      navigate("/");
      setSidebarOpen(false);
    }} className="block text-base font-medium text-[#131811] hover:underline">
              Home
            </a>
            <a onClick={() => {
      navigate("/Contact");
      setSidebarOpen(false);
    }} className="block text-base font-medium text-[#131811] hover:underline">
              Contact Us
            </a>
            <span className="block text-base font-medium text-[#131811]">
              Hello, {userName || "Guest"}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col w-full h-full">
        {/* Header */}
        <header className="flex items-center justify-between w-full bg-white border-b border-solid border-[#f2f4f0] px-8 py-4">
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
              <h2 className="text-[#131811] text-xl font-bold">AgriVision</h2>
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
            <a className="text-[#131811] text-base font-medium" href="#">
              Home
            </a>
            <a className="text-[#131811] text-base font-medium" href="#" onClick={() => navigate("/Contact")}>
              Contact Us
            </a>
            <span className="text-[#131811] text-base font-medium">
              Hello, {userName || "Guest"}
            </span>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 justify-center py-5 w-full">
          <div className="flex flex-col flex-1 w-full max-w-[900px] px-4">
            <Banner />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center bg-white shadow-md rounded-lg cursor-pointer"
                  onClick={card.onClick}
                >
                  <div className="w-full h-48 overflow-hidden rounded-t-lg">
                    <img src={card.imageUrl} alt={card.title} className="w-full h-full object-cover rounded-image" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-[#131811]">{card.title}</h3>
                    <p className="text-sm text-gray-600">{card.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ChatbotPopup />
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

const Banner = () => (
  <div className="w-full">
    <div className="w-full p-4">
      <div
        className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-start justify-end px-4 pb-10"
        style={{
          backgroundImage:
            'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://cdn.usegalileo.ai/sdxl10/c62c0803-34ba-4761-ba9f-a57dc1b33123.png")',
        }}
      >
        <div className="flex flex-col gap-2 text-left">
          <h1 className="text-white text-2xl font-black leading-tight tracking-wide sm:text-4xl whitespace-normal">
            The Future of Crop Management is Here
          </h1>
          <h2 className="text-white text-xs font-normal sm:text-sm">
            AgriVision AI offers a suite of AI-powered tools to help you monitor and manage your crops. From disease
            detection to weather forecasts, our platform has everything you need to optimize your farm's performance.
          </h2>
        </div>
      </div>
    </div>
  </div>
);

export default Welcome;
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";

const Contact = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const hosts = [
    { name: 'Devam Desai', email: 'devamdesai126@gmail.com', phone: '8369778331' },
    { name: 'Rajat Masanagi', email: 'raj.mas@gmail.com', phone: '7045128451' },
    { name: 'Preitish Fondelekar', email: 'pre.fon@gmail.com', phone: '8657525174' },
    { name: 'Aadarsh Kumar', email: 'aad.kum@gmail.com', phone: '7021263525' }
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
    setSidebarOpen(false); // Close sidebar after navigating
  }}className="block text-base font-medium text-[#131811] hover:underline">
              Home
            </a>
            <a onClick={() => {
      navigate("/Contact");
      setSidebarOpen(false);
    }} className="block text-base font-medium text-[#131811] hover:underline">
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
            <a className="text-[#131811] text-base font-medium" href="#" onClick={() => navigate("/welcome")}>
              Home
            </a>
            <a className="text-[#131811] text-base font-medium" href="#" onClick={() => navigate("/Contact")}>
              Contact Us
            </a>
            <a className="text-[#131811] text-base font-medium" href="#">
              Logout
            </a>
          </nav>
        </header>

        {/* Main Content */}
        <div className="flex flex-1 justify-center py-5 w-full">
          <div className="flex flex-col flex-1 w-full max-w-[900px] px-4">
            <h1 className="text-2xl font-bold text-[#131811] mb-6">Contact Us</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {hosts.map((host, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg p-6">
                  <h2 className="text-xl font-bold text-[#131811] mb-2">{host.name}</h2>
                  <p className="text-sm text-gray-600 mb-2">
                    Email: <a href={`mailto:${host.email}`} className="text-[#73974e] hover:underline">{host.email}</a>
                  </p>
                  <p className="text-sm text-gray-600">Phone: {host.phone}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};


export default Contact;
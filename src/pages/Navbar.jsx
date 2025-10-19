import React from 'react';
import { handleLogout } from '../functions/sign';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import the CSS for toast notifications
import Contact from './Contact';

export const NavBar = () => {  // Add 'export' keyword here
  // Handle logout
  const handleLogoutClick = async () => {
    try {
      await handleLogout();
      // Show success toast
      toast.success('Logout successful!');
      // Optionally, redirect the user or update the UI after logout
    } catch (error) {
      // Show error toast
      console.log(error)
      toast.error(`Logout failed: ${error.message}`);
    }
  };

  return (
    <header className="flex items-center justify-between w-full border-b border-solid border-[#f2f4f0] px-8 py-4">
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
          <h2 className="text-[#131811] text-xl font-bold">AgriVision AI</h2>
        </div>
      </div>
      <nav className="flex gap-8">
        <a className="text-[#131811] text-base font-medium" href="#" onClick={() => navigate("/welcome")}>
          Home
        </a>
        <a className="text-[#131811] text-base font-medium" href="#" onClick={() => navigate("/Contact")}>
          Contact Us
        </a>
        <a
          className="text-[#131811] text-base font-medium cursor-pointer"
          onClick={handleLogoutClick}
        >
          Logout
        </a>
      </nav>
    </header>
  );
};
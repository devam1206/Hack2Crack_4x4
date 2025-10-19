import React from 'react';

export const Footer = () => {
  return (
    <footer className="w-full bg-[#f2f4f0] py-6 px-4 border-t border-solid border-[#e5e7eb]">
      <div className="max-w-screen-lg mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
          <p className="text-[#131811] text-xs sm:text-sm font-medium">
            &copy; 2025 AgriVision. All Rights Reserved.
          </p>
          <p className="text-[#131811] text-xs sm:text-sm mt-1">
            Empowering farmers with AI-driven insights for sustainable agriculture.
          </p>
        </div>
        <div className="flex gap-4 text-[#131811] text-xs sm:text-sm font-medium">
          <a href="#" className="hover:underline">
            Privacy Policy
          </a>
          <a href="#" className="hover:underline">
            Terms of Service
          </a>
          <a href="#" className="hover:underline">
            Support
          </a>
        </div>
        <div className="flex gap-3">
          <a href="#" aria-label="Facebook" className="hover:text-[#80e619]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path d="M22.675 0h-21.35C.598 0 0 .598 0 1.325v21.351C0 23.403.598 24 1.325 24h11.495v-9.294H9.691V11.08h3.129V8.413c0-3.1 1.894-4.788 4.658-4.788 1.325 0 2.464.099 2.794.143v3.24h-1.918c-1.505 0-1.796.715-1.796 1.763v2.311h3.59l-.467 3.626h-3.123V24h6.127c.728 0 1.325-.598 1.325-1.324V1.325C24 .598 23.403 0 22.675 0z" />
            </svg>
          </a>
          <a href="#" aria-label="X" className="hover:text-[#80e619]">
            <svg
              xmlns="http://www.w3.org/2000/svg" 
              fill="currentColor"
              viewBox="0 0 24 24"
              width="20" 
              height="20"
            >
              <path d="M23.954 4.569c-.885.389-1.83.654-2.825.775 1.014-.611 1.794-1.574 2.163-2.723-.951.555-2.005.959-3.127 1.184-.896-.959-2.173-1.559-3.591-1.559-2.717 0-4.92 2.203-4.92 4.917 0 .39.045.765.127 1.124C7.691 8.094 4.066 6.13 1.64 3.161c-.427.722-.666 1.561-.666 2.475 0 1.71.87 3.213 2.188 4.096-.807-.026-1.566-.248-2.228-.616v.061c0 2.385 1.693 4.374 3.946 4.827-.413.111-.849.171-1.296.171-.314 0-.615-.03-.916-.086.631 1.953 2.445 3.377 4.604 3.417-1.68 1.319-3.809 2.105-6.102 2.105-.39 0-.779-.023-1.17-.067 2.189 1.394 4.768 2.209 7.557 2.209 9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63.961-.689 1.8-1.56 2.46-2.548l-.047-.02z"/>
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
};
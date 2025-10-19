import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleEmailLogin, handleGoogleSignup } from '../functions/sign';
import { toast } from 'react-toastify';
import { Footer } from './Footer';

const SignIn = () => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar
  const navigate = useNavigate();

  // Handle email/password login
  const handleEmailLoginClick = async () => {
    try {
      const response = await handleEmailLogin(email, password);
      if (response.success) {
        toast.success('Login successful! Welcome back!');
        navigate('/welcome');
      }
    } catch (error) {
      toast.error(`Login failed: ${error.message}`);
    }
  };

  // Handle Google login
  const handleGoogleLoginClick = async () => {
    try {
      await handleGoogleSignup();
      toast.success('Google login successful! Welcome back!');
      navigate('/welcome');
    } catch (error) {
      toast.error(`Google login failed: ${error.message}`);
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
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
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
            <a
              onClick={() => {
                navigate('/welcome');
                setSidebarOpen(false); // Close sidebar after navigating
              }}
              className="block text-base font-medium text-[#131811] hover:underline"
            >
              Home
            </a>
            <a
              onClick={() => {
                navigate('/Contact');
                setSidebarOpen(false);
              }}
              className="block text-base font-medium text-[#131811] hover:underline"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="block text-base font-medium text-[#131811] hover:underline"
            >
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
        </header>

        {/* Login Form */}
        <div className="flex flex-1 justify-center py-5 w-full">
          <div className="flex flex-col flex-1 w-full max-w-[512px] px-4">
            <h3 className="text-[#111418] tracking-light text-2xl font-bold leading-tight text-center pb-2 pt-5">
              Log in to your account
            </h3>
            <div className="flex flex-col w-full max-w-[480px] gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Email</p>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="form-input flex w-full resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </label>
            </div>
            <div className="flex flex-col w-full max-w-[480px] gap-4 px-4 py-3">
              <label className="flex flex-col w-full">
                <p className="text-[#111418] text-base font-medium leading-normal pb-2">Password</p>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="form-input flex w-full resize-none overflow-hidden rounded-xl text-[#111418] focus:outline-0 focus:ring-0 border border-[#dce0e5] bg-white focus:border-[#dce0e5] h-14 placeholder:text-[#637588] p-[15px] text-base font-normal leading-normal"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
            </div>
            <div className="w-full max-w-[480px] px-4 py-3">
              <button
                className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 px-4 bg-[#1980e6] text-white text-sm font-bold leading-normal tracking-[0.015em]"
                onClick={handleEmailLoginClick}
              >
                <span className="truncate">Log in</span>
              </button>
            </div>
            {/* Google Login Button */}
            <div className="w-full max-w-[480px] px-4 py-3">
              <button
                className="flex w-full cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-xl h-10 px-4 bg-[#f0f2f4] text-[#111418] text-sm font-bold leading-normal tracking-[0.015em] border border-[#dce0e5]"
                onClick={handleGoogleLoginClick}
              >
                <span className="truncate">Log in with Google</span>
              </button>
            </div>
            <p className="text-[#637588] text-sm font-normal leading-normal pb-3 pt-1 px-4 text-center">
              Don't have an account? <a href="/" className="text-[#1980e6]">Sign up</a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default SignIn;
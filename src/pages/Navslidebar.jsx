{/* Sidebar for mobile */}
<div
className={`fixed left-0 top-0 h-full w-64 bg-white text-[#131811] transform ${
  sidebarOpen ? "translate-x-0" : "-translate-x-full"
} transition-transform duration-300 z-30`}
>
<div className="p-6 relative">
  <h2 className="text-xl font-bold text-[#131811]">AgriVision AI</h2>
  <button
    onClick={() => setSidebarOpen(false)} // Close the sidebar
    className="absolute top-4 right-4 text-[#131811] text-xl"
  >
    &#10005; {/* Cross icon */}
  </button>
  <nav className="mt-8 space-y-4">
    <a href="#" className="block text-base font-medium text-[#131811] hover:underline">
      Home
    </a>
    <a href="#" className="block text-base font-medium text-[#131811] hover:underline">
      Contact Us
    </a>
    <a href="#" className="block text-base font-medium text-[#131811] hover:underline">
      Logout
    </a>
  </nav>
</div>
</div>

{/* Main content */}
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
      <h2 className="text-[#131811] text-xl font-bold">AgriVision AI</h2>
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
    <a className="text-[#131811] text-base font-medium" href="#">
      Contact Us
    </a>
    <a className="text-[#131811] text-base font-medium" href="#">
      Logout
    </a>
  </nav>
</header>
</div>
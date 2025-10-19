import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState(null); // Shared state

  return (
    <AppContext.Provider value={{ weatherData, setWeatherData }}>
      {children}
    </AppContext.Provider>
  );
};
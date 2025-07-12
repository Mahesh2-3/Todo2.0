"use client"
import { createContext, useContext, useState } from "react";

// 1. Create the context
const LoadingContext = createContext();

// 2. Create the provider
export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);

  return (
    <LoadingContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// 3. Custom hook to use the loading context
export const useLoading = () => useContext(LoadingContext);

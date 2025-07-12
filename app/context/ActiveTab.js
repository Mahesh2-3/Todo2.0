"use client";
import { createContext, useContext, useState } from "react";

// 1. Create the context
const ActiveTabContext = createContext();

// 2. Create the provider
export const TabProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState("Daily Task");

  return (
    <ActiveTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ActiveTabContext.Provider>
  );
};

// 3. Custom hook to use the context
export const useActiveTab = () => useContext(ActiveTabContext);

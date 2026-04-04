"use client";
import React, { useState } from "react";
import { FaBell, FaMoon, FaSun } from "react-icons/fa";
import { useTheme } from "next-themes";
import Image from "next/image";
import { getToday, getTodayDate } from "../lib/dateUtils";
import { useEffect } from "react";

const Navbar = ({ notifi }) => {
  const [NotificationsOn, setNotificationsOn] = useState(true);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const today = getTodayDate();
  const day = today.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="w-full md:h-[10%] h-[7%] px-8 flex items-center bg-[var(--bg-card)] text-[var(--text-main)] justify-between rounded-md relative shadow-dark transition-colors">
      {/* Logo */}
      <div className="sm:w-[20%] sm:scale-[1] scale-[0.9] w-fit h-full font-bold">
        <Image
          width={95}
          height={95}
          priority
          className="h-full  w-auto"
          src="/Logo.png"
          alt="logo image"
        />
      </div>

      {/* Icons + Date */}
      <div className="flex items-center sm:gap-6 gap-2">
        {/* Theme Toggle */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 sm:scale-[1] scale-[0.8] cursor-pointer bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md transition-colors"
          >
            {theme === "dark" ? <FaSun /> : <FaMoon />}
          </button>
        )}

        <button
          aria-label="Toggle notifications"
          onClick={() => {
            setNotificationsOn(!NotificationsOn);
            notifi(NotificationsOn);
          }}
          className="p-2 sm:scale-[1] scale-[0.8] cursor-pointer bg-primary text-white rounded-md"
        >
          <FaBell />
        </button>
        <div className="text-right sm:text-base text-xs">
          <p className="font-semibold">{day}</p>
          <p className="text-blue-600">{getToday()}</p>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

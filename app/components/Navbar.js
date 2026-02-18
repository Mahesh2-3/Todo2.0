"use client";
import React, { useState } from "react";
import { FaBell } from "react-icons/fa";
import Image from "next/image";
import { getToday, getTodayDate } from "../lib/dateUtils";

const Navbar = ({ notifi }) => {
  const [NotificationsOn, setNotificationsOn] = useState(true);

  const today = getTodayDate();
  const day = today.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="w-full md:h-[10%] h-[7%] px-8 flex items-center bg-white justify-between rounded-md relative  shadow-dark">
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

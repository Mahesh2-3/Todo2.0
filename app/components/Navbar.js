"use client"
import React, { useEffect, useRef, useState } from "react";
import { useMediaQuery } from 'react-responsive'
import { FaSearch, FaBell, } from "react-icons/fa";
import { useSearch } from "../context/SearchContext";
import Image from "next/image";
import { useActiveTab } from "../context/ActiveTab";

const Navbar = ({ notifi }) => {
  const inputRef = useRef(null);
  const { searchQuery, setSearchQuery } = useSearch();
  const {activeTab}=useActiveTab()
  const isMobile = useMediaQuery({ query: "(max-width:700px)" })
  const [position, setposition] = useState("up")
  const [NotificationsOn, setNotificationsOn] = useState(true);

  const today = new Date();
  const day = today.toLocaleDateString("en-US", { weekday: "long" });
  const formattedDate = today.toLocaleDateString("en-GB");

  useEffect(() => {
  if (!isMobile){
    setposition("up")
  }
  }, [isMobile])
  

const handleSearchIconClick = () => {
  inputRef.current?.focus();
  if (isMobile) {
    setposition(prev => prev === "up" ? "down" : "up");
  } else {
    setposition("up");
  }
};
  return (
    <div className="w-full md:h-[10%] h-[7%] px-8 flex items-center bg-white sm:justify-center justify-between rounded-md relative  shadow-dark">
      {/* Logo */}
      <div className="sm:w-[20%] sm:scale-[1] scale-[0.9] w-fit h-full font-bold">
        <Image width={95} height={95}  className="h-full  w-auto" src="/Logo.png" alt="logo image" />
      </div>
      <div className="sm:w-[80%] w-fit flex items-center lg7:justify-between justify-end sm:gap-4 gap-0">

      
        <div className={`flex ${!(activeTab == "Daily Task" || activeTab == "Scheduled Tasks") && "z-[-100]"} items-center  gap-2 lg7:border-[1px] border-0 border-primary rounded-lg lgg:px-2 lg7:px-3 px-0 py-1 w-fit`}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search your task here..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`searchBar md:w-[350px] w-[300px] lg7:relative absolute bg-white lg7:border-none border-1 border-primary lg7:left-0 left-[25%] z-20  ${position == "down" ? "-bottom-20" : "bottom-0"} ${position=="up" && isMobile ?"hidden":"block"} cursor-pointer px-4 py-2 rounded-lg outline-none`}
          />
          <button
            type="button"
            onClick={handleSearchIconClick}
            className="p-2 cursor-pointer sm:scale-[1] scale-[0.8]  text-white bg-primary rounded-md"
          >
            <FaSearch />
          </button>
        </div>

        {/* Icons + Date */}
        <div className="flex items-center sm:gap-6 gap-2">
          <button
            onClick={() => {
              setNotificationsOn(!NotificationsOn)
              notifi(NotificationsOn)
            }}
            className="p-2 sm:scale-[1] scale-[0.8] cursor-pointer bg-primary text-white rounded-md"
          >
            <FaBell />
          </button>
          <div className="text-right sm:text-base text-xs">
            <p className="font-semibold">{day}</p>
            <p className="text-blue-500">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;

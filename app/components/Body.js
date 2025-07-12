"use client"
import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaQuestionCircle,
  FaSignOutAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { PiAddressBookFill } from "react-icons/pi";
import { SlCalender } from "react-icons/sl";
import { useAuth } from "../context/Authcontext";
import { useRouter } from "next/navigation";
import AccountInfo from "../tabs/AccountInfo";
import DailyTasks from "../tabs/DailyTasks";
import Diary from "../tabs/Diary";
import ScheduledTasks from "../tabs/ScheduledTasks";
import Dashboard from "../tabs/Dashboard";
import Help from "../tabs/Help";
import { RiMenuFill, RiCloseFill } from "react-icons/ri";
import DeleteAccount from "./DeleteAccount";
import Image from "next/image";
import { useActiveTab } from "../context/ActiveTab";
const Body = () => {
  const { user, logout } = useAuth();
  const router = useRouter()
  const { setActiveTab } = useActiveTab()
  const [activeTab, setactiveTab] = useState("Daily Task");
  const [Menutab, setMenutab] = useState(false);
  const [deleteClicked, setdeleteClicked] = useState(false)

  const handleLogout = () => {
    logout();
    router.prefetch("/signin");
  };

  const toggleMenu = () => {
    setMenutab((prev) => !prev);
  };




  const menuItems = [
    { label: "Daily Task", icon: <FaTasks />, component: <DailyTasks /> },
    { label: "Diary", icon: <PiAddressBookFill />, component: <Diary /> },
    {
      label: "Scheduled Tasks",
      icon: <SlCalender />,
      component: <ScheduledTasks />,
    },
    { label: "Dashboard", icon: <MdDashboard />, component: <Dashboard /> },
    { label: "Help", icon: <FaQuestionCircle />, component: <Help /> },
  ];

  const renderContent = () => {
    if (activeTab === "Account Info") return <AccountInfo />;
    const foundItem = menuItems.find((item) => item.label === activeTab);
    return foundItem ? foundItem.component : null;
  };
  return (
    <div className="flex justify-between relative lg:h-[82%] h-[88%]">
{deleteClicked && <DeleteAccount setdeleteOpen={setdeleteClicked} />}
      {/* Sidebar */}
      <div
        className={`z-50 xl:w-[28%] sm:w-[350px] w-[300px] h-full bg-primary text-white flex flex-col justify-between rounded-tr-2xl py-6 px-4
          xl:static absolute top-0 left-0 transition-transform duration-300 ease-in-out
          ${Menutab ? "translate-x-0" : "-translate-x-[150%]"} xl:translate-x-0`}
      >
        <div>
          <div
            onClick={() => {
              setactiveTab("Account Info");
              setActiveTab("Account Info");
              setMenutab(false);
            }}
            className="flex relative flex-col cursor-pointer items-center mb-8"
          >
            <Image
              width={128}
              height={128}
              priority
              src={
                user.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-32 absolute -top-18 h-32 rounded-full border-6 border-white mb-2"
            />
            <div className="text-center mt-20">
              <p className="font-bold text-lg">{user?.username}</p>
              <p className="text-sm font-semibold text-white/80">
                {user?.email}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-4 mt-6">
            {menuItems.map((item) => (
              <div
                key={item.label}
                onClick={() => {
                  setactiveTab(item.label);
                  setActiveTab(item.label)
                  setMenutab(false);
                }}
                className={`flex items-center gap-3 py-2 px-4 rounded cursor-pointer transition-all ${activeTab === item.label
                  ? "bg-white text-primary font-semibold"
                  : "hover:bg-white/20"
                  }`}
              >
                <span className="scale-[1.3]">{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="px-4 mb-2">
          <div
            onClick={handleLogout}
            className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/20 cursor-pointer"
          >
            <FaSignOutAlt />
            <button className="cursor-pointer">Logout</button>
          </div>
          <div
            onClick={() => setdeleteClicked((prev) => !prev)}
            className="flex items-center gap-3 py-2 px-4 rounded hover:bg-white/20 cursor-pointer"
          >
            <FaTrashAlt />
            <button className="cursor-pointer">Delete Account</button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="xl:w-[68%] w-[96%] mx-auto h-full">
        {/* Menu Icon */}
        <div className="absolute right-0 -top-8 xl:hidden z-[19]">
          <button
            onClick={toggleMenu}
            className="bg-primary cursor-pointer text-white py-2 px-3 rounded-l-2xl"
          >
            {Menutab ? <RiCloseFill size={27} /> : <RiMenuFill size={27} />}
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Body;

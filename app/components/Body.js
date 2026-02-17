"use client";
import React, { useState, useEffect } from "react";
import {
  FaTasks,
  FaQuestionCircle,
  FaSignOutAlt,
  FaTrashAlt,
} from "react-icons/fa";
import { MdDashboard, MdInsertChartOutlined } from "react-icons/md";
import { PiAddressBookFill } from "react-icons/pi";
import { SlCalender } from "react-icons/sl";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { RiMenuFill, RiCloseFill } from "react-icons/ri";
import DeleteAccount from "./DeleteAccount";
import Image from "next/image";
import { useActiveTab } from "../context/ActiveTab";
import dynamic from "next/dynamic";

const AccountInfo = dynamic(() => import("../tabs/AccountInfo"), {
  loading: () => <p>Loading...</p>,
});
const DailyTasks = dynamic(() => import("../tabs/DailyTasks"), {
  loading: () => <p>Loading...</p>,
});
const Diary = dynamic(() => import("../tabs/Diary"), {
  loading: () => <p>Loading...</p>,
});
const ScheduledTasks = dynamic(() => import("../tabs/ScheduledTasks"), {
  loading: () => <p>Loading...</p>,
});
const Overview = dynamic(() => import("../tabs/Overview"), {
  loading: () => <p>Loading...</p>,
});
const Dashboard = dynamic(() => import("../tabs/Dashboard"), {
  loading: () => <p>Loading...</p>,
});

const Body = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { setActiveTab } = useActiveTab();
  const [activeTab, setactiveTab] = useState("Daily Task");
  const [Menutab, setMenutab] = useState(false);
  const [deleteClicked, setdeleteClicked] = useState(false);

  const handleLogout = () => {
    signOut({ callbackUrl: "/signin" });
  };

  const toggleMenu = () => {
    setMenutab((prev) => !prev);
  };

  const menuItems = [
    { label: "Daily Task", icon: <FaTasks /> },
    { label: "Diary", icon: <PiAddressBookFill /> },
    {
      label: "Scheduled Tasks",
      icon: <SlCalender />,
    },
    { label: "Overview", icon: <MdDashboard /> },
    {
      label: "Dashboard",
      icon: <MdInsertChartOutlined />,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "Account Info":
        return <AccountInfo />;
      case "Daily Task":
        return <DailyTasks />;
      case "Diary":
        return <Diary />;
      case "Scheduled Tasks":
        return <ScheduledTasks />;
      case "Overview":
        return <Overview />;
      case "Dashboard":
        return <Dashboard />;
      default:
        return null;
    }
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
                session?.user.profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-32 absolute -top-18 h-32 rounded-full border-6 border-white mb-2"
            />
            <div className="text-center mt-20">
              <p className="font-bold text-base">{session?.user.username}</p>
              <p className="text-xs font-semibold text-white/80">
                {session?.user.email}
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
                  setActiveTab(item.label);
                  setMenutab(false);
                }}
                className={`flex items-center gap-3 py-2 px-4 rounded cursor-pointer transition-all ${
                  activeTab === item.label
                    ? "bg-white text-primary font-semibold"
                    : "hover:bg-white/20"
                }`}
              >
                <span className="scale-[1.1]">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
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
        <div className="absolute right-0 -top-8 xl:hidden z-19">
          <button
            onClick={toggleMenu}
            aria-label="Toggle menu"
            className="bg-primary cursor-pointer text-white py-2 px-3 rounded-l-2xl"
          >
            {Menutab ? (
              <RiCloseFill className="sm:size-[27] size-[20]" />
            ) : (
              <RiMenuFill className="sm:size-[27] size-[20]" />
            )}
          </button>
        </div>

        {renderContent()}
      </div>
    </div>
  );
};

export default Body;

"use client";
import React, { useState, useEffect, useRef } from "react";
import { getToday } from "@/app/lib/dateUtils";
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaHourglassHalf,
  FaRegCircle,
} from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";

const statusStyles = {
  Completed: {
    border: "border-green-500",
    icon: <FaCheck color="#22c55e" size={10} />,
  },
  "In Progress": {
    border: "border-yellow-400",
    icon: <FaHourglassHalf color="#eab308" size={10} />,
  },
  Pending: {
    border: "border-primary",
    icon: <FaRegCircle color="#ef4444" size={10} />,
  },
};

const TaskCard = ({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onDeleteSeries,
}) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showCircleMenu, setShowCircleMenu] = useState(false);
  const optionsRef = useRef(null);
  const circleMenuRef = useRef(null);

  const today = getToday();
  const isExpired = task.status !== "Completed" && task.endDate < today;

  const safeStatus = statusStyles[task.status] ? task.status : "Pending";
  const currentStyle = statusStyles[safeStatus];

  const handleStatusChange = (newStatus) => {
    onStatusChange(newStatus);
    setShowCircleMenu(false);
  };

  const toggleCircleMenu = () => {
    setShowCircleMenu((prev) => !prev);
    setShowOptionsMenu(false);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }

      if (circleMenuRef.current && !circleMenuRef.current.contains(e.target)) {
        setShowCircleMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className={`relative rounded-xl border border-gray-300 shadow-sm p-4 flex justify-between items-start w-full ${
        isExpired ? "bg-gray-100 opacity-70" : "bg-white"
      }`}
    >
      {/* Expired Stamp */}
      {isExpired && (
        <div className="absolute top-2 right-2 text-[10px] px-2 py-0.5 font-bold text-red-600 border-[1.5px] border-red-600 rotate-[-10deg] uppercase bg-white shadow-sm">
          Expired
        </div>
      )}

      {/* Status Ring */}
      <div className="relative w-6 h-6">
        <div
          className={`w-5 h-5 rounded-full border-2 ${currentStyle.border} cursor-pointer flex items-center justify-center`}
          onClick={toggleCircleMenu}
        >
          <AnimatePresence mode="wait">
            {currentStyle.icon && (
              <motion.div
                key={task.status}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {currentStyle.icon}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Circular Menu */}
        {showCircleMenu && (
          <motion.div
            ref={circleMenuRef}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="absolute top-[-60px] left-[-60px] w-[150px] h-[150px] rounded-full pointer-events-none"
          >
            <div className="relative w-full h-full">
              <motion.div
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-auto"
                onClick={() => handleStatusChange("Completed")}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-green-500 bg-white flex items-center justify-center shadow">
                  <FaCheck color="#22c55e" />
                </div>
              </motion.div>
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 pointer-events-auto"
                onClick={() => handleStatusChange("In Progress")}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-yellow-400 bg-white flex items-center justify-center shadow">
                  <FaHourglassHalf color="#eab308" />
                </div>
              </motion.div>
              <motion.div
                className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-auto"
                onClick={() => handleStatusChange("Pending")}
                whileTap={{ scale: 0.9 }}
              >
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-white flex items-center justify-center shadow">
                  <FaRegCircle color="#ef4444" />
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Task Content */}
      <div className="ml-4 flex-1">
        <h2 className="font-semibold sm:text-base text-sm line-clamp-1 break-all">
          {task.title}
        </h2>
        <p className="text-gray-600 sm:text-sm text-xs line-clamp-2 break-all">
          {task.description}
        </p>

        <div className="flex mt-4 w-full justify-between items-center">
          <div className="text-xs text-gray-500">
            {task.startDate === task.endDate ? (
              <>Created on: {task.startDate}</>
            ) : (
              <>
                {task.startDate} <strong>to</strong> {task.endDate}
              </>
            )}
          </div>
          <div className="mt-1 text-xs">
            <span
              className={
                task.status === "Completed"
                  ? "text-green-600"
                  : task.status === "In Progress"
                    ? "text-yellow-600"
                    : "text-primary"
              }
            >
              {task.status}
            </span>
          </div>
        </div>
      </div>

      {/* Options */}
      <div className="relative ml-2" ref={optionsRef}>
        <BsThreeDotsVertical
          className="text-gray-500 cursor-pointer"
          onClick={() => setShowOptionsMenu((prev) => !prev)}
        />
        {showOptionsMenu && (
          <div className="absolute right-0 top-6 w-[120px] bg-white shadow-md p-2 rounded z-10 flex flex-col gap-2 text-sm">
            {!task.templateId && (
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
                onClick={() => {
                  onEdit?.(task);
                  setShowOptionsMenu(false);
                }}
              >
                <FaEdit /> Edit
              </div>
            )}
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-primary"
              onClick={() => {
                onDelete?.(task);
                setShowOptionsMenu(false);
              }}
            >
              <FaTrash /> Delete
            </div>
            {onDeleteSeries && (
              <div
                className="flex items-center gap-2 cursor-pointer hover:text-red-700 border-t pt-2 mt-1"
                onClick={() => {
                  onDeleteSeries(task);
                  setShowOptionsMenu(false);
                }}
              >
                <FaTrash /> Delete Series
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;

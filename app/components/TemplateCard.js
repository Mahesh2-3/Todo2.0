"use client";
import React, { useState, useRef, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { BsThreeDotsVertical } from "react-icons/bs";

const TemplateCard = ({ task, onEdit, onDelete }) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const optionsRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (optionsRef.current && !optionsRef.current.contains(e.target)) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative rounded-xl border border-gray-300 shadow-sm p-4 flex justify-between items-start w-full bg-white">
      {/* Content */}
      <div className="flex-1">
        <h2 className="font-semibold sm:text-base text-sm line-clamp-1 break-all">
          {task.title}
        </h2>
        <p className="text-gray-600 sm:text-sm text-xs line-clamp-2 break-all mt-1">
          {task.description}
        </p>
      </div>

      {/* Options */}
      <div className="relative ml-2" ref={optionsRef}>
        <BsThreeDotsVertical
          className="text-gray-500 cursor-pointer"
          onClick={() => setShowOptionsMenu((prev) => !prev)}
        />
        {showOptionsMenu && (
          <div className="absolute right-0 top-6 w-[120px] bg-white shadow-md p-2 rounded z-10 flex flex-col gap-2 text-sm">
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-blue-600"
              onClick={() => {
                onEdit?.(task);
                setShowOptionsMenu(false);
              }}
            >
              <FaEdit /> Edit
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-red-600"
              onClick={() => {
                onDelete?.(task);
                setShowOptionsMenu(false);
              }}
            >
              <FaTrash /> Delete
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateCard;

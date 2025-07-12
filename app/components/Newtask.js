"use client"
import React, { useState, useEffect } from "react";

const NewTask = ({ onAdd, onUpdate, onClose, existingTask, callingFrom }) => {
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(
    callingFrom == "ScheduledTasks" ? tomorrow : today
  );
  const [isDaily, setIsDaily] = useState(false); // default checked

  useEffect(() => {
    if (existingTask) {
      setTitle(existingTask.title);
      setDescription(existingTask.description);
      setStartDate(existingTask.startDate);
      setEndDate(existingTask.endDate);
      setIsDaily(existingTask.isDaily);
    }
  }, [existingTask]);

  const handleToggle = () => {
    const toggled = !isDaily;
    setIsDaily(toggled);
    if (toggled) {
      setStartDate(today);
      setEndDate(today);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const taskData = {
      ...existingTask,
      title,
      isDaily,
      description,
      startDate,
      endDate,
      status: existingTask?.status || "Pending",
    };

    if (existingTask) {
      onUpdate(taskData);
    } else {
      onAdd(taskData);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl p-6 sm:w-[440px] w-[400px] shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-xl"
        >
          ✕
        </button>
        <h2 className="text-2xl font-bold mb-4 text-primary">
          {existingTask ? "Edit Task" : "New Task"}
        </h2>

        {/* Toggle */}
        {/* Toggle Set as Daily */}
        {callingFrom == "DailyTasks" && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Set as Daily
            </span>
            <div
              onClick={handleToggle}
              className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
                isDaily ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                  isDaily ? "translate-x-5" : "translate-x-0"
                }`}
              ></div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold">Title</label>
            <input
              type="text"
              className="w-full border px-3 py-2 rounded"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Description</label>
            <textarea
              className="w-full border px-3 py-2 rounded"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">Start Date</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={startDate}
              disabled={isDaily}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">End Date</label>
            <input
              type="date"
              className="w-full border px-3 py-2 rounded"
              value={endDate}
              disabled={isDaily}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="bg-primary cursor-pointer text-white px-4 py-2 rounded w-full font-semibold"
          >
            {existingTask ? "Update Task" : "Add Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewTask;


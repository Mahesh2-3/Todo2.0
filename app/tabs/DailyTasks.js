"use client";
import { useState, useEffect, useCallback } from "react";
import TaskCard from "../components/TaskCard";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import StatusChart from "../components/StatusChart";
import {
  FaCheck,
  FaHourglassHalf,
  FaPlus,
  FaRegCircle,
  FaRegClipboard,
} from "react-icons/fa";
import NewTask from "../components/Newtask";
import { useSearch } from "../context/SearchContext";
import Image from "next/image";
import { useLoading } from "../context/LoadingContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

const statusOptions = [
  {
    status: "Completed",
    icon: <FaCheck color="#22c55e" size={10} />,
    color: "border-green-400",
  },
  {
    status: "In Progress",
    icon: <FaHourglassHalf color="#eab308" size={10} />,
    color: "border-yellow-400",
  },
  {
    status: "Pending",
    icon: <FaRegCircle color="#ef4444" size={10} />,
    color: "border-red-400",
  },
];

const DailyTasks = () => {
  const { searchQuery } = useSearch();
  const [tasks, setTasks] = useState([]);
  const isMobile = useMediaQuery({ query: "(max-width:860px)" });
  const [tab, settab] = useState("Both");
  const { loading, setLoading } = useLoading();
  const { data: session } = useSession();
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [open, setOpen] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const totalTasks = tasks?.length;
  const statusCount = (status) =>
    tasks?.filter((t) => t.status === status).length;

  const fetchTasks = useCallback(async () => {
    setLoading(true);

    try {
      const res = await axios.get(`/api/auth/tasks?type=daily`);

      // Backend already gives today's daily instances
      setTasks(res.data);
    } catch (err) {
      console.error("Fetch error:", err?.response?.data || err.message);
    }

    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session, fetchTasks]);

  useEffect(() => {
    if (!isMobile) {
      settab("Both");
    } else {
      settab("Tasks");
    }
  }, [isMobile]);

  const handleAddTask = async (newTask) => {
    setLoading(true);

    try {
      const response = await axios.post(`/api/auth/tasks`, {
        ...newTask,
      });
      // Backend generates today's instance automatically
      fetchTasks();
    } catch (err) {
      console.error("Add failed:", err?.response?.data || err.message);
    }

    setLoading(false);
  };
  const handleUpdateTask = async (updatedTask) => {
    setLoading(true);

    try {
      //update first and if the response is not ok change it back
      const originalTasks = [...tasks];
      setTasks((prev) =>
        prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
      );
      const res = await axios.put(
        `/api/auth/tasks/${updatedTask._id}`,
        updatedTask,
      );
      if (!res.data.task) {
        setTasks(originalTasks);
        toast.error("Update failed", { autoClose: 1000, theme: "dark" });
      }
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Task not found", { autoClose: 1000, theme: "dark" });
      } else {
        toast.error("Update failed", { autoClose: 1000, theme: "dark" });
      }
    }

    setLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    setLoading(true);
    try {
      await axios.delete(`/api/auth/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setLoading(false);
  };

  /* renderStatusChart removed */

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="lgg:text-3xl sm:text-2xl text-lg flex justify-start items-center gap-2 font-semibold">
        Welcome back,{" "}
        <span className="text-primary relative -top-0.5 lgg:text-4xl sm:text-3xl text-xl">
          {session?.user.username}
        </span>{" "}
        <Image
          width={36}
          height={36}
          className="lgg:size-[36px] size-[32px] relative -top-1.5"
          src="/hand_wave.png"
          alt=""
        />
      </div>

      <div className="w-full h-[95%] flex lgg:flex-row flex-col gap-4">
        {showNewTask && (
          <NewTask
            onAdd={handleAddTask}
            onUpdate={handleUpdateTask}
            existingTask={editTask}
            onClose={() => {
              setShowNewTask(false);
              setEditTask(null);
            }}
            callingFrom="DailyTasks"
          />
        )}
        <div className="lgg:hidden flex w-full items-center justify-start gap-4">
          <div
            onClick={() => {
              settab("Tasks");
            }}
            role="button"
            tabIndex={0}
            aria-label="Tasks Tab"
            className={`py-2 px-6 cursor-pointer  font-bold w-[50%] text-center  border-b-2 ${tab == "Tasks" ? "border-b-primary text-primary" : "border-b-gray-300 text-gray-300"}`}
          >
            Tasks
          </div>
          <div
            onClick={() => {
              settab("Status");
            }}
            role="button"
            tabIndex={0}
            aria-label="Status Tab"
            className={`py-2 px-6  cursor-pointer font-bold w-[50%] text-center  border-b-2 ${tab == "Status" ? "border-b-primary text-primary" : "border-b-gray-300 text-gray-300"}`}
          >
            Status
          </div>
        </div>
        {(tab == "Both" || tab == "Tasks") && (
          <div className="lgg:w-1/2 w-full mx-auto lg7:h-full h-[93%] shadow-md border border-brick sm:p-6 p-3 relative rounded-2xl">
            <div
              className="absolute lg7:bottom-10 bottom-20 right-3 w-[50px] h-[50px] flex items-center justify-center bg-primary rounded-full cursor-pointer z-10"
              onClick={() => setShowNewTask(true)}
              role="button"
              aria-label="Create new task"
              tabIndex={0}
            >
              <FaPlus size={20} color="white" />
            </div>

            <div className="overflow-y-scroll hide-scrollbar space-y-4 h-full p-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                  <Image
                    width={24}
                    height={24}
                    style={{ height: "auto" }}
                    src="/Pending.png"
                    alt="Pending"
                  />
                  <span className="font-xl font-semibold text-primary">
                    To-Do
                  </span>
                </div>
                <span className="flex items-center text-sm text-gray-600 justify-center gap-2">
                  {new Date().toLocaleDateString()} • today
                </span>
              </div>

              {tasks?.filter((t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase()),
              ).length === 0 ? (
                <div className="h-full sm:text-base text-xs">
                  {loading ? (
                    <span className="flex flex-col items-center justify-center gap-3 h-full">
                      <AiOutlineLoading3Quarters
                        className="animate-spin"
                        size={30}
                      />{" "}
                      Loading...
                    </span>
                  ) : (
                    <span className="flex flex-col items-center justify-center gap-3 h-full">
                      <FaRegClipboard size={30} /> No Tasks Found
                    </span>
                  )}
                </div>
              ) : (
                tasks
                  ?.filter((t) =>
                    t.title.toLowerCase().includes(searchQuery.toLowerCase()),
                  )
                  .map((task, index) => (
                    <TaskCard
                      key={task._id || index}
                      task={task}
                      onStatusChange={(status) =>
                        handleUpdateTask({ ...task, status })
                      }
                      onEdit={() => {
                        setEditTask(task);
                        setShowNewTask(true);
                      }}
                      onDelete={() => handleDeleteTask(task._id)}
                    />
                  ))
              )}
            </div>
          </div>
        )}
        {(tab == "Both" || tab == "Status") && (
          <div className="lgg:w-1/2 w-full mx-auto lg7:h-full h-[93%] overflow-y-scroll hide-scrollbar flex flex-col gap-4">
            <div className="sm:h-[40%] h-[30%] w-full relative border border-brick shadow-md sm:p-6 p-3 rounded-2xl">
              <h3 className="text-primary sm:relative absolute sm:top-0 top-4 sm:left-0 left-6 font-semibold sm:text-base @min-xs:text-[14px] text-[12px] mb-4 flex items-center gap-2">
                <Image width={24} height={24} src="/Task_complete.png" alt="" />{" "}
                Task Status
              </h3>
              <div className="flex justify-around items-center h-full pt-7">
                <StatusChart
                  label="Completed"
                  value={(statusCount("Completed") / totalTasks) * 100}
                  color="#22c55e"
                />
                <StatusChart
                  label="In Progress"
                  value={(statusCount("In Progress") / totalTasks) * 100}
                  color="#F0B100"
                />
                <StatusChart
                  label="Pending"
                  value={(statusCount("Pending") / totalTasks) * 100}
                  color="#FF6767"
                />
              </div>
            </div>

            <div className="flex h-[67%]  border border-brick shadow-md bg-white w-full p-4 pb-8 rounded-2xl relative overflow-y-scroll hide-scrollbar  flex-col gap-4">
              <div className="flex justify-end w-full">
                <div className="relative w-48 mb-4">
                  <div
                    className="bg-white text-sm px-4 py-2 rounded-md cursor-pointer flex justify-between items-center"
                    onClick={() => setOpen(!open)}
                  >
                    <div
                      className={`w-[20px] h-[20px] rounded-full border-2 ${selectedStatus.color} flex items-center justify-center`}
                    >
                      {selectedStatus.icon}
                    </div>
                    {selectedStatus.status}
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                  {open && (
                    <div className="absolute w-full mt-1 bg-white rounded-md shadow-md z-10 text-sm">
                      {statusOptions.map((status) => (
                        <div
                          key={status.status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setOpen(false);
                          }}
                          className={`px-4 py-2 flex items-center gap-4 cursor-pointer ${
                            selectedStatus.status === status.status
                              ? "bg-gray-100"
                              : ""
                          }`}
                        >
                          <div
                            className={`w-[20px] h-[20px] rounded-full border-2 ${status.color} flex items-center justify-center`}
                          >
                            {status.icon}
                          </div>
                          {status.status}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {tasks?.filter((task) => task.status === selectedStatus.status)
                .length === 0 ? (
                <div className="h-full">
                  {loading ? (
                    <span className="flex flex-col items-center justify-center gap-3 h-full">
                      <AiOutlineLoading3Quarters
                        className="animate-spin"
                        size={30}
                      />{" "}
                      Loading...
                    </span>
                  ) : (
                    <span className="flex flex-col items-center justify-center gap-3 h-full">
                      <FaRegClipboard size={30} /> No Tasks to View
                    </span>
                  )}
                </div>
              ) : (
                tasks
                  .filter((task) => task.status === selectedStatus.status)
                  .map((task) => (
                    <TaskCard
                      key={task._id}
                      task={task}
                      onStatusChange={(newStatus) =>
                        handleUpdateTask({ ...task, status: newStatus })
                      }
                      onEdit={() => {
                        setEditTask(task);
                        setShowNewTask(true);
                      }}
                      onDelete={() => handleDeleteTask(task._id)}
                    />
                  ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyTasks;

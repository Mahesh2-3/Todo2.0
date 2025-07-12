"use client"
import { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import axios from "axios";
import { useMediaQuery } from "react-responsive"
import { useAuth } from "../context/Authcontext";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
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

const ScheduledTasks = () => {
  const { searchQuery } = useSearch();
  const [tasks, setTasks] = useState([]);
  const { loading, setLoading } = useLoading()
  const isMobile = useMediaQuery({ query: "(max-width:860px)" })
  const [tab, settab] = useState("Both");
  const { user } = useAuth();
  const date = new Date();
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const totalTasks = tasks.length;
  const completed = tasks.filter((t) => t.status === "Completed").length;
  const inProgress = tasks.filter((t) => t.status === "In Progress").length;
  const Pending = tasks.filter(
    (t) => t.status === "Pending" || t.status === "Pending"
  ).length;

  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [open, setOpen] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await axios.get(`/api/auth/tasks`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      const filteredTasks = response.data.tasks.filter((task) => {
        return task.startDate != task.endDate;
      });

      setTasks(filteredTasks);
    } catch (error) {
      console.error(
        "Failed to fetch tasks:",
        error?.response?.data || error.message
      );
    }
    setLoading(false)
  };

  useEffect(() => {
    fetchTasks();
  }, [user.token]);

  useEffect(() => {
    if (!isMobile) {
      settab("Both")
    } else {
      settab("Tasks")
    }
  }, [isMobile])

  const handleAddTask = async (newTask) => {
    setLoading(true)
    try {
      // Only add if today is in range
      if (newTask.startDate != newTask.endDate) {
        const response = await axios.post(`/api/auth/tasks`, newTask, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });

        setTasks((prev) => [response.data.task, ...prev]);
      } else {
        // Still send to backend, but don’t show in UI
        await axios.post(`/api/auth/tasks`, newTask, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to add task";
      console.error("Task creation failed:", errMsg);
    }
    setLoading(false)
    fetchTasks()
  };

  const handleUpdateTask = async (updatedTask) => {
    setLoading(true)
    try {
      const response = await axios.put(
        `/api/auth/tasks/${updatedTask._id}`,
        updatedTask,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      const newTask = response.data.task;

      // Show in UI only if today is within date range
      if (newTask.startDate != newTask.endDate) {
        setTasks((prev) =>
          prev.map((t) => (t._id === newTask._id ? newTask : t))
        );
      } else {
        // Remove it from UI if date no longer valid
        setTasks((prev) => prev.filter((t) => t._id !== newTask._id));
      }
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to update task";
      console.error("Task update failed:", errMsg);
    }
    setLoading(false)

  };

  const handleDeleteTask = async (taskId) => {
    setLoading(true)
    try {
      await axios.delete(`/api/auth/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setTasks((prev) => prev.filter((task) => task._id !== taskId));
    } catch (error) {
      const errMsg = error.response?.data?.error || "Failed to delete task";
      console.error("Task deletion failed:", errMsg);
      // Optional: show error toast
    }
    setLoading(false)

  };

  return (
    <div className="w-full h-full ">
      <div className="w-full  h-full flex lgg:flex-row flex-col gap-4">
        {showNewTask && (
          <NewTask
            onAdd={handleAddTask}
            onUpdate={handleUpdateTask}
            existingTask={editTask}
            onClose={() => {
              setShowNewTask(false);
              setEditTask(null);
            }}
            callingFrom={"ScheduledTasks"}
          />
        )}
        <div className="lgg:hidden flex w-full items-center justify-start gap-4">
          <div onClick={() => {
            settab("Tasks")
          }} className={`py-2 px-6 cursor-pointer  font-bold w-[50%] text-center  border-b-2 ${tab == "Tasks" ? "border-b-primary text-primary" : "border-b-gray-300 text-gray-300"}`}>Tasks</div>
          <div onClick={() => {
            settab("Status")
          }} className={`py-2 px-6  cursor-pointer font-bold w-[50%] text-center  border-b-2 ${tab == "Status" ? "border-b-primary text-primary" : "border-b-gray-300 text-gray-300"}`} >Status</div>
        </div>
        {(tab == "Both" || tab == "Tasks") && (
          <div className="lgg:w-1/2 w-full sm:h-full h-[93%] shadow-dark p-6 relative rounded-l-2xl rounded-br-2xl">
            {/* Floating Plus Button - stays fixed */}
            <div
              className="absolute w-[50px] z-[10] cursor-pointer flex justify-center items-center h-[50px] p-3 rounded-full bg-primary sm:bottom-10 bottom-20 right-3"
              onClick={() => setShowNewTask(true)}
            >
              <FaPlus size={20} color="white" />
            </div>

            {/* Scrollable Task List */}
            <div className="  overflow-y-scroll hide-scrollbar space-y-4 h-full p-2">
              {/* Header */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 justify-start items-center">
                  <Image width={24} height={24} src="/Pending.png" alt="" />
                  <span className="font-xl font-semibold">
                    <span className="text-primary">To</span>-Do
                  </span>
                </div>
                <div className="text-sm text-gray-600 flex items-center">
                  {day}-{month}
                  <span className="mx-1 text-xs align-middle">•</span>Today
                </div>
              </div>

              {tasks.length == 0 && (
                <div className="w-full h-full">
                  {loading ? (<span className="flex flex-col items-center justify-center gap-3 h-full"><AiOutlineLoading3Quarters className="animate-spin" size={30} /> Loading...</span>) : <span className="flex flex-col items-center justify-center gap-3 h-full"><FaRegClipboard size={30} /> No Tasks Found</span>}

                </div>
              )}
              {tasks.filter((task) =>
                task.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length == 0 && (
                  <div className="flex flex-col items-center justify-center gap-3 h-full">
                    <FaRegClipboard size={30} /> No Tasks Found
                  </div>
                )}

              {/* Task Cards */}
              {tasks
                .filter((task) =>
                  task.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((task, index) => (
                  <TaskCard
                    key={index}
                    task={task}
                    onStatusChange={(newStatus) => {
                      const updatedTasks = [...tasks];
                      updatedTasks[index].status = newStatus;
                      handleUpdateTask(updatedTasks[index]);
                      setTasks(updatedTasks);
                    }}
                    onEdit={() => {
                      setEditTask(task);
                      setShowNewTask(true);
                    }}
                    onDelete={(taskToDelete) => {
                      const updatedTasks = tasks.filter(
                        (t) => t !== taskToDelete
                      );
                      setTasks(updatedTasks);
                      handleDeleteTask(taskToDelete._id);
                    }}
                  />
                ))}
            </div>
          </div>
        )}
        {(tab == "Both" || tab == "Status") && (
          <div className="lgg:w-1/2 w-full sm:h-full h-[93%] flex flex-col gap-4">
            {/* Status Summary */}
            <div className="sm:h-[40%] h-[30%] relative shadow-dark p-6 rounded-t-2xl flex flex-col">
              <h3 className="text-primary sm:relative absolute sm:top-0 top-4 sm:left-0 left-6 font-semibold sm:text-base text-[14px] mb-4 flex items-center gap-2">
                <Image width={24} height={24} src="/Task_complete.png" alt="" /> Task Status
              </h3>
              <div className="w-full h-full flex justify-center items-center">
                <div className="flex justify-around w-full items-center  sm:pt-0 pt-5">
                  {/* Completed */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="sm:w-[100px] w-[80px] sm:h-[100px] h-[80px]">
                      <CircularProgressbar
                        strokeWidth={10}
                        value={totalTasks ? (completed / totalTasks) * 100 : 0}
                        text={`${totalTasks
                          ? Math.round((completed / totalTasks) * 100)
                          : 0
                          }%`}
                        styles={buildStyles({
                          pathColor: "#22c55e",
                          trailColor: "#e5e7eb",
                          textColor: "#000",
                          textSize: "24px",
                        })}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                      Completed
                    </div>
                  </div>

                  {/* In Progress */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="sm:w-[100px] w-[80px] sm:h-[100px] h-[80px]">
                      <CircularProgressbar
                        strokeWidth={10}
                        value={totalTasks ? (inProgress / totalTasks) * 100 : 0}
                        text={`${totalTasks
                          ? Math.round((inProgress / totalTasks) * 100)
                          : 0
                          }%`}
                        styles={buildStyles({
                          pathColor: "#F0B100",
                          trailColor: "#e5e7eb",
                          textColor: "#000",
                          textSize: "24px",
                        })}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block"></span>
                      In Progress
                    </div>
                  </div>

                  {/* Pending */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="sm:w-[100px] w-[80px] sm:h-[100px] h-[80px]">
                      <CircularProgressbar
                        strokeWidth={10}
                        value={totalTasks ? (Pending / totalTasks) * 100 : 0}
                        text={`${totalTasks
                          ? Math.round((Pending / totalTasks) * 100)
                          : 0
                          }%`}
                        styles={buildStyles({
                          pathColor: "#FF6767",
                          trailColor: "#e5e7eb",
                          textColor: "#000",
                          textSize: "24px",
                        })}
                      />
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="w-2 h-2 rounded-full bg-primary inline-block"></span>
                      Pending
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtered Task List */}
            <div className="sm:h-[60%] h-[70%] shadow-dark p-4 rounded-b-2xl relative  flex flex-col overflow-y-scroll items-start gap-4 hide-scrollbar">
              {/* Custom Dropdown */}
              <div className="flex justify-end w-full">
                <div className="relative w-48 mb-4">
                  <div
                    className="bg-white text-sm text-gray-700 px-4 py-2 rounded-md cursor-pointer select-none flex justify-between items-center"
                    onClick={() => setOpen((prev) => !prev)}
                  >
                    <div
                      className={`w-[20px] h-[20px] rounded-full border-[2px] ${selectedStatus.color} bg-white flex items-center justify-center shadow`}
                    >
                      {selectedStatus.icon}
                    </div>
                    {selectedStatus.status}
                    <svg
                      className={`w-4 h-4 ml-2 transition-transform duration-200 ${open ? "rotate-180" : ""
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

                  {/* Dropdown Options */}
                  {open && (
                    <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-md text-sm">
                      {statusOptions.map((status) => (
                        <div
                          key={status.status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setOpen(false);
                          }}
                          className={`px-4 py-2 flex items-center gap-6 hover:bg-gray-100 cursor-pointer ${selectedStatus.status === status.status
                            ? "bg-gray-100"
                            : ""
                            }`}
                        >
                          <div
                            className={`w-[20px] h-[20px] rounded-full border-[2px] ${status.color} bg-white flex items-center justify-center shadow`}
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
              {(() => {
                const filteredTasks = tasks.filter(
                  (task) => task.status === selectedStatus.status
                );

                if (filteredTasks.length === 0) {
                  return (
                    <div className="h-full w-full">
                      {loading ? (<span className="flex flex-col items-center justify-center gap-3 h-full"><AiOutlineLoading3Quarters className="animate-spin" size={30} /> Loading...</span>) : <span className="flex flex-col items-center justify-center gap-3 h-full"><FaRegClipboard size={30} /> No Tasks Found</span>}

                    </div>
                  );
                }

                return filteredTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onStatusChange={(newStatus) => {
                      const updatedTask = { ...task, status: newStatus };
                      handleUpdateTask(updatedTask); // 🔁 Update in backend
                      setTasks((prev) =>
                        prev.map((t) => (t._id === task._id ? updatedTask : t))
                      );
                    }}
                    onEdit={() => {
                      setEditTask(task);
                      setShowNewTask(true);
                    }}
                    onDelete={(taskToDelete) => {
                      handleDeleteTask(taskToDelete._id); // 🗑 Delete in backend
                      setTasks((prev) =>
                        prev.filter((t) => t._id !== taskToDelete._id)
                      );
                    }}
                  />
                ));
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduledTasks;

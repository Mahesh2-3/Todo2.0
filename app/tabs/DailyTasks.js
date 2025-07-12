"use client"
import { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import axios from "axios";
import { useAuth } from "../context/Authcontext";
import { useMediaQuery } from "react-responsive"
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

const DailyTasks = () => {
  const { searchQuery } = useSearch();
  const [tasks, setTasks] = useState([]);
  const isMobile = useMediaQuery({ query: "(max-width:860px)" })
  const [tab, settab] = useState("Both");
  const { loading, setLoading } = useLoading()
  const { user } = useAuth();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const [selectedStatus, setSelectedStatus] = useState(statusOptions[0]);
  const [open, setOpen] = useState(false);
  const [showNewTask, setShowNewTask] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const totalTasks = tasks.length;
  const statusCount = (status) =>
    tasks.filter((t) => t.status === status).length;
  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await axios.get(`/api/auth/tasks`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const allTasks = res.data.tasks;
      const todayTasks = [];

      for (const task of allTasks) {
        if (task.startDate === today && task.endDate === today) {
          todayTasks.push(task);
        } else if (task.isDaily) {
          const updatedOriginal = {
            ...task,
            status: "Pending",
            startDate: today,
            endDate: today,
          };
          await handleUpdateTask(updatedOriginal);
          todayTasks.push(updatedOriginal);

          const dailyCopy = {
            ...task,
            isDaily: false,
            startDate: yesterday,
            endDate: yesterday,
            _id: `${task._id}-copy-${yesterday}`,
          };
          await handleAddTask(dailyCopy);
        }
      }

      setTasks(removeDuplicates(todayTasks));
    } catch (err) {
      console.error("Fetch error:", err);
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



  const removeDuplicates = (arr) => {
    const seen = new Set();
    return arr.filter((task) => {
      const key = `${task.title}-${task.description}-${task.startDate}-${task.endDate}`;
      return seen.has(key) ? false : seen.add(key);
    });
  };

  const handleAddTask = async (newTask) => {
    setLoading(true)
    try {
      await axios.post(`/api/auth/tasks`, newTask, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (newTask.startDate === today && newTask.endDate === today) {
        setTasks((prev) => [newTask, ...prev]);
      }
    } catch (err) {
      console.error("Add failed:", err);
    }
    fetchTasks()
    setLoading(false)
  };

  const handleUpdateTask = async (updatedTask) => {
    setLoading(true)
    console.log(updatedTask)
    try {
      const res = await axios.put(
        `/api/auth/tasks/${updatedTask._id}`,
        updatedTask,
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      const newTask = res.data.task;
      setTasks((prev) =>
        newTask.startDate === today && newTask.endDate === today
          ? prev.map((t) => (t._id === newTask._id ? newTask : t))
          : prev.filter((t) => t._id !== newTask._id)
      );
    } catch (err) {
      console.error("Update failed:", err);
    }
    setLoading(false)
  };

  const handleDeleteTask = async (taskId) => {
    setLoading(true)
    try {
      await axios.delete(`/api/auth/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      console.error("Delete failed:", err);
    }
    setLoading(false)
  };

  const renderStatusChart = (label, value, color) => (
    <div className="flex flex-col items-center gap-2">
      <div className="sm:w-[100px] w-[80px] sm:h-[100px] h-[80px]">
        <CircularProgressbar
          strokeWidth={10}
          value={value || 0}
          text={`${Math.round(value) || 0}%`}
          styles={buildStyles({
            pathColor: color,
            trailColor: "#e5e7eb",
            textColor: "#000",
            textSize: "22px",
          })}
        />
      </div>
      <div className="flex items-center gap-1 text-sm">
        <span
          className={`w-2 h-2 rounded-full inline-block`}
          style={{ backgroundColor: color }}
        ></span>
        {label}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="lgg:text-3xl sm:text-2xl text-lg flex justify-start items-center gap-2 font-semibold">
        Welcome back,{" "}
        <span className="text-primary relative -top-0.5 lgg:text-4xl sm:text-3xl text-xl">{user.username}</span>{" "}
        <Image width={36} height={36} className="lgg:size-[36px] size-[32px] relative -top-1.5" src="/hand_wave.png" alt="" />
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
          <div onClick={() => {
            settab("Tasks")
          }} className={`py-2 px-6 cursor-pointer  font-bold w-[50%] text-center  border-b-2 ${tab == "Tasks" ? "border-b-primary text-primary" : "border-b-gray-300 text-gray-300"}`}>Tasks</div>
          <div onClick={() => {
            settab("Status")
          }} className={`py-2 px-6  cursor-pointer font-bold w-[50%] text-center  border-b-2 ${tab == "Status" ? "border-b-primary text-primary" : "border-b-gray-300 text-gray-300"}`} >Status</div>
        </div>
        {(tab == "Both" || tab == "Tasks") && (
          <div className="lgg:w-1/2 w-full mx-auto lg7:h-full h-[93%] shadow-md border border-brick sm:p-6 p-3 relative rounded-2xl">
            <div
              className="absolute lg7:bottom-10 bottom-20 right-3 w-[50px] h-[50px] flex items-center justify-center bg-primary rounded-full cursor-pointer z-10"
              onClick={() => setShowNewTask(true)}
            >
              <FaPlus size={20} color="white" />
            </div>

            <div className="overflow-y-scroll hide-scrollbar space-y-4 h-full p-2">
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                  <Image width={24} height={24} style={{ height: "auto" }} src="/Pending.png" alt="Pending" />
                  <span className="font-xl font-semibold text-primary">
                    To-Do
                  </span>
                </div>
                <span className="flex items-center text-sm text-gray-600 justify-center gap-2">
                  {new Date().toLocaleDateString()} • today
                </span>
              </div>

              {tasks.filter((t) =>
                t.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 ? (
                <div className="h-full sm:text-base text-xs">
                  {loading ? (<span className="flex flex-col items-center justify-center gap-3 h-full"><AiOutlineLoading3Quarters className="animate-spin" size={30}/> Loading...</span>) :<span className="flex flex-col items-center justify-center gap-3 h-full"><FaRegClipboard size={30} /> No Tasks Found</span>}
                </div>
              ) : (
                tasks
                  .filter((t) =>
                    t.title.toLowerCase().includes(searchQuery.toLowerCase())
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
              <h3 className="text-primary sm:relative absolute sm:top-0 top-4 sm:left-0 left-6 font-semibold sm:text-base text-[14px] mb-4 flex items-center gap-2">
                <Image width={24} height={24} src="/Task_complete.png" alt="" /> Task Status
              </h3>
              <div className="flex justify-around items-center h-full pt-7">
                {renderStatusChart(
                  "Completed",
                  (statusCount("Completed") / totalTasks) * 100,
                  "#22c55e"
                )}
                {renderStatusChart(
                  "In Progress",
                  (statusCount("In Progress") / totalTasks) * 100,
                  "#F0B100"
                )}
                {renderStatusChart(
                  "Pending",
                  (statusCount("Pending") / totalTasks) * 100,
                  "#FF6767"
                )}
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
                      className={`w-4 h-4 ml-2 transition-transform ${open ? "rotate-180" : ""
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
                          className={`px-4 py-2 flex items-center gap-4 cursor-pointer ${selectedStatus.status === status.status
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

              {tasks.filter((task) => task.status === selectedStatus.status)
                .length === 0 ? (
                <div className="h-full">
                  {loading ? (<span className="flex flex-col items-center justify-center gap-3 h-full"><AiOutlineLoading3Quarters className="animate-spin" size={30}/> Loading...</span>) :<span className="flex flex-col items-center justify-center gap-3 h-full"><FaRegClipboard size={30} /> No Tasks to View</span>}
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

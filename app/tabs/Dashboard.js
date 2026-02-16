"use client";
import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import TaskCard from "../components/TaskCard";
import NewTask from "../components/Newtask";
import { useMediaQuery } from "react-responsive";
import DatePicker from "react-datepicker";
import { FaChevronDown, FaRegClipboard } from "react-icons/fa";
import "react-datepicker/dist/react-datepicker.css";
import StatusChart from "../components/StatusChart";
import { useLoading } from "../context/LoadingContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { useSession } from "next-auth/react";

const DATE_OPTIONS = ["Total", "Today", "Yesterday"];
const STATUS_OPTIONS = [
  "All",
  "Completed",
  "In Progress",
  "Pending",
  "Expired",
];

const Dashboard = () => {
  const { data: session } = useSession();
  const { loading, setLoading } = useLoading();
  // ─── State ───────────────────────────────────────────────

  const [tasks, setTasks] = useState([]);
  const [dateFilter, setDateFilter] = useState("Total");
  const [statusFilter, setStatusFilter] = useState("All");
  const [customDate, setCustomDate] = useState(new Date());
  const [tab, settab] = useState("Both");
  const isMobile = useMediaQuery({ query: "(max-width:860px)" });

  const [showDateDD, setShowDateDD] = useState(false);
  const [showStatusDD, setShowStatusDD] = useState(false);

  const [showNewTask, setShowNewTask] = useState(false);
  const [editTask, setEditTask] = useState(null);

  // ─── Fetch tasks ─────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    axios
      .get(`/api/auth/tasks?type=all`)
      .then((res) => setTasks(res.data))
      .catch((err) => console.error("Fetch tasks failed:", err))
      .finally(() => setLoading(false));
  }, [session?.user]);

  useEffect(() => {
    if (!isMobile) {
      settab("Both");
    } else {
      settab("Tasks");
    }
  }, [isMobile]);

  // ─── Helpers ─────────────────────────────────────────────
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000)
    .toISOString()
    .split("T")[0];
  const toStr = (d) => d.toISOString().split("T")[0];

  // ─── Derived data (memoised) ─────────────────────────────
  const { filteredTasks, counts, expiringTasks } = useMemo(() => {
    const stats = { total: 0, completed: 0, progress: 0, pending: 0 };
    const tomorrowStr = new Date(Date.now() + 86400000)
      .toISOString()
      .split("T")[0];

    const fTasks = tasks?.filter((t) => {
      const matchDate =
        dateFilter === "Total" ||
        (dateFilter === "Today" &&
          (t.startDate === todayStr || t.endDate === todayStr)) ||
        (dateFilter === "Yesterday" &&
          (t.startDate === yesterdayStr || t.endDate === yesterdayStr)) ||
        (dateFilter === "Calendar" &&
          (t.startDate === toStr(customDate) ||
            t.endDate === toStr(customDate)));

      if (!matchDate) return false;

      if (statusFilter === "All") return true;
      if (statusFilter === "Expired") {
        return (
          (t.status === "Pending" || t.status === "In Progress") &&
          t.endDate < todayStr
        );
      }
      return t.status === statusFilter;
    });

    // Count only filtered tasks
    fTasks?.forEach((t) => {
      stats.total++;
      if (t.status === "Completed") stats.completed++;
      else if (t.status === "In Progress") stats.progress++;
      else if (t.status === "Pending") stats.pending++;
    });

    // Expiring (today or tomorrow) & not done
    const expiring = tasks?.filter(
      (t) =>
        (t.endDate === todayStr || t.endDate === tomorrowStr) &&
        (t.status === "Pending" || t.status === "In Progress"),
    );

    return { filteredTasks: fTasks, counts: stats, expiringTasks: expiring };
  }, [tasks, dateFilter, statusFilter, customDate, todayStr, yesterdayStr]);

  // ─── CRUD helpers ────────────────────────────────────────
  const updateTask = async (task) => {
    setLoading(true);

    const previousTasks = tasks;

    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, ...task } : t)),
    );

    try {
      const { data } = await axios.put(`/api/auth/tasks/${task._id}`, task);

      setTasks((prev) =>
        prev.map((t) => (t._id === data.task._id ? data.task : t)),
      );
    } catch (error) {
      console.error("❌ Update failed, rolling back...", error);
      setTasks(previousTasks);
    }
    setLoading(false);
  };

  const deleteTask = async (id) => {
    setLoading(true);
    await axios.delete(`/api/auth/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
    setLoading(false);
  };

  // ─── UI helpers ──────────────────────────────────────────
  /* SummaryBox removed */

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="w-full h-full flex flex-col">
      <h1 className="text-primary text-3xl font-bold py-4">Dashboard</h1>
      {/* Modal */}
      {showNewTask && (
        <NewTask
          onUpdate={updateTask}
          existingTask={editTask}
          onClose={() => {
            setShowNewTask(false);
            setEditTask(null);
          }}
          callingFrom="Dashboard"
        />
      )}

      <div className="flex lgg:flex-row flex-col gap-4 h-[90%]">
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
        {/* RIGHT ─ Summary + Expiring ─────────────────────── */}
        {(tab == "Status" || tab == "Both") && (
          <div className="lgg:w-1/2 w-full h-full  flex flex-col gap-4">
            {/* Progress Summary */}
            <div className="sm:h-[40%] h-[30%] shadow-dark sm:p-6 p-2 rounded-2xl">
              <h3 className="text-primary sm:relative absolute font-semibold sm:text-base text-sm sm:mb-4 px-4 pt-4">
                Task Summary
              </h3>
              <div className="flex justify-around items-center h-full sm:pt-0 pt-10">
                <StatusChart
                  label="Completed"
                  value={
                    counts.total ? (counts.completed / counts.total) * 100 : 0
                  }
                  color="#22c55e"
                />
                <StatusChart
                  label="In Progress"
                  value={
                    counts.total ? (counts.progress / counts.total) * 100 : 0
                  }
                  color="#F0B100"
                />
                <StatusChart
                  label="Pending"
                  value={
                    counts.total ? (counts.pending / counts.total) * 100 : 0
                  }
                  color="#FF6767"
                />
              </div>
            </div>

            {/* Expiring */}
            <div className="sm:h-[60%] h-[70%] shadow-dark p-4 rounded-2xl space-y-4 pb-20 relative">
              <h3 className="absolute top-6 right-4 bg-white p-4 z-10 text-red-500 font-semibold">
                Tasks Expiring Tomorrow
              </h3>
              <div className="pt-18 h-full flex flex-col gap-4 overflow-y-scroll hide-scrollbar">
                {expiringTasks.length ? (
                  expiringTasks.map((t) => (
                    <TaskCard
                      key={t._id}
                      task={t}
                      onStatusChange={(status) => updateTask({ ...t, status })}
                      onEdit={() => {
                        setEditTask(t);
                        setShowNewTask(true);
                      }}
                      onDelete={() => deleteTask(t._id)}
                    />
                  ))
                ) : (
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
                        <FaRegClipboard size={30} /> No Tasks Expiring Tomorrow
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        {/* LEFT ─ Filters + List ──────────────────────────── */}
        {(tab == "Tasks" || tab == "Both") && (
          <div className="lgg:w-1/2 w-full h-full pb-20 shadow-dark px-6 pt-6 rounded-l-2xl rounded-br-2xl relative">
            {/* Filters */}
            <div className="absolute top-6 right-4 flex gap-4 p-2 z-10">
              {/* Date Filter */}
              <Dropdown
                label={
                  dateFilter === "Calendar"
                    ? customDate.toLocaleDateString("en-GB")
                    : dateFilter
                }
                open={showDateDD}
                setOpen={setShowDateDD}
              >
                {DATE_OPTIONS.map((opt) => (
                  <Item
                    key={opt}
                    onClick={() => {
                      setDateFilter(opt);
                      setShowDateDD(false);
                    }}
                  >
                    {opt}
                  </Item>
                ))}
                <Item>
                  <DatePicker
                    selected={customDate}
                    onChange={(d) => {
                      setCustomDate(d);
                      setDateFilter("Calendar");
                      setShowDateDD(false);
                    }}
                    dateFormat="dd-MM-yyyy"
                    className="w-full cursor-pointer outline-none"
                  />
                </Item>
              </Dropdown>

              {/* Status Filter */}
              <Dropdown
                label={statusFilter}
                open={showStatusDD}
                setOpen={setShowStatusDD}
              >
                {STATUS_OPTIONS.map((s) => (
                  <Item
                    key={s}
                    onClick={() => {
                      setStatusFilter(s);
                      setShowStatusDD(false);
                    }}
                  >
                    {s}
                  </Item>
                ))}
              </Dropdown>
            </div>

            {/* Task List */}
            <div className="pt-18 flex flex-col gap-4 h-full overflow-y-scroll hide-scrollbar">
              {filteredTasks?.length ? (
                filteredTasks?.map((t) => (
                  <TaskCard
                    key={t._id}
                    task={t}
                    onStatusChange={(status) => updateTask({ ...t, status })}
                    onEdit={() => {
                      setEditTask(t);
                      setShowNewTask(true);
                    }}
                    onDelete={() => deleteTask(t._id)}
                  />
                ))
              ) : (
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
                      <FaRegClipboard size={30} /> No Tasks Found
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reusable tiny components ──────────────────────────────
const Dropdown = ({ label, open, setOpen, children }) => (
  <div className="relative sm:w-40 w-26">
    <div
      onClick={() => setOpen((o) => !o)}
      role="button"
      tabIndex={0}
      aria-label="Dropdown"
      className="flex items-center justify-between px-4 py-2 border sm:text-base text-sm rounded cursor-pointer bg-white"
    >
      <span>{label}</span>
      <FaChevronDown
        className={`ml-2 sm:scale-[1] scale-[0.9] transition-transform ${open ? "rotate-180" : ""}`}
      />
    </div>
    {open && (
      <div className="absolute mt-1 w-full bg-white shadow rounded z-10">
        {children}
      </div>
    )}
  </div>
);

const Item = ({ children, onClick }) => (
  <div className="px-4 py-2 hover:bg-gray-100 cursor-pointer" onClick={onClick}>
    {children}
  </div>
);

export default Dashboard;

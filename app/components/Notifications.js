"use client";
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { getTodayDate } from "../lib/dateUtils";
import { FaRegClock, FaRegStickyNote, FaSpinner } from "react-icons/fa";
import { useSession } from "next-auth/react";

const Notifications = () => {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [missingDiaryDate, setMissingDiaryDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAllTasks, setShowAllTasks] = useState(false);

  // Use local component loading state instead of global loading context
  const fetchNotifications = async () => {
    if (!session?.user?.id) return;

    setLoading(true);
    try {
      // Parallel data fetching for better performance
      const [tasksRes, diaryRes] = await Promise.allSettled([
        axios.get(`/api/auth/tasks?type=all`),
        (async () => {
          const yesterday = getTodayDate();
          yesterday.setDate(yesterday.getDate() - 1);
          // Use 'en-CA' (YYYY-MM-DD) for local date format consistency
          const formattedYesterday = yesterday.toLocaleDateString("en-CA");
          const res = await axios.get(`/api/auth/diary`, {
            params: {
              date: formattedYesterday,
              userId: session.user.id,
            },
          });
          return { data: res.data, date: formattedYesterday };
        })(),
      ]);

      // Handle Tasks Response
      if (tasksRes.status === "fulfilled") {
        setTasks(tasksRes.value.data || []);
      } else {
        // Silent error
      }

      // Handle Diary Response
      if (diaryRes.status === "fulfilled") {
        const { data, date } = diaryRes.value;
        const diaryContent = data?.content || "";
        if (!diaryContent.trim()) {
          setMissingDiaryDate(date);
        } else {
          setMissingDiaryDate(null);
        }
      } else {
        // Build resiliently: if diary fetch fails, just don't show the warning
      }
    } catch (err) {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  // Memoized derived state to prevent recalculation on every render
  const today = getTodayDate().toLocaleDateString("en-CA");

  const expiredTasks = useMemo(() => {
    return tasks.filter(
      (task) => task.status !== "Completed" && task.endDate < today,
    );
  }, [tasks, today]);

  const pendingTaskCount = useMemo(() => {
    return tasks.filter((task) => task.status === "Pending").length;
  }, [tasks]);

  return (
    <div className="w-full max-w-[550px] sm:w-[400px] md:w-[550px] md:h-[700px] h-[600px] p-6 sm:p-8 flex flex-col bg-white shadow-dark gap-6 rounded-2xl max-h-[90vh]">
      <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary border-b pb-4 border-gray-100">
        <FaRegClock className="text-xl" />
        <span>Notifications</span>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 hide-scrollbar relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3">
            <FaSpinner className="animate-spin text-3xl text-primary/80" />
            <span className="text-sm font-medium">Checking updates...</span>
          </div>
        ) : (
          <>
            {/* Diary Notification */}
            {missingDiaryDate && (
              <div className="border border-yellow-200 bg-yellow-50 text-yellow-800 p-4 rounded-xl flex gap-3 items-start text-sm sm:text-base shadow-sm transition-all hover:shadow-md">
                <FaRegStickyNote className="mt-1 text-lg flex-shrink-0" />
                <div>
                  <h2 className="font-semibold text-sm sm:text-base mb-1">
                    Diary Missing
                  </h2>
                  <p className="leading-snug text-gray-700">
                    You didn’t write a diary entry on{" "}
                    <strong className="text-yellow-900">
                      {missingDiaryDate}
                    </strong>
                    . Try keeping your streak going!
                  </p>
                </div>
              </div>
            )}

            {/* Expired Tasks */}
            <div className="border border-gray-200 rounded-xl p-4 sm:p-6 shadow-sm transition-all hover:shadow-md bg-white">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                  {expiredTasks.length === 0 ? (
                    <span className="text-green-600">No Expired Tasks</span>
                  ) : (
                    <span className="text-red-600">
                      {expiredTasks.length} Task
                      {expiredTasks.length !== 1 ? "s" : ""} Expired
                    </span>
                  )}
                </h2>

                {expiredTasks.length > 0 && (
                  <button
                    className="text-xs sm:text-sm text-primary font-medium hover:underline transition-colors focus:outline-none"
                    onClick={() => setShowAllTasks((prev) => !prev)}
                  >
                    {showAllTasks ? "Hide Details" : "View Details"}
                  </button>
                )}
              </div>

              <p className="text-sm text-gray-500 mb-4 leading-relaxed">
                {expiredTasks.length === 0
                  ? "You’re all caught up! Great job staying on top of your schedule."
                  : "These tasks are past their due date. Complete them or update their deadlines."}
              </p>

              {showAllTasks && expiredTasks.length > 0 && (
                <div className="space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto pr-1 hide-scrollbar custom-transition">
                  {expiredTasks.map((task) => (
                    <div
                      key={task._id}
                      className="bg-gray-50 border border-gray-100 px-3 sm:px-4 py-3 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex flex-col flex-1 min-w-0 pr-2">
                        <span className="font-medium text-sm text-gray-800 truncate">
                          {task.title}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          Due: {task.endDate}
                        </span>
                      </div>

                      <div
                        className={`text-[10px] sm:text-xs px-2 py-1 rounded-full font-semibold border whitespace-nowrap ${
                          task.status === "Pending"
                            ? "text-red-600 bg-red-50 border-red-200"
                            : "text-yellow-700 bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        {task.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs sm:text-sm text-gray-500">
                <span>Current Status</span>
                <span className="font-medium text-gray-700">
                  {pendingTaskCount}{" "}
                  {pendingTaskCount === 1 ? "Start" : "Pending"} Task
                  {pendingTaskCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Notifications;

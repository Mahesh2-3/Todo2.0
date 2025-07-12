"use client"
import { useEffect, useState } from "react";
import { useAuth } from "../context/Authcontext";
import axios from "axios";
import { FaRegClock, FaRegStickyNote } from "react-icons/fa";
import { useLoading } from "../context/LoadingContext";

const Notifications = () => {
  const { user } = useAuth();

  const [expiredTasks, setExpiredTasks] = useState([]);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [missingDiaryDate, setMissingDiaryDate] = useState(null);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const { loading, setLoading } = useLoading()

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const headers = {
        Authorization: `Bearer ${user.token}`,
      };

      // --- 1. Fetch tasks and check for expired ---
      const tasksResponse = await axios.get(`/api/auth/tasks`, {
        headers,
      });

      const today = new Date().toISOString().split("T")[0];
      const expired = tasksResponse.data.tasks.filter(
        (task) => task.status !== "Completed" && task.endDate < today
      );
      setExpiredTasks(expired);

      // Count pending tasks
      const pendingCount = tasksResponse.data.tasks.filter(
        (task) => task.status === "Pending"
      ).length;
      setPendingTaskCount(pendingCount);

      // --- 2. Fetch yesterday's diary entry ---
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedYesterday = yesterday.toLocaleDateString("en-CA"); // yyyy-mm-dd

      const diaryRes = await axios.get(`/api/auth/diary`, {
        params: {
          date: formattedYesterday,
          userId: user._id,
        },
        headers,
      });

      const diaryContent = diaryRes?.data?.content || "";
      if (diaryContent.trim() === "") {
        setMissingDiaryDate(formattedYesterday);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false)
    }
  };

  useEffect(() => {

    fetchNotifications();
  }, [user]);

  return (
    <div className="md:w-[550px] sm:w-[400px] w-[350px] md:h-[700px] h-[600px] p-8 flex flex-col bg-white shadow-dark gap-6 rounded-2xl">
      <div className="flex items-center gap-2 text-2xl font-semibold text-primary">
        <FaRegClock /> Notifications
      </div>
      <div className="h-[90%] overflow-y-scroll flex flex-col gap-4 hide-scrollbar">
        {/* Diary Notification */}
        {missingDiaryDate && (
          <div className="border border-yellow-300 bg-yellow-50 text-yellow-800 p-4 rounded-xl flex gap-3 items-start">
            <FaRegStickyNote className="mt-1 text-xl" />
            <div>
              <h2 className="font-semibold text-base mb-1">Diary Missing</h2>
              <p className="text-sm">
                You didn’t write a diary entry on <strong>{missingDiaryDate}</strong>. Try keeping your streak going!
              </p>
            </div>
          </div>
        )}

        {/* Expired Tasks */}
        <div className="border border-gray-200 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">
              {expiredTasks.length === 0
                ? "No Expired Tasks"
                : `${expiredTasks.length} Task${expiredTasks.length !== 1 ? "s" : ""} Expired`}
            </h2>

            {expiredTasks.length > 0 && (
              <button
                className="text-sm text-blue-600 underline cursor-pointer"
                onClick={() => setShowAllTasks((prev) => !prev)}
              >
                {showAllTasks ? "Hide" : "Show All"}
              </button>
            )}
          </div>

          <p className="text-gray-700 mb-4">
            {expiredTasks.length === 0 ? (
              <>
                You’re all caught up! No expired tasks pending.
              </>
            ) : (
              "Complete the tasks or update their end date to remove the expired status."
            )}
            
          </p>

          {showAllTasks && expiredTasks.length > 0 && (
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 hide-scrollbar">
              {expiredTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-gray-100 px-4 py-3 rounded-lg shadow-sm flex justify-between items-center"
                >
                  <div className="flex flex-col flex-1">
                    <span className="font-semibold text-sm text-gray-800 truncate max-w-[180px]">
                      {task.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      {task.startDate} to {task.endDate}
                    </span>
                  </div>

                  <div
                    className={`text-xs px-2 py-[2px] rounded-full font-semibold ml-4 ${task.status === "Pending"
                      ? "text-red-500 border border-red-300"
                      : "text-yellow-600 border border-yellow-300"
                      }`}
                  >
                    {task.status}
                  </div>
                </div>
              ))}
            </div>
          )}
          <br />
            <span className="text-sm underline text-gray-600">
              {loading ? "..." : `${pendingTaskCount} ${pendingTaskCount == 1 ? "Pending Task is there." : "Pending Tasks are there."}`}
            </span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

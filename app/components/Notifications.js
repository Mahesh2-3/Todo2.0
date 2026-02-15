"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaRegClock, FaRegStickyNote } from "react-icons/fa";
import { useLoading } from "../context/LoadingContext";
import { useSession } from "next-auth/react";

const Notifications = () => {
  const { data: session } = useSession();
  const [expiredTasks, setExpiredTasks] = useState([]);
  const [showAllTasks, setShowAllTasks] = useState(false);
  const [missingDiaryDate, setMissingDiaryDate] = useState(null);
  const [pendingTaskCount, setPendingTaskCount] = useState(0);
  const { loading, setLoading } = useLoading();

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const tasksResponse = await axios.get(`/api/auth/tasks`, { headers });
      const today = new Date().toISOString().split("T")[0];

      const expired = tasksResponse.data.tasks.filter(
        (task) => task.status !== "Completed" && task.endDate < today,
      );
      setExpiredTasks(expired);

      const pendingCount = tasksResponse.data.tasks.filter(
        (task) => task.status === "Pending",
      ).length;
      setPendingTaskCount(pendingCount);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const formattedYesterday = yesterday.toLocaleDateString("en-CA");

      const diaryRes = await axios.get(`/api/auth/diary`, {
        params: {
          date: formattedYesterday,
          userId: session?.user.id,
        },
      });

      const diaryContent = diaryRes?.data?.content || "";
      if (diaryContent.trim() === "") {
        setMissingDiaryDate(formattedYesterday);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [session?.user]);

  return (
    <div className="w-full max-w-[550px] sm:w-[400px] md:w-[550px] md:h-[700px] h-[600px] p-6 sm:p-8 flex flex-col bg-white shadow-dark gap-6 rounded-2xl md:h-[700px] h-[90vh] max-h-[90vh]">
      <div className="flex items-center gap-2 text-lg sm:text-xl font-semibold text-primary">
        <FaRegClock /> Notifications
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col gap-4 hide-scrollbar">
        {/* Diary Notification */}
        {missingDiaryDate && (
          <div className="border border-yellow-300 bg-yellow-50 text-yellow-800 p-4 rounded-xl flex gap-3 items-start text-sm sm:text-base">
            <FaRegStickyNote className="mt-1 text-lg" />
            <div>
              <h2 className="font-semibold text-sm sm:text-base mb-1">
                Diary Missing
              </h2>
              <p>
                You didn’t write a diary entry on{" "}
                <strong>{missingDiaryDate}</strong>. Try keeping your streak
                going!
              </p>
            </div>
          </div>
        )}

        {/* Expired Tasks */}
        <div className="border border-gray-200 rounded-xl p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-base sm:text-lg font-semibold">
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

          <p className="text-sm text-gray-700 mb-4">
            {expiredTasks.length === 0 ? (
              <>You’re all caught up! No expired tasks pending.</>
            ) : (
              "Complete the tasks or update their end date to remove the expired status."
            )}
          </p>

          {showAllTasks && expiredTasks.length > 0 && (
            <div className="space-y-3 max-h-[250px] sm:max-h-[350px] overflow-y-auto pr-1 hide-scrollbar">
              {expiredTasks.map((task) => (
                <div
                  key={task._id}
                  className="bg-gray-100 px-3 sm:px-4 py-3 rounded-lg shadow-sm flex justify-between items-center"
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
                    className={`text-xs px-2 py-[2px] rounded-full font-semibold ml-4 ${
                      task.status === "Pending"
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
          <span className="text-xs sm:text-sm underline text-gray-600">
            {loading
              ? "..."
              : `${pendingTaskCount} ${
                  pendingTaskCount === 1
                    ? "Pending Task is there."
                    : "Pending Tasks are there."
                }`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Notifications;

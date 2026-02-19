"use client";
import { useState, useEffect, useCallback } from "react";
import TemplateCard from "../components/TemplateCard";
import axios from "axios";
import { useMediaQuery } from "react-responsive";
import { FaPlus, FaRegClipboard } from "react-icons/fa";
import NewTask from "../components/Newtask";
import { useSearch } from "../context/SearchContext";
import { useLoading } from "../context/LoadingContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

const DailyTemplates = () => {
  const { searchQuery } = useSearch();
  const [tasks, setTasks] = useState([]);
  const { loading, setLoading } = useLoading();
  const { data: session } = useSession();
  const [showNewTask, setShowNewTask] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/auth/tasks?type=daily`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [setLoading]);

  useEffect(() => {
    if (session?.user) {
      fetchTasks();
    }
  }, [session, fetchTasks]);

  const handleAddTask = async (newTask) => {
    setLoading(true);
    try {
      // Ensure it's marked as daily template
      await axios.post(`/api/auth/tasks`, {
        ...newTask,
        isDaily: true,
      });
      fetchTasks();
      toast.success("Template created");
    } catch (err) {
      toast.error("Failed to create template");
    }
    setLoading(false);
  };

  const handleUpdateTask = async (updatedTask) => {
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
    );

    try {
      await axios.put(`/api/auth/tasks/${updatedTask._id}`, updatedTask);
      toast.success("Template updated");
    } catch (err) {
      setTasks(originalTasks);
      toast.error("Update failed");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm("Delete this template? Future daily tasks will stop.")) return;

    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((t) => t._id !== taskId));

    try {
      await axios.delete(`/api/auth/tasks/${taskId}`);
      toast.success("Template deleted");
    } catch (err) {
      setTasks(originalTasks);
      toast.error("Delete failed");
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4">
      <div className="text-2xl font-semibold flex items-center gap-2">
        Daily Templates
      </div>

      <div className="w-full h-[95%] relative">
        {showNewTask && (
          <NewTask
            onAdd={handleAddTask}
            onUpdate={handleUpdateTask}
            existingTask={editTask}
            onClose={() => {
              setShowNewTask(false);
              setEditTask(null);
            }}
            callingFrom="DailyTemplates" // Hint to enforce isDaily=true
          />
        )}

        <div className="w-full h-full shadow-md border border-brick sm:p-6 p-3 relative rounded-2xl">
          <div
            className="absolute bottom-10 right-3 w-[50px] h-[50px] flex items-center justify-center bg-primary rounded-full cursor-pointer z-10"
            onClick={() => setShowNewTask(true)}
          >
            <FaPlus size={20} color="white" />
          </div>

          <div className="overflow-y-scroll hide-scrollbar space-y-4 h-full p-2">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters
                      className="animate-spin"
                      size={30}
                    />
                    Loading...
                  </>
                ) : (
                  <>
                    <FaRegClipboard size={30} /> No Templates Found
                  </>
                )}
              </div>
            ) : (
              tasks
                .filter((t) =>
                  t.title.toLowerCase().includes(searchQuery.toLowerCase()),
                )
                .map((task, index) => (
                  <TemplateCard
                    key={task._id || index}
                    task={task}
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
      </div>
    </div>
  );
};

export default DailyTemplates;

"use client";
import React, { useState, useEffect } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaBookOpen, FaSave, FaCheck } from "react-icons/fa";
import { useAuth } from "../context/Authcontext";
import { useLoading } from "../context/LoadingContext";
import axios from "axios";

const Diary = () => {
  const { user } = useAuth();
  const [date, setDate] = useState(new Date());
  const { loading,setLoading } = useLoading()
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);

  const formatDate = (d) => d.toLocaleDateString("en-CA");

  const handlePrevDay = () => {
    const prev = new Date(date);
    prev.setDate(date.getDate() - 1);
    setDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(date);
    next.setDate(date.getDate() + 1);
    setDate(next);
  };

  const isToday = () => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const fetchDiary = async () => {
    setLoading(true)
    if (!user?._id && !user?.id) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get("/api/auth/diary", {
        params: {
          date: formatDate(date),
          userId: user._id || user.id,
        },
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      setContent(response.data?.content || "");
      setSaved(true);
    } catch (error) {
      console.log("❌ Failed to fetch diary");

      if (error.response) {
        console.log("Status:", error.response.status);
        console.log("Data:", error.response.data);
      } else if (error.request) {
        console.log("No response from server:", error.request);
      } else {
        console.log("Request setup error:", error.message);
      }

      setContent("");
    } finally {
      setLoading(false)
    }
  };

  const handleSave = async () => {
    setLoading(true)
    if (!user?._id && !user?.id) {
      setLoading(false);
      return;
    }
    try {
      await axios.post(
        "/api/auth/diary",
        {
          userId: user._id || user.id,
          date: formatDate(date),
          content: typeof content === "string" ? content : "",
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setSaved(true);
    } catch (error) {
      console.error("❌ Failed to save diary");

      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      } else if (error.request) {
        console.error("No response from server:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
    } finally { setLoading(false) }
  };

  useEffect(() => {
    if (user) fetchDiary();
  }, [date, user]);

  return (
    <div className="w-full h-full p-6 shadow-dark rounded-2xl bg-[#f7f7f7] flex flex-col">
      {/* Top Heading */}
      <div className="w-full relative text-primary flex items-center justify-center gap-2 pb-4">
        <FaBookOpen className="text-primary font-bold text-3xl" />
        Diary
        <button
          onClick={handleSave}
          disabled={saved}
          className={`absolute right-0 flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold transition ${saved
              ? "bg-green-100 text-green-600"
              : "bg-primary text-white hover:bg-red-600"
            }`}
        >
          {saved ? <FaCheck /> : <FaSave />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      {/* Date Navigation */}
      <div className="w-full flex justify-between items-center pb-6">
        <IoIosArrowBack
          className="text-xl hover:scale-110 cursor-pointer"
          onClick={handlePrevDay}
        />
        <span className="text-sm font-medium select-none">
          {date.toDateString()}
        </span>
        <IoIosArrowForward
          className={`text-xl hover:scale-110 ${isToday() ? "text-gray-300 cursor-not-allowed" : "cursor-pointer"
            }`}
          onClick={() => {
            if (!isToday()) handleNextDay();
          }}
        />
      </div>

      {/* Diary Input Area */}
      <div className="flex-1 w-full sm:px-6 py-10 hide-scrollbar relative">
        <div className="relative w-full">
          <textarea
            autoFocus
            value={content}
            placeholder={loading ? "Loading Content...." : "Start writing your thoughts..."}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
            className="w-full resize-none outline-none text-base font-medium text-gray-700 p-4 leading-[29px] bg-[url(https://img.freepik.com/premium-photo/notebook-paper-background-blank-pages-notebook_322958-3818.jpg?w=996)]"
            style={{
              backgroundSize: "100% 29px",
              backgroundAttachment: "local",
              backgroundRepeat: "repeat",
              minHeight: "calc(100vh - 120px)",
            }}
          />

          <div className="w-full mt-4 text-right pr-2">
            <p className="text-sm font-semibold text-gray-400 italic">
              — {user?.username || "Anonymous"} | {formatDate(date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diary;

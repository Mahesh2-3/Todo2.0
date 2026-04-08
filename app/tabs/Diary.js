"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FaBookOpen, FaSave, FaCheck, FaCalendarAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useLoading } from "../context/LoadingContext";
import { getTodayDate } from "../lib/dateUtils";
import axios from "axios";
import { useSession } from "next-auth/react";

const Diary = () => {
  const { data: session } = useSession();
  const [date, setDate] = useState(getTodayDate());
  const [writtenDates, setWrittenDates] = useState([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const { loading, setLoading } = useLoading();
  const [content, setContent] = useState("");
  const [saved, setSaved] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const lastSavedContent = useRef(""); // To track last saved content to prevent duplicates and loops

  const formatDate = useCallback((d) => d.toLocaleDateString("en-CA"), []);

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
    const today = getTodayDate();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  const handleSave = async (manual = true) => {
    if (!session?.user.id) return;

    if (content === lastSavedContent.current) return;

    if (manual) setLoading(true);
    else setIsSaving(true);

    try {
      await axios.post("/api/auth/diary", {
        userId: session?.user.id,
        date: formatDate(date),
        content: typeof content === "string" ? content : "",
      });
      lastSavedContent.current = content;
      setSaved(true);
    } catch (error) {
      console.log(error);
    } finally {
      if (manual) setLoading(false);
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== lastSavedContent.current) {
        handleSave(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [content]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (content !== lastSavedContent.current) {
        handleSave(false);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [content]);

  useEffect(() => {
    const fetchDiary = async () => {
      setLoading(true);
      if (!session?.user.id) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("/api/auth/diary", {
          params: {
            date: formatDate(date),
            userId: session?.user.id,
          },
        });

        const currentContent = response.data?.content || "";
        setContent(currentContent);
        lastSavedContent.current = currentContent; // Sync ref
        setSaved(true);
      } catch (error) {
        setContent("");
        lastSavedContent.current = "";
      } finally {
        setLoading(false);
      }
    };
    if (session?.user) fetchDiary();
  }, [date, session?.user, formatDate, setLoading]);

  useEffect(() => {
    const fetchWrittenDates = async () => {
      if (!session?.user.id) return;
      try {
        const response = await axios.get("/api/auth/diary", {
          params: { fetchDates: "true" }
        });
        if (Array.isArray(response.data)) {
          // Add a dummy time to ensure date matches properly despite timezone
          const dates = response.data.map((d) => new Date(`${d}T12:00:00Z`));
          setWrittenDates(dates);
        }
      } catch (error) {
        console.error("Failed to fetch written dates:", error);
      }
    };
    if (session?.user) {
      fetchWrittenDates();
    }
  }, [session?.user, saved]); // Re-fetch dates when a diary entry is saved

  return (
    <div className="w-full h-full p-6 shadow-dark rounded-2xl bg-(--bg-card) text-(--text-main) border border-(--border-color) flex flex-col">
      {/* Top Heading */}
      <div className="w-full relative text-primary flex items-center justify-center gap-2 pb-4">
        <FaBookOpen className="text-primary font-bold text-3xl" />
        Diary
        <div className="absolute right-0 flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-(--text-muted) italic">Saving...</span>
          )}
          <button
            onClick={() => handleSave(true)}
            disabled={saved}
            className={`flex items-center gap-2 px-4 py-1 rounded-full text-sm font-semibold transition ${
              saved
                ? "bg-green-100 text-green-600"
                : "bg-primary text-white hover:bg-red-600"
            }`}
          >
            {saved ? <FaCheck /> : <FaSave />}
            {saved ? "Saved" : "Save"}
          </button>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="w-full flex justify-between items-center pb-6 relative">
        <button
          onClick={handlePrevDay}
          aria-label="Previous Day"
          className="contents"
        >
          <IoIosArrowBack className="text-xl hover:scale-110 cursor-pointer" />
        </button>

        <div className="flex items-center gap-2 cursor-pointer relative" onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}>
          <span className="text-sm font-medium select-none hover:text-primary transition">
            {date.toDateString()}
          </span>
          <FaCalendarAlt className="text-primary hover:scale-110 transition" />

          {isDatePickerOpen && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-50 shadow-xl rounded-lg" onClick={(e) => e.stopPropagation()}>
              <DatePicker
                selected={date}
                onChange={(d) => {
                  setDate(d);
                  setIsDatePickerOpen(false);
                }}
                inline
                highlightDates={[{
                  "react-datepicker__day--highlighted-custom": writtenDates
                }]}
                maxDate={new Date()}
              />
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (!isToday()) handleNextDay();
          }}
          aria-label="Next Day"
          className="contents"
          disabled={isToday()}
        >
          <IoIosArrowForward
            className={`text-xl hover:scale-110 ${
              isToday() ? "text-(--text-muted) opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          />
        </button>
      </div>

      {/* Global CSS for DatePicker Highlights */}
      <style dangerouslySetInnerHTML={{__html: `
        .react-datepicker__day--highlighted-custom {
          background-color: #4CAF50 !important;
          color: white !important;
          border-radius: 50%;
        }
        .react-datepicker__day--highlighted-custom:hover {
          background-color: #45a049 !important;
        }
      `}} />

      {/* Diary Input Area */}
      <div className="flex-1 w-full sm:px-6 py-10 hide-scrollbar relative">
        <div className="relative w-full">
          <textarea
            autoFocus
            value={content}
            placeholder={
              loading ? "Loading Content...." : "Start writing your thoughts..."
            }
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
            onBlur={() => handleSave(false)} // Save when user clicks away
            className="w-full resize-none outline-none text-base font-medium text-gray-700 p-4 leading-[29px] bg-[url(https://img.freepik.com/premium-photo/notebook-paper-background-blank-pages-notebook_322958-3818.jpg?w=996)]"
            style={{
              backgroundSize: "100% 29px",
              backgroundAttachment: "local",
              backgroundRepeat: "repeat",
              minHeight: "calc(100vh - 120px)",
            }}
          />

          <div className="w-full mt-4 text-right pr-2">
            <p className="text-sm font-semibold text-(--text-muted) italic">
              — {session?.user?.username || "Anonymous"} | {formatDate(date)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Diary;

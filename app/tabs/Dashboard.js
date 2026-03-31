"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { getTodayDate } from "../lib/dateUtils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import "react-calendar-heatmap/dist/styles.css";
import { useLoading } from "../context/LoadingContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Dashboard = () => {
  const { setLoading } = useLoading();
  // Cache stats per range to prevent unnecessary re-fetching
  const [cachedStats, setCachedStats] = useState({});
  const [stats, setStats] = useState({ weeklyStats: [], heatmapStats: [] });
  const [loadingGraph, setLoadingGraph] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
  }, []);

  const [range, setRange] = useState("weekly");

  useEffect(() => {
    const fetchStats = async () => {
      // Use cached data if available for this range
      if (cachedStats[range]) {
        setStats(cachedStats[range]);
        setLoadingGraph(false);
        return;
      }

      try {
        setLoadingGraph(true);
        const { data } = await axios.get(
          `/api/auth/tasks/stats?range=${range}`,
        );

        // Ensure heatmap doesn't flicker/reset by carrying over existing heatmap data if not included
        // or just set the whole data object to state and cache
        setCachedStats(prev => ({ ...prev, [range]: data }));
        setStats(data);
      } catch (error) {
        // Silent error
      } finally {
        setLoadingGraph(false);
      }
    };

    fetchStats();
  }, [range, cachedStats]);

  // Use a soft loading indicator or blur instead of unmounting the whole component so heatmap stays visible
  // Only fully block UI on initial load where we have NO stats
  if (loadingGraph && !stats.weeklyStats.length) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <AiOutlineLoading3Quarters
          className="animate-spin text-primary"
          size={50}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col sm:gap-8 gap-4 overflow-y-auto hide-scrollbar pb-20">
      <h1 className="text-primary sm:text-3xl text-2xl font-bold sm:py-4">
        Dashboard
      </h1>

      {/* Area Chart Section */}
      <div className="bg-[var(--bg-card)] text-[var(--text-main)] sm:p-6 p-2 rounded-2xl shadow-dark transition-colors">
        <div className="flex justify-between items-center mb-6 max-sm:px-3 max-sm:pt-2">
          <h2 className="sm:text-xl text-sm font-semibold text-[var(--text-main)]">
            Completion Rate ({range.charAt(0).toUpperCase() + range.slice(1)})
          </h2>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {["weekly", "monthly", "yearly"].map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={`px-3 py-1 text-[10px] sm:text-sm rounded-md transition-all ${
                  range === r
                    ? "bg-white text-primary shadow-sm font-medium"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className={`sm:h-[300px] h-[200px] w-full transition-opacity duration-300 ${loadingGraph ? 'opacity-50' : 'opacity-100'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.weeklyStats}
              className="sm:text-xs text-[10px]"
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff00" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#00ff00" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "1px solid #FF6767",
                }}
                itemStyle={{ color: "#FF6767" }}
                labelStyle={{ color: "#FF6767", fontWeight: "bold" }}
              />
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <Area
                type="monotone"
                dataKey="percentage"
                stroke="#00ff00"
                fillOpacity={1}
                fill="url(#colorPv)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Heatmap Section */}
      <div className="bg-[var(--bg-card)] text-[var(--text-main)] sm:p-6 p-2 rounded-2xl shadow-dark transition-colors">
        <h2 className="sm:text-xl text-md font-semibold mb-6 max-sm:px-3 max-sm:pt-2 text-[var(--text-main)]">
          Activity
        </h2>
        <div className="w-full">
          <ReactTooltip id="heatmap-tooltip" />
          <CalendarHeatmap
            startDate={
              isMobile
                ? new Date(
                    new Date(getTodayDate()).setMonth(
                      getTodayDate().getMonth() - 6,
                    ),
                  )
                : new Date(
                    new Date(getTodayDate()).setFullYear(
                      getTodayDate().getFullYear() - 1,
                    ),
                  )
            }
            endDate={getTodayDate()}
            values={stats.heatmapStats}
            classForValue={(value) => {
              if (!value) {
                return "color-empty";
              }
              return `color-github-${Math.min(value.count, 4)}`;
            }}
            tooltipDataAttrs={(value) => {
              if (!value || !value.date) {
                return {
                  "data-tooltip-id": "heatmap-tooltip",
                  "data-tooltip-content": "No activity"
                };
              }
              let tip = `${value.date}: `;
              if (value.tasksCompleted > 0) {
                 tip += `${value.tasksCompleted} tasks completed`;
                 if (value.diaryWritten) tip += ` & diary written`;
              } else if (value.diaryWritten) {
                 tip += `📝 Diary entry added`;
              } else {
                 tip += `No activity`;
              }
              return {
                "data-tooltip-id": "heatmap-tooltip",
                "data-tooltip-content": tip
              };
            }}
            showWeekdayLabels={true}
          />
        </div>
      </div>

      <style jsx global>{`
        .react-calendar-heatmap text {
          font-size: 8px;
          fill: #aaa;
        }
        .react-calendar-heatmap .color-empty {
          fill: #ebedf0;
        }
        .react-calendar-heatmap .color-github-1 {
          fill: #ffcdcd;
        }
        .react-calendar-heatmap .color-github-2 {
          fill: #ff9b9b;
        }
        .react-calendar-heatmap .color-github-3 {
          fill: #ff6767;
        }
        .react-calendar-heatmap .color-github-4 {
          fill: #e60000;
        }
        /* Remove focus outline from Recharts */
        .recharts-wrapper:focus,
        .recharts-surface:focus {
          outline: none;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;

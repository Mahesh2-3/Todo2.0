"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
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
import "react-calendar-heatmap/dist/styles.css";
import { useLoading } from "../context/LoadingContext";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const Dashboard = () => {
  const { setLoading } = useLoading();
  const [stats, setStats] = useState({ weeklyStats: [], heatmapStats: [] });
  const [loadingGraph, setLoadingGraph] = useState(true);
  const isMobile = window.innerWidth < 640;

  const [range, setRange] = useState("weekly");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingGraph(true);
        const { data } = await axios.get(
          `/api/auth/tasks/stats?range=${range}`,
        );
        setStats(data);
      } catch (error) {
        // Silent error
      } finally {
        setLoadingGraph(false);
      }
    };

    fetchStats();
  }, [range]);

  if (loadingGraph) {
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
      <div className="bg-white sm:p-6 p-2 rounded-2xl shadow-dark">
        <div className="flex justify-between items-center mb-6 max-sm:px-3 max-sm:pt-2">
          <h2 className="sm:text-xl text-sm font-semibold text-gray-700">
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
        <div className="sm:h-[300px] h-[200px] w-full">
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
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip />
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
      <div className="bg-white sm:p-6 p-2 rounded-2xl shadow-dark">
        <h2 className="sm:text-xl text-md font-semibold mb-6 max-sm:px-3 max-sm:pt-2 text-gray-700">
          Activity
        </h2>
        <div className="w-full">
          <CalendarHeatmap
            startDate={
              isMobile
                ? new Date(new Date().setMonth(new Date().getMonth() - 6))
                : new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            }
            endDate={new Date()}
            values={stats.heatmapStats}
            classForValue={(value) => {
              if (!value) {
                return "color-empty";
              }
              return `color-github-${Math.min(value.count, 4)}`;
            }}
            tooltipDataAttrs={(value) => {
              return {
                "data-tip": `${value.date} has count: ${value.count || 0}`,
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
      `}</style>
    </div>
  );
};

export default Dashboard;

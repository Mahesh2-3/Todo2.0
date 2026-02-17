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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingGraph(true);
        const { data } = await axios.get("/api/auth/tasks/stats");
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoadingGraph(false);
      }
    };

    fetchStats();
  }, []);

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
    <div className="w-full h-full flex flex-col gap-8 overflow-y-auto hide-scrollbar pb-20">
      <h1 className="text-primary text-3xl font-bold py-4">Dashboard</h1>

      {/* Area Chart Section */}
      <div className="bg-white p-6 rounded-2xl shadow-dark">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Weekly Completion Rate
        </h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={stats.weeklyStats}
              className="text-xs"
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
      <div className="bg-white p-6 rounded-2xl shadow-dark">
        <h2 className="text-xl font-semibold mb-6 text-gray-700">
          Activity Heatmap
        </h2>
        <div className="w-full">
          {/* can you put gap between months */}
          <CalendarHeatmap
            startDate={
              new Date(new Date().setFullYear(new Date().getFullYear() - 1))
            }
            endDate={new Date()}
            gutterSize={1}
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

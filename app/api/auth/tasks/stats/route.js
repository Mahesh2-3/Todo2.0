import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongoose";
import Task from "@/app/models/Task";
import { getServerSession } from "next-auth";
import { authOptions } from "../../[...nextauth]/route";

export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id; // Corrected: session.user.id is always available thanks to callback

    // Fetch all tasks for the user, excluding templates
    const tasks = await Task.find({ userId, isTemplate: { $ne: true } });

    // 1. Stats based on range (weekly/monthly/yearly)
    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "weekly"; // Default to weekly

    const statsMap = new Map();
    const now = new Date();
    now.setHours(23, 59, 59, 999);

    let loopStart, loopEnd, getLabel, getKey, getDiff, steps;

    if (range === "monthly") {
      // Last 6 months
      loopStart = 5; // 5 months ago
      loopEnd = 0; // Current month
      steps = 1; // Step by 1 month

      getLabel = (d) =>
        d.toLocaleString("default", { month: "short", year: "numeric" });
      getKey = (d) => `${d.getFullYear()}-${d.getMonth()}`; // unique key mechanism
      getDiff = (d1, d2) =>
        (d1.getFullYear() - d2.getFullYear()) * 12 +
        (d1.getMonth() - d2.getMonth());
    } else if (range === "yearly") {
      // Last 5 years
      loopStart = 4; // 4 years ago
      loopEnd = 0; // Current year
      steps = 1;

      getLabel = (d) => d.getFullYear().toString();
      getKey = (d) => d.getFullYear();
      getDiff = (d1, d2) => d1.getFullYear() - d2.getFullYear();
    } else {
      // Default: Weekly (Last 7 weeks as in original code)
      loopStart = 4;
      loopEnd = -2;
      steps = 1;

      getLabel = (d) => {
        const day = d.getDate().toString().padStart(2, "0");
        const month = d.toLocaleString("default", { month: "short" });
        const year = d.getFullYear();
        return `${day} - ${month} - ${year}`;
      };

      // We'll stick to the original logic where index is the key
      getKey = (i) => i;
      getDiff = (d1, d2) => Math.floor((d1 - d2) / (1000 * 60 * 60 * 24 * 7));
    }

    // Initialize map
    if (range === "monthly") {
      for (let i = loopStart; i >= loopEnd; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const label = getLabel(d);
        statsMap.set(i, { name: label, total: 0, completed: 0 });
      }
    } else if (range === "yearly") {
      for (let i = loopStart; i >= loopEnd; i--) {
        const d = new Date(now);
        d.setFullYear(d.getFullYear() - i);
        const label = getLabel(d);
        statsMap.set(i, { name: label, total: 0, completed: 0 });
      }
    } else {
      // Weekly initialization (from original code logic)
      for (let i = loopStart; i >= loopEnd; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        const label = getLabel(d);
        statsMap.set(i, { name: label, total: 0, completed: 0 });
      }
    }

    tasks.forEach((task) => {
      const taskDate = new Date(task.updatedAt || task.createdAt);
      let index;

      if (range === "monthly") {
        index = getDiff(now, taskDate);
      } else if (range === "yearly") {
        index = getDiff(now, taskDate);
      } else {
        // Weekly logic
        const diffTime = now - taskDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        index = Math.floor(diffDays / 7);
      }

      if (statsMap.has(index)) {
        const entry = statsMap.get(index);
        entry.total += 1;
        if (task.status === "Completed") {
          entry.completed += 1;
        }
      }
    });

    const weeklyStats = [];
    // Convert map to array, maintaining the order (oldest to newest)
    // The loop direction depends on how we initialized.
    // We initialized from Past (positive) -> Future/Present (negative/zero)
    // We want output: Oldest -> Newest.
    // In our map:
    //   Weekly: 4 (oldest) ... -2 (newest).
    //   Monthly: 5 (oldest) ... 0 (newest).
    //   Yearly: 4 (oldest) ... 0 (newest).

    // So we iterate High -> Low
    for (let i = loopStart; i >= loopEnd; i--) {
      if (statsMap.has(i)) {
        const item = statsMap.get(i);
        const percentage =
          item.total > 0 ? Math.round((item.completed / item.total) * 100) : 0;
        weeklyStats.push({ name: item.name, percentage });
      }
    }

    // 2. Heatmap Stats (Last 365 days)
    // Group completed tasks by date (YYYY-MM-DD)
    const heatmapMap = new Map();

    tasks.forEach((task) => {
      if (task.status === "Completed") {
        const dateStr = new Date(task.updatedAt).toISOString().split("T")[0];
        heatmapMap.set(dateStr, (heatmapMap.get(dateStr) || 0) + 1);
      }
    });

    const heatmapStats = Array.from(heatmapMap.entries()).map(
      ([date, count]) => ({
        date,
        count,
      }),
    );

    return NextResponse.json({ weeklyStats, heatmapStats });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

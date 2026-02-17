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

    // 1. Weekly Completion Stats (Last 7 Weeks)
    // We need to group tasks by week and calculate completion %
    const weeklyMap = new Map();

    const now = new Date();
    now.setHours(23, 59, 59, 999); // Set to end of day to include today fully

    // Initialize rolling 7-day windows (from 4 weeks ago to 2 weeks in future)
    // i > 0: Past weeks
    // i = 0: Current week (ending today)
    // i < 0: Future weeks
    for (let i = 4; i >= -2; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i * 7);

      const day = d.getDate().toString().padStart(2, "0");
      const month = d.toLocaleString("default", { month: "short" });
      const year = d.getFullYear();
      const label = `${day} - ${month} - ${year}`;

      weeklyMap.set(i, {
        // Use index as key to maintain sort order
        name: label,
        total: 0,
        completed: 0,
        percentage: 0,
      });
    }

    tasks.forEach((task) => {
      const taskDate = new Date(task.updatedAt || task.createdAt);

      const diffTime = now - taskDate;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      // Calculate which 7-day window this falls into
      // Positive index = Past
      // Negative index = Future
      const weekIndex = Math.floor(diffDays / 7);

      if (weekIndex >= -2 && weekIndex <= 4) {
        const entry = weeklyMap.get(weekIndex);

        if (entry) {
          entry.total += 1;
          if (task.status === "Completed") {
            entry.completed += 1;
          }
        }
      }
    });

    // Calculate percentages and reverse to show oldest to newest (L -> R)
    const weeklyStats = [];
    for (let i = 4; i >= -2; i--) {
      const week = weeklyMap.get(i);
      const percentage =
        week.total > 0 ? Math.round((week.completed / week.total) * 100) : 0;
      weeklyStats.push({
        name: week.name,
        percentage,
      });
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

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongoose";
import Streak from "@/app/models/Streak";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getTodayDate } from "@/app/lib/dateUtils";

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user.id;
    const { activity } = await req.json(); // "task" or "diary"

    if (!["task", "diary"].includes(activity)) {
      return NextResponse.json({ error: "Invalid activity type" }, { status: 400 });
    }

    // Use local date like elsewhere in the app
    const today = getTodayDate();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    // Get yesterday's date string
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    // Get today's streak to check if it already exists
    let currentStreak = await Streak.findOne({ userId, date: todayStr });

    // Check yesterday's streak
    let yesterdayStreak = await Streak.findOne({ userId, date: yesterdayStr });
    let previousCount = yesterdayStreak ? yesterdayStreak.streakCount : 0;

    if (!currentStreak) {
      // First activity of the day
      currentStreak = new Streak({
        userId,
        date: todayStr,
        tasksCompleted: activity === "task" ? 1 : 0,
        diaryWritten: activity === "diary",
        streakCount: previousCount + 1, // Increment from yesterday
        activityType: [activity]
      });
    } else {
      // Activity already happened today, just update counts/flags
      if (activity === "task") {
        currentStreak.tasksCompleted += 1;
        if (!currentStreak.activityType.includes("task")) {
          currentStreak.activityType.push("task");
        }
      } else if (activity === "diary") {
        currentStreak.diaryWritten = true;
        if (!currentStreak.activityType.includes("diary")) {
          currentStreak.activityType.push("diary");
        }
      }
      // Streak count remains the same since they already incremented it today
    }

    await currentStreak.save();

    return NextResponse.json({ streakCount: currentStreak.streakCount, currentStreak });
  } catch (error) {
    console.error("Streak POST Error:", error);
    return NextResponse.json({ error: "Failed to update streak" }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user.id;

    const today = getTodayDate();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

    const currentStreak = await Streak.findOne({ userId, date: todayStr });
    if (currentStreak) {
      return NextResponse.json({ streakCount: currentStreak.streakCount });
    }

    const yesterdayStreak = await Streak.findOne({ userId, date: yesterdayStr });
    if (yesterdayStreak) {
      // Streak from yesterday carries over visually until broken
      return NextResponse.json({ streakCount: yesterdayStreak.streakCount });
    }

    return NextResponse.json({ streakCount: 0 });
  } catch (error) {
    console.error("Streak GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch streak" }, { status: 500 });
  }
}

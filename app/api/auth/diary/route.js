import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongoose";
import Diary from "@/app/models/Diary";
import Streak from "@/app/models/Streak";
import { getTodayDate } from "@/app/lib/dateUtils";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user.id;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const fetchDates = searchParams.get("fetchDates");

    if (fetchDates === "true") {
      // Fetch all dates the user has written a diary entry
      const entries = await Diary.find({ userId }, { date: 1, _id: 0 }).lean();
      const dates = entries.map(entry => entry.date);
      return Response.json(dates);
    }

    const entry = await Diary.findOne({ userId, date });
    return Response.json(entry || {});
  } catch {
    return Response.json({ error: "Failed to fetch diary" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user.id;
    const { date, content } = await req.json();

    if (!date || typeof date !== "string") {
      return Response.json({ error: "Valid date is required" }, { status: 400 });
    }

    if (content !== undefined && typeof content !== "string") {
      return Response.json({ error: "Content must be a string" }, { status: 400 });
    }

    // Use findOneAndUpdate with upsert to prevent race conditions and save DB round-trips
    const oldEntry = await Diary.findOne({ userId, date });

    await Diary.findOneAndUpdate(
      { userId, date },
      { content: content || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Streak update logic
    if (content && content.trim() !== "" && (!oldEntry || !oldEntry.content || oldEntry.content.trim() === "")) {
        const today = getTodayDate();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Only give streak for today's diary. Backdating shouldn't increment current streak count (though this is debatable, keeping it strictly today for anti-cheat)
        if (date === todayStr) {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

            let currentStreak = await Streak.findOne({ userId, date: todayStr });
            let yesterdayStreak = await Streak.findOne({ userId, date: yesterdayStr });
            let previousCount = yesterdayStreak ? yesterdayStreak.streakCount : 0;

            if (!currentStreak) {
                currentStreak = new Streak({
                    userId,
                    date: todayStr,
                    tasksCompleted: 0,
                    diaryWritten: true,
                    streakCount: previousCount + 1,
                    activityType: ["diary"]
                });
            } else {
                currentStreak.diaryWritten = true;
                if (!currentStreak.activityType.includes("diary")) {
                    currentStreak.activityType.push("diary");
                }
            }
            await currentStreak.save();
        } else {
            // If backdating, just mark that day's streak document as having a diary entry (don't increment general count as it's historical)
            let backdateStreak = await Streak.findOne({ userId, date });
            if (!backdateStreak) {
                 // For past dates, don't calculate streak chains, just store the activity
                 backdateStreak = new Streak({
                    userId,
                    date: date,
                    tasksCompleted: 0,
                    diaryWritten: true,
                    streakCount: 0,
                    activityType: ["diary"]
                 });
            } else {
                backdateStreak.diaryWritten = true;
                if (!backdateStreak.activityType.includes("diary")) {
                    backdateStreak.activityType.push("diary");
                }
            }
            await backdateStreak.save();
        }
    }

    return Response.json({ message: "Saved successfully" });
  } catch (error) {
    return Response.json({ error: "Failed to save diary" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongoose";
import Task from "@/app/models/Task";
import DailyCompletion from "@/app/models/DailyCompletion";
import Streak from "@/app/models/Streak";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getToday, getTodayDate } from "@/app/lib/dateUtils";

import mongoose from "mongoose";

export async function PUT(req, context) {
  try {
    await connectDB();
    const body = await req.json();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user.id;
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    // 🔵 Handle Normal/Scheduled/Daily Instance Update
    // Since we are using instances for daily tasks now, we update the task document directly.
    const oldTask = await Task.findOne({ _id: id, userId });
    const task = await Task.findOneAndUpdate({ _id: id, userId }, body, {
      new: true,
    });

    // Check if task status changed to Completed
    if (oldTask && oldTask.status !== "Completed" && task.status === "Completed") {
        const today = getTodayDate();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

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
                tasksCompleted: 1,
                diaryWritten: false,
                streakCount: previousCount + 1,
                activityType: ["task"]
            });
        } else {
            currentStreak.tasksCompleted += 1;
            if (!currentStreak.activityType.includes("task")) {
                currentStreak.activityType.push("task");
            }
        }
        await currentStreak.save();
    }

    if (!task) {
      return NextResponse.json({ message: "Task not found" }, { status: 404 });
    }

    // 🔁 Propagation: If updating a Template, update today's instance if pending
    if (task.isTemplate && task.type === "daily") {
      const today = getToday();
      await Task.updateMany(
        {
          userId,
          templateId: task._id,
          startDate: today,
          status: "Pending", // Only update if not yet completed/started? Or always? User said "edits appear on all its copies". Let's update all for today.
        },
        {
          title: task.title,
          description: task.description,
        },
      );
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user.id;
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid task ID" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const deleteType = searchParams.get("deleteType");

    // 🛑 Hard Delete Series (Template + Instance)
    if (deleteType === "series") {
      const task = await Task.findOne({ _id: id, userId });
      if (!task) {
        return NextResponse.json(
          { message: "Task not found" },
          { status: 404 },
        );
      }

      // If it's an instance, delete the template too
      if (task.templateId) {
        await Task.findByIdAndDelete(task.templateId);
      }

      await Task.findByIdAndDelete(id);
      return NextResponse.json({ message: "Series Deleted" });
    }

    // 🛑 Soft Delete (Default for ALL tasks now to support Undo)
    const taskToCheck = await Task.findOne({ _id: id, userId });
    if (taskToCheck) {
      taskToCheck.isDeleted = true;
      await taskToCheck.save();
      return NextResponse.json({ message: "Task Deleted (Soft)" });
    }

    return NextResponse.json({ message: "Task not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ message: "Delete failed" }, { status: 500 });
  }
}

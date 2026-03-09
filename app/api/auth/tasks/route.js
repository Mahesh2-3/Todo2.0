import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongoose";
import Task from "@/app/models/Task";
import DailyCompletion from "@/app/models/DailyCompletion";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

import { getToday, getDatesBetween } from "@/app/lib/dateUtils";

// =========================
// ✅ GET TASKS
// =========================
// =========================
// ✅ GET TASKS
// =========================
// =========================
// ✅ GET TASKS
// =========================
export async function GET(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user.id;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const today = getToday();

    // ─── 0. Today Request (Instance Model) ─────────────────
    if (type === "today") {
      // 1️⃣ Create missing daily instances
      const dailyTemplates = await Task.find({
        userId,
        type: "daily",
        isTemplate: true,
        isDeleted: { $ne: true },
      });

      const bulkOps = [];

      for (const template of dailyTemplates) {
        // Find the last created instance for this template
        const lastInstance = await Task.findOne({
          userId,
          templateId: template._id,
          isTemplate: false,
        }).sort({ startDate: -1 });

        // Determine starting date for backfilling
        let startDateObj;
        if (lastInstance && lastInstance.startDate) {
          const lastDate = new Date(lastInstance.startDate);
          // Start backfilling from the day after the last instance
          lastDate.setDate(lastDate.getDate() + 1);
          startDateObj = lastDate;
        } else {
          startDateObj = template.createdAt
            ? new Date(template.createdAt)
            : new Date();
        }

        const startDateStr = startDateObj.toLocaleDateString("en-CA");

        // getDatesBetween will return all dates from startDateStr up to today (inclusive)
        const missingDates = getDatesBetween(startDateStr, today, 60);

        for (const date of missingDates) {
          bulkOps.push({
            updateOne: {
              filter: {
                userId,
                templateId: template._id,
                startDate: date,
                isTemplate: false,
              },
              update: {
                $setOnInsert: {
                  userId,
                  title: template.title,
                  description: template.description,
                  type: "daily",
                  isDaily: true,
                  isTemplate: false,
                  templateId: template._id,
                  startDate: date,
                  endDate: date,
                  status: "Pending",
                },
              },
              upsert: true,
            },
          });
        }
      }

      if (bulkOps.length > 0) {
        await Task.bulkWrite(bulkOps);
      }

      // 2️⃣ Fetch today's normal tasks
      const normalTasks = await Task.find({
        userId,
        type: "normal",
        startDate: today,
        isDeleted: { $ne: true },
      });

      // 3️⃣ Fetch today's daily instances
      const dailyInstances = await Task.find({
        userId,
        type: "daily",
        isTemplate: false,
        startDate: today,
        isDeleted: { $ne: true },
        // Ensure we don't accidentally fetch templates
      });

      // 4️⃣ Combine and sort
      const combined = [...normalTasks, ...dailyInstances].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );

      return NextResponse.json(combined);
    }

    // ─── 1. Specific Type Request ─────────────────────
    if (type === "daily") {
      // Fetch templates only for management
      const templates = await Task.find({
        userId,
        type: "daily",
        isTemplate: true,
        isDeleted: { $ne: true },
      }).sort({ createdAt: -1 });
      return NextResponse.json(templates);
    }

    let filter = {
      userId,
      isTemplate: { $ne: true },
      isDeleted: { $ne: true },
    };

    // ─── 2. Scheduled Request ─────────────────────────
    if (type === "scheduled") {
      filter.startDate = { $lte: today };
      filter.endDate = { $gte: today };
      filter.type = "scheduled";

      const tasks = await Task.find(filter).sort({ createdAt: -1 });
      return NextResponse.json(tasks);
    }

    // ─── 3. Default / "All" / types ───────────────────
    if (type === "normal") {
      filter.type = "normal";
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// =========================
// ✅ CREATE TASK
// =========================
export async function POST(req) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user.id;
    const body = await req.json();

    // 🟢 Daily Template Creation
    if (body.isDaily) {
      const template = await Task.create({
        userId,
        title: body.title,
        description: body.description,
        type: "daily",
        isDaily: true,
        isTemplate: true,
      });

      return NextResponse.json({ task: template });
    }

    // Determine type for other tasks
    let type = "normal";
    if (body.startDate && body.endDate && body.startDate !== body.endDate) {
      type = "scheduled";
    }

    // 🔵 Normal/Scheduled Task
    const task = await Task.create({
      userId,
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
      type: type,
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

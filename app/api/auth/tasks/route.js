import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongoose";
import Task from "@/app/models/Task";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

const getToday = () => new Date().toISOString().split("T")[0];

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

    let filter = {
      userId,
      isTemplate: { $ne: true },
    };

    // 🔁 Daily tasks
    if (type === "daily") {
      const dailyTemplates = await Task.find({
        userId,
        isDaily: true,
        isTemplate: true,
      });

      for (const template of dailyTemplates) {
        const existing = await Task.findOne({
          userId,
          templateId: template._id,
          startDate: today,
          endDate: today,
        });

        if (!existing) {
          await Task.create({
            userId,
            title: template.title,
            description: template.description,
            isDaily: true,
            isTemplate: false,
            templateId: template._id,
            status: "Pending",
            startDate: today,
            endDate: today,
          });
        }
      }

      filter.startDate = today;
      filter.endDate = today;
    }

    // 🔵 Scheduled tasks
    if (type === "scheduled") {
      filter.startDate = { $lte: today };
      filter.endDate = { $gte: today };
      filter.$expr = { $ne: ["$startDate", "$endDate"] };
    }

    const tasks = await Task.find(filter).sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error(error);
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
    const today = getToday();

    // 🟢 Daily Template Creation
    if (body.isDaily) {
      const template = await Task.create({
        userId,
        title: body.title,
        description: body.description,
        isDaily: true,
        isTemplate: true,
        startDate: today,
        endDate: today,
      });

      return NextResponse.json({ task: template });
    }

    // 🔵 Normal Task
    const task = await Task.create({
      userId,
      title: body.title,
      description: body.description,
      startDate: body.startDate,
      endDate: body.endDate,
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

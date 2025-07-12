import { connectDB } from "@/app/lib/db";
import Task from "@/app/models/Task";
import { verifyToken } from "@/app/lib/VerifyToken";

export async function POST(req) {
  try {
    await connectDB();
    const userId = await verifyToken(req);
    const body = await req.json();
    const { title, description, status, isDaily, startDate, endDate } = body;

    const task = await Task.create({
      userId,
      title,
      description,
      status,
      isDaily,
      startDate,
      endDate,
    });

    return Response.json({ message: "Task created", task });
  } catch (err) {
    return Response.json({ error: "Failed to create task" }, { status: 400 });
  }
}

export async function GET(req) {
  try {
    await connectDB();
    const userId = await verifyToken(req);
    const tasks = await Task.find({ userId });
    return Response.json({ tasks });
  } catch (err) {
    return Response.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

import { connectDB } from "@/app/lib/db";
import Task from "@/app/models/Task";
import { verifyToken } from "@/app/lib/VerifyToken";


export async function PUT(req, context) {
  try {
    await connectDB();
    const userId = await verifyToken(req);
    const updates = await req.json();

    const { params } = await context; // <-- ✅ await here
    const updated = await Task.findOneAndUpdate(
      { _id: params.id, userId },
      updates,
      { new: true }
    );

    if (!updated) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    return Response.json({ message: "Task updated", task: updated });
  } catch {
    return Response.json({ error: "Failed to update task" }, { status: 400 });
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();
    const userId = await verifyToken(req);

    const { params } = await context; // <-- ✅ await here
    const deleted = await Task.findOneAndDelete({
      _id: params.id,
      userId,
    });

    if (!deleted) {
      return Response.json({ error: "Task not found" }, { status: 404 });
    }

    return Response.json({ message: "Task deleted" });
  } catch {
    return Response.json({ error: "Failed to delete task" }, { status: 400 });
  }
}

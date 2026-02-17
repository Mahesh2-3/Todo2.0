import { connectDB } from "@/app/lib/mongoose";
import User from "@/app/models/User";
import Task from "@/app/models/Task";
import Diary from "@/app/models/Diary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function POST(req) {
  try {
    // 1️⃣ Connect DB
    await connectDB();

    // 2️⃣ Get session
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 3️⃣ Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ Delete related data
    await Task.deleteMany({ userId });
    await Diary.deleteMany({ userId });

    // 5️⃣ Delete user
    await User.deleteOne({ _id: userId });

    return Response.json({
      success: true,
      message: "Account and associated data deleted successfully",
    });
  } catch (error) {
    return Response.json(
      { error: "Failed to delete account", details: error.message },
      { status: 500 },
    );
  }
}

import { connectDB } from "@/app/lib/mongoose";
import User from "@/app/models/User";
import Task from "@/app/models/Task";
import Diary from "@/app/models/Diary";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function POST(req) {
  try {
    // console.log("🗑 DELETE ACCOUNT route called");

    // 1️⃣ Connect DB
    await connectDB();
    // console.log("✅ DB Connected");

    // 2️⃣ Get session
    const session = await getServerSession(authOptions);
    // console.log("🔐 Session:", session);

    if (!session) {
      // console.log("❌ No session found");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    // console.log("👤 Deleting user:", userId);

    // 3️⃣ Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      // console.log("❌ User not found in DB");
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    // 4️⃣ Delete related data
    // console.log("🧹 Deleting related Tasks & Diary...");
    await Task.deleteMany({ userId });
    await Diary.deleteMany({ userId });

    // 5️⃣ Delete user
    await User.deleteOne({ _id: userId });

    // console.log("✅ User and related data deleted successfully");

    return Response.json({
      success: true,
      message: "Account and associated data deleted successfully",
    });
  } catch (error) {
    console.error("🔥 Delete account error:", error);
    return Response.json(
      { error: "Failed to delete account", details: error.message },
      { status: 500 },
    );
  }
}

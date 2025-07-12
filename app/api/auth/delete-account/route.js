import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import Task from "@/app/models/Task";
import Diary from "@/app/models/Diary";
import { verifyToken } from "@/app/lib/VerifyToken";
import bcrypt from "bcryptjs";

export async function POST(req) {
  try {
    await connectDB();
    const userId = await verifyToken(req);
    const { password } = await req.json();

    const user = await User.findById(userId);
    if (!user) return Response.json({ error: "User not found" }, { status: 404 });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return Response.json({ error: "Incorrect password" }, { status: 401 });

    await Task.deleteMany({ userId });
    await Diary.deleteMany({ userId });
    await User.deleteOne({ _id: userId });

    return Response.json({ success: true, message: "Account and associated data deleted successfully" });
  } catch {
    return Response.json({ error: "Failed to delete account" }, { status: 500 });
  }
}

import { connectDB } from "@/app/lib/db";
import { verifyToken } from "@/app/lib/VerifyToken";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

export async function PUT(req) {
  try {
    await connectDB();
    const userId = await verifyToken(req);
    const { oldPassword, newPassword } = await req.json();

    if (!oldPassword || !newPassword) {
      return Response.json({ error: "Both passwords are required" }, { status: 400 });
    }

    const user = await User.findById(userId);
    const match = await bcrypt.compare(oldPassword, user.password);

    if (!match) {
      return Response.json({ error: "Current password is incorrect" }, { status: 401 });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return Response.json({ message: "Password changed successfully" });
  } catch {
    return Response.json({ error: "Failed to change password" }, { status: 500 });
  }
}

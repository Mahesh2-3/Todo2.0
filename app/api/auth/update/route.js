import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import { verifyToken } from "@/app/lib/VerifyToken";

export async function PUT(req) {
  try {
    await connectDB();
    const userId = await verifyToken(req);
    const { firstName, lastName, username, email, profileImage } = await req.json();

    const existingUsers = await User.find({ $or: [{ username }, { email }] });
    const conflictUser = existingUsers.find((u) => u._id.toString() !== userId);

    if (conflictUser) {
      return Response.json({
        error: conflictUser.username === username ? "Username already exists" : "Email already registered"
      }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(userId, {
      firstName, lastName, username, email, profileImage
    }, { new: true });

    return Response.json({ message: "User updated", user: updatedUser });
  } catch (err) {
    return Response.json({ error: "Failed to update user" }, { status: 500 });
  }
}

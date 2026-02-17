import { connectDB } from "@/app/lib/mongoose";
import User from "@/app/models/User";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";

export async function PUT(req) {
  try {
    // 1️⃣ Connect DB
    await connectDB();

    // 2️⃣ Get session
    const session = await getServerSession(authOptions);

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Parse body
    const body = await req.json();

    const { firstName, lastName, username, email, profileImage } = body;

    // 4️⃣ Check existing users
    const existingUsers = await User.find({
      $or: [{ username }, { email }],
    });

    const conflictUser = existingUsers.find(
      (u) => u._id.toString() !== session.user.id,
    );

    if (conflictUser) {
      return Response.json(
        {
          error:
            conflictUser.username === username
              ? "Username already exists"
              : "Email already registered",
        },
        { status: 400 },
      );
    }

    // 5️⃣ Update user

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      {
        firstName,
        lastName,
        username,
        email,
        profileImage,
      },
      { new: true },
    );

    return Response.json({
      message: "User updated",
      user: {
        id: updatedUser._id.toString(),
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        username: updatedUser.username,
        email: updatedUser.email,
        profileImage: updatedUser.profileImage,
      },
    });
  } catch (err) {
    return Response.json(
      { error: "Failed to update user", details: err.message },
      { status: 500 },
    );
  }
}

import { connectDB } from "@/app/lib/mongoose";
import User from "@/app/models/User";
import { authOptions } from "../[...nextauth]/route";
import { getServerSession } from "next-auth";

export async function PUT(req) {
  try {
    // console.log("🚀 PUT /api/auth/update called");

    // 1️⃣ Connect DB
    console.log("🔌 Connecting to DB...");
    await connectDB();
    // console.log("✅ DB Connected");

    // 2️⃣ Get session
    // console.log("🔐 Getting session...");
    const session = await getServerSession(authOptions);
    // console.log("🧠 Session:", session);

    if (!session) {
      // console.log("❌ No session found");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3️⃣ Parse body
    const body = await req.json();
    // console.log("📦 Request Body:", body);

    const { firstName, lastName, username, email, profileImage } = body;

    // 4️⃣ Check existing users
    // console.log("🔍 Checking for conflicts...");
    const existingUsers = await User.find({
      $or: [{ username }, { email }],
    });

    // console.log("👥 Found Users:", existingUsers.length);

    const conflictUser = existingUsers.find(
      (u) => u._id.toString() !== session.user.id,
    );

    if (conflictUser) {
      // console.log("⚠️ Conflict User:", conflictUser);

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
    // console.log("✏️ Updating user:", session.user.id);

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

    // console.log("✅ Updated User:", updatedUser);

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
    console.error("🔥 ERROR in update route:", err);
    return Response.json(
      { error: "Failed to update user", details: err.message },
      { status: 500 },
    );
  }
}

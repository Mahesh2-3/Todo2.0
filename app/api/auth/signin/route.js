import { connectDB } from "@/app/lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req) {
  await connectDB();
  const { username, password } = await req.json();

  const user = await User.findOne({ username });
  if (!user) return Response.json({ error: "User not found" }, { status: 404 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    return Response.json({ error: "Invalid password" }, { status: 401 });

  const token = jwt.sign({ id: user._id }, process.env.NEXT_PUBLIC_JWT_SECRET);

  return Response.json({
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImage: user.profileImage,
      token,
    },
  });
}

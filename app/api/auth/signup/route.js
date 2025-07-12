import { connectDB } from "../../../lib/db";
import User from "../../../models/User";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();
  const body = await req.json();

  const { firstName, lastName, username, email, password, profileImage } = body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });

  if (existingUser) {
    return Response.json(
      {
        message:
          existingUser.username === username
            ? "Username already exists"
            : "Email already registered",
      },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    firstName,
    lastName,
    username,
    email,
    password: hashedPassword,
    profileImage,
  });

  return Response.json({ message: "User registered", user });
}

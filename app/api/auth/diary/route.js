import { connectDB } from "@/app/lib/mongoose";
import Diary from "@/app/models/Diary";
import { getServerSession } from "next-auth";
import { authOptions } from "../[...nextauth]/route";

export async function GET(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user.id;
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");

    const entry = await Diary.findOne({ userId, date });
    return Response.json(entry || {});
  } catch {
    return Response.json({ error: "Failed to fetch diary" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session?.user.id;
    const { date, content } = await req.json();

    let diary = await Diary.findOne({ userId, date });
    if (diary) {
      diary.content = content || "";
      await diary.save();
    } else {
      diary = new Diary({ userId, date, content });
      await diary.save();
    }

    return Response.json({ message: "Saved successfully" });
  } catch {
    return Response.json({ error: "Failed to save diary" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/mongoose";
import Diary from "@/app/models/Diary";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

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
    const fetchDates = searchParams.get("fetchDates");

    if (fetchDates === "true") {
      // Fetch all dates the user has written a diary entry
      const entries = await Diary.find({ userId }, { date: 1, _id: 0 }).lean();
      const dates = entries.map(entry => entry.date);
      return Response.json(dates);
    }

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

    if (!date || typeof date !== "string") {
      return Response.json({ error: "Valid date is required" }, { status: 400 });
    }

    if (content !== undefined && typeof content !== "string") {
      return Response.json({ error: "Content must be a string" }, { status: 400 });
    }

    // Use findOneAndUpdate with upsert to prevent race conditions and save DB round-trips
    await Diary.findOneAndUpdate(
      { userId, date },
      { content: content || "" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return Response.json({ message: "Saved successfully" });
  } catch (error) {
    return Response.json({ error: "Failed to save diary" }, { status: 500 });
  }
}

import { connectDB } from "../../../lib/db";
import Diary from "../../../models/Diary";
import { verifyToken } from "../../../lib/VerifyToken";


export async function GET(req) {
  try {
    await connectDB();
    const userId = await verifyToken(req);
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
    const userId = await verifyToken(req);
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

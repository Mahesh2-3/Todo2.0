const mongoose = require("mongoose");

const diarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // Format: yyyy-mm-dd
    required: true,
  },
  content: {
    type: String,
  },
}, { timestamps: true });

// Indexes for performance
diarySchema.index({ userId: 1, date: 1 });

// ✅ Prevent OverwriteModelError
const Diary = mongoose.models.Diary || mongoose.model("Diary", diarySchema);

module.exports = Diary;

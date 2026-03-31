const mongoose = require("mongoose");

const streakSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: String, // Format: YYYY-MM-DD
    required: true,
  },
  tasksCompleted: {
    type: Number,
    default: 0,
  },
  diaryWritten: {
    type: Boolean,
    default: false,
  },
  streakCount: {
    type: Number,
    default: 0,
  },
  activityType: {
    type: [String], // "task", "diary"
    default: [],
  }
}, { timestamps: true });

// Ensure uniqueness per user per day
streakSchema.index({ userId: 1, date: 1 }, { unique: true });

const Streak = mongoose.models.Streak || mongoose.model("Streak", streakSchema);

module.exports = Streak;

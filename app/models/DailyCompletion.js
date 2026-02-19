const mongoose = require("mongoose");

const dailyCompletionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    taskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    date: {
      type: String, // Format: YYYY-MM-DD
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
  },
  { timestamps: true },
);

// Ensure unique completion record per task per day
dailyCompletionSchema.index(
  { userId: 1, taskId: 1, date: 1 },
  { unique: true },
);

const DailyCompletion =
  mongoose.models.DailyCompletion ||
  mongoose.model("DailyCompletion", dailyCompletionSchema);

module.exports = DailyCompletion;

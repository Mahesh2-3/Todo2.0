const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: { type: String, required: true },
  isDaily: Boolean,
  description: { type: String },
  status: {
    type: String,
    enum: ["Pending", "In Progress", "Completed"],
    default: "Pending",
  },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
}, { timestamps: true });

// ✅ Safe export
const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);

module.exports = Task;

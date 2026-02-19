const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: { type: String, required: true },
    description: { type: String },

    type: {
      type: String,
      enum: ["normal", "daily", "scheduled"],
      default: "normal",
    },

    // Daily system
    isDaily: { type: Boolean, default: false }, // marks template
    isTemplate: { type: Boolean, default: false }, // true only for master daily task
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      default: null,
    },

    isDeleted: { type: Boolean, default: false },

    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },

    startDate: { type: String, required: false },
    endDate: { type: String, required: false },
  },
  { timestamps: true },
);

// Indexes for performance
taskSchema.index({ userId: 1, type: 1 });
taskSchema.index({ userId: 1, startDate: 1, endDate: 1 });
// Unique index for daily instances to prevent duplicates
taskSchema.index({ userId: 1, templateId: 1, startDate: 1 }, { unique: true });

const Task = mongoose.models.Task || mongoose.model("Task", taskSchema);
module.exports = Task;

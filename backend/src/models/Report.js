const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  period_type: {
    type: String,
    enum: ["monthly", "yearly"],
    required: true,
  },
  period: {
    type: String, // e.g., "2025-04" or "2024"
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
  generated_at: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model("Report", reportSchema);
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: true,
  },
  last_name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String, // optional
  },
  status: {
    type: String,
    enum: ["active", "inactive", "on leave"],
    default: "active"
  },
  hire_date: {
    type: Date,
    default: Date.now,
  },
  salary: {
    type: Number, 
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Employee", employeeSchema);

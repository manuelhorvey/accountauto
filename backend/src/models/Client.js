const mongoose = require("mongoose");

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  gross_commission: {
    type: Number,
    required: true,
  },
  wins_commission: {
    type: Number,
    required: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Client", clientSchema);

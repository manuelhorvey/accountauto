const mongoose = require("mongoose");

const statementSchema = new mongoose.Schema({
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    required: true,
  },
  gross: {
    type: Number,
    required: true,
  },
  wins: {
    type: Number,
    required: true,
  },
  expenses: {
    type: Number,
    default: 0,
  },
  net: {
    type: Number,
    required: true,
  },
  wins_commission_total: {
    type: Number,
    required: true,
  },
  balance_office: {
    type: Number,
    required: true,
  },
  balance_client: {
    type: Number,
    required: true,
  },
  prev_balance_office: {
    type: Number,
    default: 0,
  },
  prev_balance_client: {
    type: Number,
    default: 0,
  },
  cash_received: {
    type: Number,
    default: 0,
  },
  cash_paid: {
    type: Number,
    default: 0,
  },
  final_receivable: {
    type: Number,
    default: 0,
  },
  final_payable: {
    type: Number,
    default: 0,
  },
  start_date: {
    type: Date,
    required: true,
  },
  due_date: {
    type: Date,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true
});

module.exports = mongoose.model("Statement", statementSchema);

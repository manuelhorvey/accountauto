// models/DailySales.js
const mongoose = require('mongoose');

const dailySalesSchema = new mongoose.Schema({
  statement: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Statement',
    required: true,
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true,
  },
  monday: { type: Number, default: 0 },
  tuesday: { type: Number, default: 0 },
  wednesday: { type: Number, default: 0 },
  thursday: { type: Number, default: 0 },
  friday: { type: Number, default: 0 },
  saturday: { type: Number, default: 0 },
  sunday: { type: Number, default: 0 },
  created_at: {
    type: Date,
    default: Date.now,
  }
});

module.exports = mongoose.model('DailySales', dailySalesSchema);

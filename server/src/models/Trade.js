const mongoose = require("mongoose");

const tradeSchema = new mongoose.Schema({
  importId: { type: mongoose.Schema.Types.ObjectId, ref: "Import", required: true },
  id: { type: String, required: true },
  symbol: String,
  entryDateTime: Date,
  exitDateTime: Date,
  direction: { type: String, enum: ["Long", "Short"] },
  entryPrice: Number,
  exitPrice: Number,
  quantity: Number,
  pnl: Number,
  isWin: Boolean,
  duration: Number,
  note: String,
});

tradeSchema.index({ importId: 1, id: 1 }, { unique: true });

module.exports = mongoose.model("Trade", tradeSchema);

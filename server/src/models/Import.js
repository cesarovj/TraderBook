const mongoose = require("mongoose");

const importSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  fileHash: { type: String, required: true, unique: true },
  importedAt: { type: Date, default: Date.now },
  tradeCount: { type: Number, required: true },
});

module.exports = mongoose.model("Import", importSchema);

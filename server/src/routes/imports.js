const router = require("express").Router();
const Import = require("../models/Import");
const Trade = require("../models/Trade");

// Check if a file hash has already been imported
router.get("/check/:hash", async (req, res) => {
  try {
    const existing = await Import.findOne({ fileHash: req.params.hash });
    res.json({ exists: !!existing, import: existing || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all imports
router.get("/", async (req, res) => {
  try {
    const imports = await Import.find().sort({ importedAt: -1 });
    res.json(imports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all trades across all imports
router.get("/trades", async (req, res) => {
  try {
    const trades = await Trade.find({}, { importId: 0, __v: 0 }).sort({ exitDateTime: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Save a new import with its parsed trades
router.post("/", async (req, res) => {
  const { filename, fileHash, trades } = req.body;

  if (!filename || !fileHash || !Array.isArray(trades)) {
    return res.status(400).json({ error: "filename, fileHash, and trades are required" });
  }

  const existing = await Import.findOne({ fileHash });
  if (existing) {
    return res.status(409).json({ error: "File already imported", import: existing });
  }

  try {
    const importDoc = await Import.create({ filename, fileHash, tradeCount: trades.length });
    await Trade.insertMany(trades.map((t) => ({ ...t, importId: importDoc._id })));
    res.status(201).json({ import: importDoc, tradeCount: trades.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete an import and all its trades
router.delete("/:id", async (req, res) => {
  try {
    const importDoc = await Import.findByIdAndDelete(req.params.id);
    if (!importDoc) return res.status(404).json({ error: "Import not found" });
    await Trade.deleteMany({ importId: req.params.id });
    res.json({ deleted: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

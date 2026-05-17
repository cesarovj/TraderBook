require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./db");
const importsRouter = require("./routes/imports");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.use(express.json({ limit: "10mb" }));

app.use("/api/imports", importsRouter);

app.get("/health", (_req, res) => res.json({ ok: true }));

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

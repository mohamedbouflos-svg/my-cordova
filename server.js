import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

// --- Load API files ---
const apiPath = path.join(__dirname, "api");

// /config
app.get("/config", (req, res) => {
  try {
    const config = JSON.parse(
      fs.readFileSync(path.join(apiPath, "config.json"), "utf8")
    );
    res.json(config);
  } catch (error) {
    console.error("Config error:", error);
    res.status(500).json({ error: "Failed to load config" });
  }
});

// /ads
app.get("/ads", (req, res) => {
  try {
    const ads = JSON.parse(
      fs.readFileSync(path.join(apiPath, "ads.json"), "utf8")
    );
    res.json(ads);
  } catch (error) {
    console.error("Ads error:", error);
    res.status(500).json({ error: "Failed to load ads" });
  }
});

// /openai
app.get("/openai", (req, res) => {
  try {
    const key = JSON.parse(
      fs.readFileSync(path.join(apiPath, "openai.json"), "utf8")
    );
    res.json(key);
  } catch (error) {
    console.error("OpenAI config error:", error);
    res.status(500).json({ error: "Failed to load OpenAI config" });
  }
});

// /analyze
app.post("/analyze", async (req, res) => {
  try {
    const analyze = await import("./api/analyze.js");
    analyze.default(req, res);
  } catch (error) {
    console.error("Analyze import error:", error);
    res.status(500).json({ error: "Failed to load analyze module" });
  }
});

// /doctor
app.post("/doctor", async (req, res) => {
  try {
    const doctorAI = await import("./api/doctorAI.js");
    doctorAI.default(req, res);
  } catch (error) {
    console.error("DoctorAI import error:", error);
    res.status(500).json({ error: "Failed to load doctorAI module" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Cannot ${req.method} ${req.path}`
  });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API Running on port ${PORT}`));

import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// زيادة حجم body لقبول الصور الكبيرة
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

const apiPath = path.join(__dirname, "api");

// Root endpoint
app.get("/", (req, res) => {
  res.json({ status: "API running", port: 10000 });
});

// /config
app.get("/config", (req, res) => {
  try {
    const config = JSON.parse(fs.readFileSync(path.join(apiPath, "config.json"), "utf8"));
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: "Failed to load config" });
  }
});

// /ads
app.get("/ads", (req, res) => {
  try {
    const ads = JSON.parse(fs.readFileSync(path.join(apiPath, "ads.json"), "utf8"));
    res.json(ads);
  } catch (err) {
    res.status(500).json({ error: "Failed to load ads" });
  }
});

// /doctor
app.post("/doctor", async (req, res) => {
  try {
    const doctorAI = await import("./api/doctorAI.js");
    await doctorAI.default(req, res);
  } catch (err) {
    res.status(500).json({ error: "DoctorAI error" });
  }
});

// /analyze
app.post("/analyze", async (req, res) => {
  try {
    const analyze = await import("./api/analyze.js");
    await analyze.default(req, res);
  } catch (err) {
    res.status(500).json({ error: "Analyze error" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`API Running on port ${PORT}`));

const express = require("express");
const router = express.Router();
const { generateForm } = require("../model/openaiModel");
const context = require("../context/examples.json");

router.post("/generate-form", async (req, res) => {
  const { prompt } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    console.log("🛠 Received prompt:", prompt); // Optional debug
    const schema = await generateForm(prompt, context);
    res.json({ schema });
  } catch (err) {
    console.error("❌ Error in /generate-form:", err.message);
    res.status(500).json({ error: "Failed to generate schema." });
  }
});

module.exports = router;

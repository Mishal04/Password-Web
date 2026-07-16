const express    = require("express");
const router     = express.Router();
const protect    = require("../middleware/authMiddleware");
const {
  generateAndSave,
  getHistory,
  clearHistory,
} = require("../controllers/generatorController");

// POST   /api/generator          — generate + save to history
router.post("/",         protect, generateAndSave);

// GET    /api/generator/history  — fetch last 10 generated passwords
router.get("/history",   protect, getHistory);

// DELETE /api/generator/history  — clear all history
router.delete("/history", protect, clearHistory);

module.exports = router;

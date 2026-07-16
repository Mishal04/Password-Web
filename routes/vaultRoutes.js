const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addPassword,
  getPasswords,
  updatePassword,
  deletePassword,
  searchPasswords,
  toggleFavorite,
  generateStrongPassword,
  getSecurityStats
} = require("../controllers/vaultController");

router.get("/generate-password", protect, generateStrongPassword);
router.post("/", protect, addPassword);
router.get("/", protect, getPasswords);
router.put("/:id", protect, updatePassword);
router.delete("/:id", protect, deletePassword);
router.get("/search", protect, searchPasswords);
router.patch("/favorite/:id", protect, toggleFavorite);
router.get("/security-stats", protect, getSecurityStats);

module.exports = router;
const express = require("express");
const dotenv = require("dotenv");

// 🔥 Sabse pehle .env load karo
dotenv.config();

const cors = require("cors");
const connectDB = require("./config/db");

const authRoutes      = require("./routes/authRoutes");
const vaultRoutes     = require("./routes/vaultRoutes");
const noteRoutes      = require("./routes/noteRoutes");
const generatorRoutes = require("./routes/generatorRoutes");

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth",      authRoutes);
app.use("/api/vault",     vaultRoutes);
// Alias: /api/passwords mirrors /api/vault (spec requirement)
app.use("/api/passwords", vaultRoutes);
app.use("/api/notes",     noteRoutes);
app.use("/api/generator", generatorRoutes);

app.get("/", (req, res) => {
  res.send("🚀 Password Vault API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
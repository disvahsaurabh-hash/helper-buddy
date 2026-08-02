const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();

// Import Routes
const authRoutes = require("./routes/authRoutes");
const helperRoutes = require("./routes/helperRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/helpers", helperRoutes);
app.use("/api/admin", adminRoutes);

// Connect to MongoDB
console.log(process.env.MONGODB_URI);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
  })
  .catch((err) => {
    console.log("❌ MongoDB Connection Error:", err);
  });

// Test Route
app.get("/", (req, res) => {
  res.send("Welcome to Local Helper Backend!");
});

// Static Uploads
app.use("/uploads", express.static("uploads"));

// Start Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
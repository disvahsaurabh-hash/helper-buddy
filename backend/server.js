const dns = require("dns");

// MongoDB Atlas DNS
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const app = express();


// =====================================================
// UPLOADS FOLDER
// =====================================================

const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}

console.log("📁 Uploads folder:", uploadsPath);


// =====================================================
// MIDDLEWARE
// =====================================================

app.use(
    cors({
        origin: "*",
        methods: [
            "GET",
            "POST",
            "PUT",
            "PATCH",
            "DELETE",
            "OPTIONS"
        ],
        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ]
    })
);

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);


// =====================================================
// STATIC UPLOADS
// =====================================================

app.use(
    "/uploads",
    express.static(uploadsPath)
);


// =====================================================
// ROUTES
// =====================================================

const authRoutes = require("./routes/authRoutes");
const helperRoutes = require("./routes/helperRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/helpers",
    helperRoutes
);

app.use(
    "/api/admin",
    adminRoutes
);


// =====================================================
// HOME TEST
// =====================================================

app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Welcome to LocalHelper Backend!",
        status: "Server is running",
        server: "Render"
    });

});


// =====================================================
// UPLOADS TEST
// =====================================================

app.get("/uploads", (req, res) => {

    res.json({
        success: true,
        message: "Uploads folder is working"
    });

});


// =====================================================
// MONGODB
// =====================================================

console.log("Connecting to MongoDB...");

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {

        console.log("✅ MongoDB Connected Successfully");

    })
    .catch((error) => {

        console.error(
            "❌ MongoDB Connection Error:",
            error.message
        );

    });


// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "API route not found"
    });

});


// =====================================================
// ERROR HANDLER
// =====================================================

app.use((err, req, res, next) => {

    console.error("❌ SERVER ERROR:");

    console.error(err);

    res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });

});


// =====================================================
// START SERVER
// =====================================================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {

    console.log("");
    console.log("====================================");
    console.log("🚀 LOCALHELPER BACKEND");
    console.log("====================================");
    console.log(`📡 Port: ${PORT}`);
    console.log("🌐 Server: http://0.0.0.0:" + PORT);
    console.log("📸 Photo uploads enabled");
    console.log("====================================");
    console.log("");

});
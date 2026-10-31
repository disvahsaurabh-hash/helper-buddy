
const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const Helper = require("../models/Helper");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// UPLOAD FOLDER
const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// DELETE FILE
function deleteFile(filePath) {
    if (filePath && fs.existsSync(filePath)) {
        fs.unlink(filePath, () => {});
    }
}

// MULTER CONFIGURATION
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || ".jpg";
        cb(null, `helper-${Date.now()}-${Math.round(Math.random() * 100000)}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only JPG, PNG and WEBP images are allowed."));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
});

// GET USER ID FROM TOKEN
function getUserId(req) {
    return req.user?.id || req.user?.userId || req.user?._id;
}

// CREATE HELPER PROFILE
router.post("/create", authMiddleware, upload.single("photo"), async (req, res) => {
    try {
        const userId = getUserId(req);

        // DEBUG LOGS
        console.log("========== CREATE PROFILE ==========");
        console.log("JWT DATA:", req.user);
        console.log("USER ID:", userId);
        console.log("FORM DATA:", req.body);
        console.log("PHOTO:", req.file?.filename);

        if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
            deleteFile(req.file?.path);
            return res.status(401).json({
                success: false,
                message: "User ID missing from login token. Please login again."
            });
        }

        if (req.user.role !== "helper") {
            deleteFile(req.file?.path);
            return res.status(403).json({
                success: false,
                message: "Only helpers can create profiles."
            });
        }

        const { name, profession, city, phone, experience, description } = req.body;

        if (!name?.trim() || !profession?.trim() || !city?.trim() ||
            !phone?.trim() || !experience?.trim()) {
            deleteFile(req.file?.path);
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a profile photo."
            });
        }

        const existingHelper = await Helper.findOne({ userId });

        if (existingHelper) {
            deleteFile(req.file.path);
            return res.status(409).json({
                success: false,
                message: "Profile already exists. Please edit your profile."
            });
        }

        const helper = await Helper.create({
            userId,
            name: name.trim(),
            profession: profession.trim(),
            city: city.trim(),
            phone: phone.trim(),
            experience: experience.trim(),
            description: description?.trim() || "",
            photo: req.file.filename
        });

        res.status(201).json({
            success: true,
            message: "Helper profile created successfully.",
            helper
        });

    } catch (error) {
        console.error("CREATE PROFILE ERROR:", error);
        deleteFile(req.file?.path);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET ALL HELPERS
router.get("/", async (req, res) => {
    try {
        const helpers = await Helper.find().sort({ createdAt: -1 });
        res.json(helpers);
    } catch (error) {
        console.error("GET HELPERS ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// SEARCH HELPERS
router.get("/search", async (req, res) => {
    try {
        const { profession, city } = req.query;
        const filter = {};

        if (profession?.trim()) {
            filter.profession = { $regex: profession.trim(), $options: "i" };
        }

        if (city?.trim()) {
            filter.city = { $regex: city.trim(), $options: "i" };
        }

        const helpers = await Helper.find(filter).sort({ createdAt: -1 });
        res.json(helpers);
    } catch (error) {
        console.error("SEARCH ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// GET MY PROFILE
router.get("/user/:userId", authMiddleware, async (req, res) => {
    try {
        const loggedInId = getUserId(req);
        const requestedId = req.params.userId;

        if (req.user.role !== "helper" || String(loggedInId) !== requestedId) {
            return res.status(403).json({
                success: false,
                message: "You cannot access this profile."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(requestedId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const helper = await Helper.findOne({ userId: requestedId });

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: "Helper profile not found."
            });
        }

        res.json(helper);

    } catch (error) {
        console.error("GET MY PROFILE ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// UPDATE MY PROFILE
router.put("/user/:userId", authMiddleware, upload.single("photo"), async (req, res) => {
    try {
        const loggedInId = getUserId(req);
        const requestedId = req.params.userId;

        if (req.user.role !== "helper" || String(loggedInId) !== requestedId) {
            deleteFile(req.file?.path);
            return res.status(403).json({
                success: false,
                message: "You cannot edit this profile."
            });
        }

        if (!mongoose.Types.ObjectId.isValid(requestedId)) {
            deleteFile(req.file?.path);
            return res.status(400).json({
                success: false,
                message: "Invalid user ID."
            });
        }

        const helper = await Helper.findOne({ userId: requestedId });

        if (!helper) {
            deleteFile(req.file?.path);
            return res.status(404).json({
                success: false,
                message: "Helper profile not found."
            });
        }

        const fields = [
            "name", "profession", "city",
            "phone", "experience", "description"
        ];

        for (const field of fields) {
            if (req.body[field] !== undefined) {
                helper[field] = req.body[field].trim();
            }
        }

        const oldPhoto = helper.photo;

        if (req.file) {
            helper.photo = req.file.filename;
        }

        await helper.save();

        if (req.file && oldPhoto) {
            deleteFile(path.join(uploadDir, oldPhoto));
        }

        res.json({
            success: true,
            message: "Helper profile updated successfully.",
            helper
        });

    } catch (error) {
        console.error("UPDATE PROFILE ERROR:", error);
        deleteFile(req.file?.path);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// GET PUBLIC PROFILE BY ID (KEEP LAST)
router.get("/:id", async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid helper ID."
            });
        }

        const helper = await Helper.findById(id);

        if (!helper) {
            return res.status(404).json({
                success: false,
                message: "Helper not found."
            });
        }

        res.json(helper);

    } catch (error) {
        console.error("GET PUBLIC PROFILE ERROR:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;


const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

const User = require("../models/user");
const EmailOTP = require("../models/EmailOTP");

const router = express.Router();

const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;

// MODEL DIAGNOSTICS
console.log("EMAIL OTP MODEL FILE:", require.resolve("../models/EmailOTP"));
console.log("PURPOSE SCHEMA EXISTS:", !!EmailOTP.schema.path("purpose"));
console.log("OTP SCHEMA FIELDS:", Object.keys(EmailOTP.schema.paths));
console.log("OTP COLLECTION:", EmailOTP.collection.name);

// Gmail transporter
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
    },
    tls: {
        minVersion: "TLSv1.2"
    }
});

// Hash OTP and reset token
function hashOTP(value) {
    return crypto.createHash("sha256").update(value).digest("hex");
}

// Safe comparison
function safeCompare(value1, value2) {
    if (!value1 || !value2) return false;

    const a = Buffer.from(value1, "hex");
    const b = Buffer.from(value2, "hex");

    return a.length === b.length &&
        a.length > 0 &&
        crypto.timingSafeEqual(a, b);
}

// Send OTP email
async function sendOTPEmail(email, otp, isReset = false) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: isReset
            ? "Local Helper - Password Reset OTP"
            : "Local Helper - Email Verification OTP",
        text: `Your OTP is ${otp}. It is valid for 5 minutes. Do not share it with anyone.`
    });
}

// CREATE OR UPDATE OTP
async function saveOTP(email, otp, purpose, extra = {}) {
    email = email.trim().toLowerCase();

    if (!EmailOTP.schema.path("purpose")) {
        throw new Error("EmailOTP schema does not contain purpose field.");
    }

    const update = {
        $set: {
            email,
            otpHash: hashOTP(otp),
            purpose,
            resetTokenHash: null,
            attempts: 0,
            lastSentAt: new Date(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            pendingName: extra.pendingName || null,
            pendingPassword: extra.pendingPassword || null,
            pendingRole: extra.pendingRole || null
        }
    };

    await EmailOTP.updateOne(
        { email },
        update,
        {
            upsert: true,
            runValidators: true
        }
    );

    // Check actual MongoDB document
    const rawRecord = await EmailOTP.collection.findOne({ email });

    console.log("SAVED OTP EMAIL:", rawRecord?.email);
    console.log("SAVED OTP PURPOSE:", rawRecord?.purpose);

    if (!rawRecord || rawRecord.purpose !== purpose) {
        throw new Error("OTP purpose was not saved in MongoDB.");
    }

    // Check Mongoose document
    const record = await EmailOTP.findOne({ email });

    console.log("MONGOOSE OTP PURPOSE:", record?.purpose);

    if (!record || record.purpose !== purpose) {
        throw new Error("OTP purpose is missing from Mongoose model.");
    }

    return record;
}

// =====================================
// REGISTRATION - SEND OTP
// =====================================

router.post("/send-otp", async (req, res) => {
    try {
        const name = req.body.name?.trim();
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;
        const role = req.body.role;

        if (!email || !gmailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid Gmail address."
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser?.isEmailVerified) {
            return res.status(400).json({
                message: "Account already exists. Please login."
            });
        }

        if (!existingUser) {
            if (!name || !password || !role) {
                return res.status(400).json({
                    message: "Please fill all registration fields."
                });
            }

            if (password.length < 8) {
                return res.status(400).json({
                    message: "Password must be at least 8 characters."
                });
            }

            if (!["customer", "helper"].includes(role)) {
                return res.status(400).json({
                    message: "Invalid account type."
                });
            }
        }

        const oldOTP = await EmailOTP.findOne({ email });

        if (
            oldOTP?.purpose === "registration" &&
            oldOTP.lastSentAt &&
            Date.now() - oldOTP.lastSentAt.getTime() < 60000
        ) {
            return res.status(429).json({
                message: "Please wait 60 seconds before requesting another OTP."
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const extra = {};

        if (!existingUser) {
            extra.pendingName = name;
            extra.pendingPassword = await bcrypt.hash(password, 10);
            extra.pendingRole = role;
        }

        await saveOTP(email, otp, "registration", extra);

        try {
            await sendOTPEmail(email, otp);
        } catch (mailError) {
            await EmailOTP.deleteOne({ email });
            console.error("REGISTRATION EMAIL ERROR:", mailError);

            return res.status(500).json({
                message: "Unable to send registration OTP."
            });
        }

        return res.json({
            message: "OTP sent successfully to your Gmail."
        });

    } catch (error) {
        console.error("REGISTRATION OTP ERROR:", error);

        return res.status(500).json({
            message: "Server error while sending OTP."
        });
    }
});

// =====================================
// REGISTRATION - VERIFY OTP
// =====================================

router.post("/verify-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const otp = String(req.body.otp || "").trim();

        if (!gmailRegex.test(email) || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Enter valid Gmail and 6-digit OTP."
            });
        }

        const record = await EmailOTP.findOne({ email });

        if (!record || record.purpose !== "registration") {
            return res.status(400).json({
                message: "Registration OTP not found. Request a new OTP."
            });
        }

        if (!record.expiresAt || record.expiresAt.getTime() < Date.now()) {
            await EmailOTP.deleteOne({ _id: record._id });

            return res.status(400).json({
                message: "OTP expired. Request a new OTP."
            });
        }

        if (record.attempts >= 5) {
            await EmailOTP.deleteOne({ _id: record._id });

            return res.status(429).json({
                message: "Too many incorrect attempts. Request a new OTP."
            });
        }

        if (!safeCompare(hashOTP(otp), record.otpHash)) {
            record.attempts += 1;
            await record.save();

            return res.status(400).json({
                message: "Incorrect OTP."
            });
        }

        let user = await User.findOne({ email });

        if (user) {
            user.isEmailVerified = true;
            await user.save();
        } else {
            if (
                !record.pendingName ||
                !record.pendingPassword ||
                !record.pendingRole
            ) {
                return res.status(400).json({
                    message: "Registration details missing. Register again."
                });
            }

            user = await User.create({
                name: record.pendingName,
                email,
                password: record.pendingPassword,
                role: record.pendingRole,
                isEmailVerified: true
            });
        }

        await EmailOTP.deleteOne({ _id: record._id });

        return res.status(201).json({
            message: "Email verified! Account created successfully.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("VERIFY REGISTRATION ERROR:", error);

        return res.status(500).json({
            message: "Server error while verifying OTP."
        });
    }
});

// =====================================
// BLOCK DIRECT REGISTRATION
// =====================================

router.post("/register", (req, res) => {
    return res.status(403).json({
        message: "Verify Gmail OTP before registration."
    });
});

// =====================================
// LOGIN
// =====================================

router.post("/login", async (req, res) => {
    try {
        const email = req.body.email?.trim().toLowerCase();
        const password = req.body.password;

        if (!email || !password) {
            return res.status(400).json({
                message: "Enter email and password."
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "User not found."
            });
        }

        if (user.isEmailVerified !== true) {
            return res.status(403).json({
                message: "Please verify your Gmail first."
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid password."
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured.");
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Server error during login."
        });
    }
});

// =====================================
// FORGOT PASSWORD - SEND OTP
// =====================================

router.post("/forgot-password/send-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();

        if (!gmailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid Gmail address."
            });
        }

        const user = await User.findOne({
            email,
            isEmailVerified: true
        });

        if (!user) {
            return res.status(404).json({
                message: "No verified account found with this Gmail."
            });
        }

        const oldOTP = await EmailOTP.findOne({ email });

        if (
            oldOTP?.purpose === "forgot-password" &&
            oldOTP.lastSentAt &&
            Date.now() - oldOTP.lastSentAt.getTime() < 60000
        ) {
            return res.status(429).json({
                message: "Please wait 60 seconds before requesting another OTP."
            });
        }

        const otp = crypto.randomInt(100000, 1000000).toString();

        const record = await saveOTP(email, otp, "forgot-password");

        console.log("RESET OTP RECORD SAVED:", record.email);
        console.log("RESET OTP PURPOSE:", record.purpose);

        try {
            await sendOTPEmail(email, otp, true);
        } catch (mailError) {
            await EmailOTP.deleteOne({ _id: record._id });
            console.error("RESET EMAIL ERROR:", mailError);

            return res.status(500).json({
                message: "Unable to send password reset OTP."
            });
        }

        return res.json({
            message: "Password reset OTP sent to your Gmail."
        });

    } catch (error) {
        console.error("FORGOT PASSWORD SEND ERROR:", error);

        return res.status(500).json({
            message: "Server error while sending reset OTP."
        });
    }
});

// =====================================
// FORGOT PASSWORD - VERIFY OTP
// =====================================

router.post("/forgot-password/verify-otp", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const otp = String(req.body.otp || "").trim();

        if (!gmailRegex.test(email) || !/^\d{6}$/.test(otp)) {
            return res.status(400).json({
                message: "Enter valid Gmail and 6-digit OTP."
            });
        }

        const record = await EmailOTP.findOne({ email });

        console.log("VERIFY OTP EMAIL:", email);
        console.log("OTP RECORD FOUND:", !!record);
        console.log("OTP RECORD PURPOSE:", record?.purpose);
        console.log("OTP EXPIRY:", record?.expiresAt);

        if (!record) {
            return res.status(400).json({
                message: "OTP record not found. Please request a new OTP."
            });
        }

        if (record.purpose !== "forgot-password") {
            return res.status(400).json({
                message: "OTP purpose mismatch. Please request a new OTP."
            });
        }

        if (!record.expiresAt || record.expiresAt.getTime() < Date.now()) {
            await EmailOTP.deleteOne({ _id: record._id });

            return res.status(400).json({
                message: "OTP expired. Request a new OTP."
            });
        }

        if (record.attempts >= 5) {
            await EmailOTP.deleteOne({ _id: record._id });

            return res.status(429).json({
                message: "Too many incorrect attempts. Request a new OTP."
            });
        }

        if (!safeCompare(hashOTP(otp), record.otpHash)) {
            record.attempts += 1;
            await record.save();

            return res.status(400).json({
                message: "Incorrect OTP."
            });
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        record.purpose = "reset-verified";
        record.resetTokenHash = hashOTP(resetToken);
        record.otpHash = hashOTP(crypto.randomBytes(32).toString("hex"));
        record.attempts = 0;
        record.expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await record.save();

        console.log("PASSWORD RESET OTP VERIFIED:", email);

        return res.json({
            message: "OTP verified successfully.",
            resetToken
        });

    } catch (error) {
        console.error("RESET OTP VERIFY ERROR:", error);

        return res.status(500).json({
            message: "Server error while verifying OTP."
        });
    }
});

// =====================================
// FORGOT PASSWORD - RESET PASSWORD
// =====================================

router.post("/forgot-password/reset", async (req, res) => {
    try {
        const email = String(req.body.email || "").trim().toLowerCase();
        const resetToken = req.body.resetToken;
        const newPassword = req.body.newPassword;

        if (!gmailRegex.test(email) || !resetToken || !newPassword) {
            return res.status(400).json({
                message: "Please provide all required details."
            });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({
                message: "Password must be at least 8 characters."
            });
        }

        const record = await EmailOTP.findOne({
            email,
            purpose: "reset-verified"
        });

        if (!record || !record.expiresAt || record.expiresAt.getTime() < Date.now()) {
            return res.status(400).json({
                message: "Reset session expired. Verify OTP again."
            });
        }

        if (!safeCompare(hashOTP(resetToken), record.resetTokenHash)) {
            return res.status(400).json({
                message: "Invalid password reset session."
            });
        }

        const user = await User.findOne({
            email,
            isEmailVerified: true
        });

        if (!user) {
            return res.status(404).json({
                message: "Verified account not found."
            });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        await EmailOTP.deleteOne({ _id: record._id });

        return res.json({
            message: "Password changed successfully. Please login."
        });

    } catch (error) {
        console.error("RESET PASSWORD ERROR:", error);

        return res.status(500).json({
            message: "Server error while resetting password."
        });
    }
});

module.exports = router;

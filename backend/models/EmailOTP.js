
const mongoose = require("mongoose");

const emailOTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },

    otpHash: {
        type: String,
        required: true
    },

    purpose: {
        type: String,
        required: true,
        enum: ["registration", "forgot-password", "reset-verified"]
    },

    pendingName: {
        type: String,
        default: null
    },

    pendingPassword: {
        type: String,
        default: null
    },

    pendingRole: {
        type: String,
        default: null
    },

    resetTokenHash: {
        type: String,
        default: null
    },

    attempts: {
        type: Number,
        default: 0
    },

    lastSentAt: {
        type: Date,
        default: Date.now
    },

    expiresAt: {
        type: Date,
        required: true
    }

}, { timestamps: true });

emailOTPSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
);

module.exports =
    mongoose.models.EmailOTP ||
    mongoose.model("EmailOTP", emailOTPSchema);

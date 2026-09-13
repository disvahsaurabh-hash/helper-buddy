const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const mongoose = require("mongoose");

const Helper = require("../models/Helper");

const router = express.Router();


// =====================================================
// UPLOAD DIRECTORY
// =====================================================

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}


// =====================================================
// MULTER STORAGE
// =====================================================

const storage = multer.diskStorage({

    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },

    filename: function (req, file, cb) {

        const extension =
            path.extname(file.originalname) || ".jpg";

        const filename =
            `helper-${Date.now()}-${Math.round(Math.random() * 100000)}${extension}`;

        cb(null, filename);
    }

});


// =====================================================
// MULTER FILTER
// =====================================================

const fileFilter = (req, file, cb) => {

    const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp"
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Only JPG, JPEG, PNG and WEBP images are allowed."
            ),
            false
        );
    }
};


const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 5 * 1024 * 1024
    }

});


// =====================================================
// CREATE HELPER PROFILE
// POST /api/helpers/create
// =====================================================

router.post(
    "/create",
    upload.single("photo"),
    async (req, res) => {

        try {

            console.log("================================");
            console.log("CREATE HELPER");
            console.log("BODY:", req.body);
            console.log("FILE:", req.file);
            console.log("================================");


            const {
                userId,
                name,
                profession,
                city,
                phone,
                experience,
                description
            } = req.body;


            // -------------------------------
            // VALIDATION
            // -------------------------------

            if (!userId) {

                return res.status(400).json({
                    success: false,
                    message: "User ID is required."
                });

            }


            if (!mongoose.Types.ObjectId.isValid(userId)) {

                return res.status(400).json({
                    success: false,
                    message: "Invalid user ID."
                });

            }


            if (!name || !name.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Name is required."
                });

            }


            if (!profession || !profession.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Profession is required."
                });

            }


            if (!city || !city.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "City is required."
                });

            }


            if (!phone || !phone.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Phone number is required."
                });

            }


            if (!experience || !experience.trim()) {

                return res.status(400).json({
                    success: false,
                    message: "Experience is required."
                });

            }


            if (!req.file) {

                return res.status(400).json({
                    success: false,
                    message: "Profile photo is required."
                });

            }


            // -------------------------------
            // CHECK EXISTING PROFILE
            // -------------------------------

            const existingHelper =
                await Helper.findOne({ userId });


            if (existingHelper) {

                return res.status(409).json({
                    success: false,
                    message: "Helper profile already exists."
                });

            }


            // -------------------------------
            // CREATE HELPER
            // -------------------------------

            const helper = await Helper.create({

                userId,

                name: name.trim(),

                profession: profession.trim(),

                city: city.trim(),

                phone: phone.trim(),

                experience: experience.trim(),

                description:
                    description
                        ? description.trim()
                        : "",

                photo: req.file.filename

            });


            console.log(
                "Helper created:",
                helper._id
            );


            return res.status(201).json({

                success: true,

                message:
                    "Helper profile created successfully.",

                helper

            });

        } catch (error) {

            console.error(
                "CREATE HELPER ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Could not create helper profile."

            });

        }

    }
);


// =====================================================
// GET ALL HELPERS
// GET /api/helpers
// =====================================================

router.get("/", async (req, res) => {

    try {

        const helpers =
            await Helper.find()
                .sort({ createdAt: -1 });


        res.json(helpers);

    } catch (error) {

        console.error(
            "GET HELPERS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});


// =====================================================
// SEARCH HELPERS
// GET /api/helpers/search
// =====================================================

router.get("/search", async (req, res) => {

    try {

        const {
            profession,
            city
        } = req.query;


        const filter = {};


        if (profession && profession.trim()) {

            filter.profession = {

                $regex:
                    profession.trim(),

                $options: "i"

            };

        }


        if (city && city.trim()) {

            filter.city = {

                $regex:
                    city.trim(),

                $options: "i"

            };

        }


        const helpers =
            await Helper.find(filter)
                .sort({ createdAt: -1 });


        res.json(helpers);

    } catch (error) {

        console.error(
            "SEARCH HELPERS ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});


// =====================================================
// GET HELPER BY USER ID
// GET /api/helpers/user/:userId
// =====================================================

router.get("/user/:userId", async (req, res) => {

    try {

        const userId =
            req.params.userId;


        if (!mongoose.Types.ObjectId.isValid(userId)) {

            return res.status(400).json({

                success: false,

                message: "Invalid user ID."

            });

        }


        const helper =
            await Helper.findOne({ userId });


        if (!helper) {

            return res.status(404).json({

                success: false,

                message:
                    "Helper profile not found."

            });

        }


        res.json(helper);

    } catch (error) {

        console.error(
            "GET HELPER BY USER ID ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});


// =====================================================
// UPDATE HELPER PROFILE
// PUT /api/helpers/user/:userId
// =====================================================

router.put(
    "/user/:userId",
    upload.single("photo"),
    async (req, res) => {

        try {

            const userId =
                req.params.userId;


            if (!mongoose.Types.ObjectId.isValid(userId)) {

                return res.status(400).json({

                    success: false,

                    message: "Invalid user ID."

                });

            }


            const helper =
                await Helper.findOne({ userId });


            if (!helper) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Helper profile not found."

                });

            }


            // -------------------------------
            // UPDATE TEXT FIELDS
            // -------------------------------

            if (req.body.name !== undefined) {
                helper.name =
                    req.body.name.trim();
            }


            if (req.body.profession !== undefined) {
                helper.profession =
                    req.body.profession.trim();
            }


            if (req.body.city !== undefined) {
                helper.city =
                    req.body.city.trim();
            }


            if (req.body.phone !== undefined) {
                helper.phone =
                    req.body.phone.trim();
            }


            if (req.body.experience !== undefined) {
                helper.experience =
                    req.body.experience.trim();
            }


            if (req.body.description !== undefined) {
                helper.description =
                    req.body.description.trim();
            }


            // -------------------------------
            // UPDATE PHOTO
            // -------------------------------

            if (req.file) {

                // Delete old photo if it exists

                if (helper.photo) {

                    const oldPhotoPath =
                        path.join(
                            uploadDir,
                            helper.photo
                        );


                    if (fs.existsSync(oldPhotoPath)) {

                        try {

                            fs.unlinkSync(
                                oldPhotoPath
                            );

                        } catch (deleteError) {

                            console.log(
                                "Could not delete old photo:",
                                deleteError.message
                            );

                        }

                    }

                }


                helper.photo =
                    req.file.filename;

            }


            // -------------------------------
            // SAVE
            // -------------------------------

            await helper.save();


            console.log(
                "Helper profile updated:",
                helper._id
            );


            res.json({

                success: true,

                message:
                    "Helper profile updated successfully.",

                helper

            });

        } catch (error) {

            console.error(
                "UPDATE HELPER ERROR:",
                error
            );


            res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Could not update helper profile."

            });

        }

    }
);


// =====================================================
// GET SINGLE HELPER BY ID
// IMPORTANT: KEEP THIS LAST
// GET /api/helpers/:id
// =====================================================

router.get("/:id", async (req, res) => {

    try {

        const id =
            req.params.id;


        if (!mongoose.Types.ObjectId.isValid(id)) {

            return res.status(400).json({

                success: false,

                message: "Invalid helper ID."

            });

        }


        const helper =
            await Helper.findById(id);


        if (!helper) {

            return res.status(404).json({

                success: false,

                message: "Helper not found."

            });

        }


        res.json(helper);

    } catch (error) {

        console.error(
            "GET SINGLE HELPER ERROR:",
            error
        );

        res.status(500).json({

            success: false,

            message: error.message

        });

    }

});


module.exports = router;
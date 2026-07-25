const jwt = require("jsonwebtoken");
const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

const router = express.Router();


// Register User
router.post("/register", async (req, res) => {

    try {

        const { name, email, password, role } = req.body;


        // Check existing user
        const existingUser = await User.findOne({ email });

        if(existingUser){
            return res.status(400).json({
                message: "User already exists"
            });
        }


        // Encrypt password
        const hashedPassword = await bcrypt.hash(password, 10);


        // Create user
        const user = await User.create({

            name,
            email,
            password: hashedPassword,
            role

        });


        res.status(201).json({

            message: "User registered successfully",
            user

        });


    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});


module.exports = router;

// Login User
router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;


        // Find user
        const user = await User.findOne({ email });


        if(!user){
            return res.status(400).json({
                message:"User not found"
            });
        }


        // Check password
        const isMatch = await bcrypt.compare(
            password,
            user.password
        );


        if(!isMatch){
            return res.status(400).json({
                message:"Invalid password"
            });
        }


        // Create token
        const token = jwt.sign(
            {
                id:user._id,
                role:user.role
            },
            "localhelper_secret",
            {
                expiresIn:"7d"
            }
        );


        res.json({

            message:"Login successful",

            token,

            user:{
                id:user._id,
                name:user.name,
                email:user.email,
                role:user.role
            }

        });


    } catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});
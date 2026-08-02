const Admin = require("../models/Admin");
const express = require("express");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Helper = require("../models/Helper");

const router = express.Router();

// CREATE ADMIN

router.post("/register", async(req,res)=>{

    try{

        const {name,email,password}=req.body;


        const admin = new Admin({

            name,
            email,
            password

        });


        await admin.save();


        res.json({

            success:true,
            message:"Admin created successfully"

        });


    }
    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }

});

// ================= ADMIN LOGIN =================
router.post("/login", async(req,res)=>{

    try{

        const {email,password}=req.body;


        const admin = await Admin.findOne({
            email:email
        });


        if(!admin){

            return res.status(401).json({

                success:false,
                message:"Admin not found"

            });

        }


        if(admin.password !== password){

            return res.status(401).json({

                success:false,
                message:"Wrong password"

            });

        }


        const token = jwt.sign(

            {
                id:admin._id,
                role:"admin"
            },

            process.env.JWT_SECRET,

            {
                expiresIn:"1d"
            }

        );


        res.json({

            success:true,
            token

        });


    }
    catch(error){

        res.status(500).json({

            success:false,
            message:error.message

        });

    }


});



// ================= DASHBOARD STATS =================

router.get("/stats", async (req,res)=>{

    try{


        const totalCustomers = await User.countDocuments({
            role:"customer"
        });


        const totalHelpers = await Helper.countDocuments();



        res.json({

            success:true,
            totalCustomers,
            totalHelpers

        });


    }
    catch(error){

        console.error(error);


        res.status(500).json({

            success:false,
            message:"Error loading statistics"

        });

    }

});




// ================= GET ALL CUSTOMERS =================

router.get("/customers", async(req,res)=>{


    try{


        const customers = await User.find({
            role:"customer"
        })
        .sort({
            createdAt:-1
        });



        res.json({

            success:true,
            customers

        });


    }
    catch(error){


        console.log(error);


        res.status(500).json({

            success:false,
            message:"Error loading customers"

        });


    }


});




// ================= GET ALL HELPERS =================

router.get("/helpers", async(req,res)=>{


    try{


        const helpers = await Helper.find()
        .sort({
            createdAt:-1
        });



        res.json({

            success:true,
            helpers

        });


    }
    catch(error){


        console.error(error);


        res.status(500).json({

            success:false,
            message:"Error loading helpers"

        });


    }


});








// ================= DELETE HELPER =================

router.delete("/helper/:id", async(req,res)=>{


    try{


        await Helper.findByIdAndDelete(
            req.params.id
        );



        res.json({

            success:true,
            message:"Helper deleted successfully"

        });


    }
    catch(error){


        console.error(error);


        res.status(500).json({

            success:false,
            message:"Error deleting helper"

        });


    }


});



// ================= EXPORT =================
// ================= DELETE CUSTOMER =================

router.delete("/customer/:id", async (req, res) => {

    try {

        await User.findByIdAndDelete(req.params.id);


        res.json({

            success:true,

            message:"Customer deleted successfully"

        });


    } catch(error){


        console.log(error);


        res.status(500).json({

            success:false,

            message:"Error deleting customer"

        });


    }

});

module.exports = router;
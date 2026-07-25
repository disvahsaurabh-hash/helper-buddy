const multer = require("multer");
const express = require("express");
const Helper = require("../models/Helper");

const router = express.Router();

const storage = multer.diskStorage({

destination:function(req,file,cb){

cb(null,"uploads/");

},


filename:function(req,file,cb){

cb(null,Date.now()+"-"+file.originalname);

}

});


const upload = multer({
storage:storage
});


// Create Helper Profile

router.post("/create",
upload.single("photo"),
async(req,res)=>{

    try{

        console.log("BODY:");
        console.log(req.body);

        console.log("FILE:");
        console.log(req.file);


        const helper = await Helper.create({

    userId:req.body.userId,

    name:req.body.name,

    profession:req.body.profession,

    city:req.body.city,

    phone:req.body.phone,

    experience:req.body.experience,

    description:req.body.description,

    photo:req.file 
        ? req.file.filename 
        : ""

});


        res.status(201).json({

            message:"Helper profile created successfully",

            helper

        });


    }catch(error){

        res.status(500).json({

            message:error.message

        });

    }

});

// Get all helpers
router.get("/", async (req,res)=>{

    try{

        const helpers = await Helper.find();

        res.json(helpers);


    }catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});

// Search Helpers with city and profession

router.get("/search", async(req,res)=>{

    try{

        const { profession, city } = req.query;


        let filter = {};


        if(profession){

            filter.profession = {
                $regex: profession,
                $options:"i"
            };

        }


        if(city){

            filter.city = {
                $regex: city,
                $options:"i"
            };

        }



        const helpers = await Helper.find(filter);



        res.json(helpers);


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }


});

// Get single helper

router.get("/:id", async(req,res)=>{

try{

const helper = await Helper.findById(req.params.id);


res.json(helper);


}
catch(error){

res.status(500).json({
message:error.message
});

}

});

// Get single helper profile

router.get("/:id", async(req,res)=>{

    try{

        const helper = await Helper.findById(req.params.id);


        if(!helper){

            return res.status(404).json({
                message:"Helper not found"
            });

        }


        res.json(helper);


    }
    catch(error){

        res.status(500).json({
            message:error.message
        });

    }

});
module.exports = router;
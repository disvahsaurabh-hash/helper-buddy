const mongoose = require("mongoose");


const helperSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    name:{
        type:String,
        required:true
    },

    profession:{
        type:String,
        required:true
    },

    city:{
        type:String,
        required:true
    },

    phone:{
        type:String,
        required:true
    },

    experience:{
        type:String,
        required:true
    },

    description:{
        type:String
    },

    photo:{
        type:String
    }

},
{
    timestamps:true
});


module.exports = mongoose.model("Helper", helperSchema);
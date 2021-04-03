var mongoose = require('mongoose');

let tempuserSchema = new mongoose.Schema({

    Username:String, 
    First_name:String,
    Last_name:String,
    email:String,
    we_chat:String,
    userType:String,
    wassup:Number,
    facebook:String,
    password:String,
    isverified:{
        type:Boolean,
        default:false
    },
    isverifiedbyadmin:{
        type:Boolean,
        default:false
    },
 ProfilePic:String
})

let tempuser = mongoose.model('tempuser',tempuserSchema);
module.exports =  tempuser;
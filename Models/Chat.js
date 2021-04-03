
const  mongoose  = require("mongoose");
const  Schema  =  mongoose.Schema;

const messageSchema = new Schema({
    from : String,
    to:String,
    Message:String
})


const  chatSchema  =  new Schema({
    roomId:String,
    user:String,
    Seller:String,
Message:[messageSchema,{timestamps: true}],
        uuid:String
});
let  Chat  =  mongoose.model("Chat", chatSchema);
module.exports  =  Chat;


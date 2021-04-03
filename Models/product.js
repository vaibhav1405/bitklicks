var mongoose = require('mongoose');

let productSchema = new mongoose.Schema({

    // pname : String,
    // cname : String,
    // asin  : String,
    // Promotion: String,
    // aval  :String,
    // brand : String,
    // store : String
    AvgRating:{type:Number,default:0},
    PostedBy:String,
    PostedByemail:String,
    keywords:String,
    Asin:String,
    Link:String,
    Store:String,
    Option:String,
    Country:String,
    Amount:String,
    Amountperday:String,
    Price:String,
    OwnPart:String,
    Condition:String,
    RefundWithFeedback:String,
    allowedagenttakeselfpart:String,
    Refundinclfee:String,
    ReviewwithPic:String,
    Reviewwithvideo:String
    
})

let product = mongoose.model('product',productSchema);
module.exports =  product;
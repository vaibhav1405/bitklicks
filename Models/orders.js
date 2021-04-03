var mongoose = require('mongoose');

let OrderSchema = new mongoose.Schema({


        userfirstname:String,
        userlastname:String,
        useremail:String,
        userAsin:{},
        userPrice:{},
        userQuantity:{},
        userAddress:{},
        userZip:{},
        productDelivered:{
            type:Boolean,default:false
        },
        productCancelled:{
            type:Boolean,default:false
        },
        productPostedby:{},
        productPostedbyemail:{}

})

let Orders = mongoose.model('Orders',OrderSchema);
module.exports =  Orders;
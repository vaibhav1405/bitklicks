var mongoose = require('mongoose');

let reviewSchema = new mongoose.Schema({

   email : String,
   item_id : String,
   description : String
})

let review = mongoose.model('review',reviewSchema);
module.exports =  review;
var mongoose = require('mongoose');

let ratingSchema = new mongoose.Schema({

   email : String,
   ProductAsin : String,
   rating : String
})

let ratings = mongoose.model('ratings',ratingSchema);
module.exports =  ratings;
var mongoose = require('mongoose');

let feedbackSchema = new mongoose.Schema({

   email : String,
   item_id : String,
   description : String
})

let feedback = mongoose.model('feedback',feedbackSchema);
module.exports =  feedback;
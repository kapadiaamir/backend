var mongoose = require('mongoose'); 

var reviewSchema = new mongoose.Schema({
    title: String, 
    date: { type : Date, default: Date.now },
    studentId: String, 
    landlordId: String, 
    content: String,
    votes: Number
});

var review = mongoose.model('Review', reviewSchema); 

module.exports = review; 

var mongoose = require('mongoose');

var studentSchema = new mongoose.Schema({
    type: String,
    username: String, 
    password: String, 
    email: String, 
    firstname: String, 
    lastname: String, 
    yearsAtCollege: Number, 
    yearsOffCampus: Number, 
    currentlyOffCampus: Boolean
});


var student = mongoose.model('Student', studentSchema);

module.exports = student; 
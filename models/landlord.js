var mongoose = require('mongoose');

var landlordSchema = new mongoose.Schema({
    type: String,
    username: String, 
    password: String,
    firstname: String, 
    lastname: String, 
    companyname: String, 
    email: String, 
    phone: String, 
    yearsInService: Number,
    activated: Boolean
});

var landlord = mongoose.model('Landlord', landlordSchema);

module.exports = landlord; 

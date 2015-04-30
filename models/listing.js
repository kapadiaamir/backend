var mongoose = require('mongoose'); 

var listingSchema = new mongoose.Schema({
    address: String, 
    landlordId: String, 
    rent: Number, 
    utilities: [ String ], 
    type: String, 
    bedrooms: Number, 
    details: String
});

var listing = mongoose.model('Listing', listingSchema); 

module.exports = listing;
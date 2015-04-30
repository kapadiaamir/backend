var mongoose = require('mongoose'); 

var commentSchema = new mongoose.Schema({
    authordId : String,
    date : { type : Date, default: Date.now },
    reviewId : mongoose.Schema.Types.ObjectId,
    content : String
});

var comment = mongoose.model('Comment', commentSchema);

module.exports = comment; 
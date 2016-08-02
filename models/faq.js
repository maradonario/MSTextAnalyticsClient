var mongoose = require('mongoose');

var faqSchema = mongoose.Schema({
    name : String,
    links : [String],
    message : String,
    tags : [String]
});

var FAQ = mongoose.model('FAQ', faqSchema);
module.exports = FAQ;
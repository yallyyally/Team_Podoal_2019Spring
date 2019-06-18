var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var picture = new Schema({
   author: {type: String},
   content: {type: String},
   title: {type: String}
});

module.exports = mongoose.model('picture',picture);
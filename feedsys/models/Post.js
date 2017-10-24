var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  title: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  content: String,
  comments: [{
        text: String,
        postedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }]
});

module.exports = mongoose.model('PostSchema', Post);

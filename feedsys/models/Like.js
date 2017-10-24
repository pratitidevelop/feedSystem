var mongoose = require('mongoose');

var LikeSchema = new mongoose.Schema({
  likedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

module.exports = mongoose.model('Likes', LikeSchema);

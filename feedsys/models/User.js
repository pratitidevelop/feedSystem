var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
  name: String,
  dateOfBirth: Date,
  friends: [this],
  followers: [this]
});


module.exports = mongoose.model("User", UserSchema);

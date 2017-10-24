var mongoose = require('mongoose');
var config = require('../config');

mongoose.connect(config.database,{useMongoClient: true});
var db = mongoose.connection;

db.on('error', function (err) {
  console.log("error in connecting db reason: ", err.message);
});

db.on('open', function callback () {
  console.log("connected to DB");
});



module.exports.db = db;

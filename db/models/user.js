var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var UserSchema = new Schema({
  admin: Boolean,
  notify: Boolean,
  email: String,
  maxLimit: Number
});
module.exports = mongoose.model("Users", UserSchema);

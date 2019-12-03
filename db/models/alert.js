var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var AlertSchema = new Schema({
  dateTime: String,
  occupation: Number,
  receiver: String
});
module.exports = mongoose.model("Alerts", AlertSchema);
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var sensorSchema = new Schema({
    id: Number
});
module.exports = mongoose.model('Sensors',sensorSchema);
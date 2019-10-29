var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var readingSchema = new Schema({
    sensorId: Number,
    status: Boolean,
    dateTime: Date,
});
module.exports = mongoose.model('Readings',readingSchema);
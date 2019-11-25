let mongoose = require("mongoose");
mongoose.set('useUnifiedTopology', true);
const server = "127.0.0.1:27017";
const database = "parking";

let SensorModel = require("./models/sensor");
let Readingmodel = require("./models/readings");
class DatabaseManager {


    connect() {
        return mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true });
    }
    getSensors(){
        return SensorModel.find().exec();
    }
    saveSensor(sensorObj) {

        let sensor = new SensorModel(sensorObj);
        sensor.save()
            .then(() => {
                console.log("[*] Sensor saved.");
            })
            .catch(err => {
                console.error(err);
            });
    }
    getSensorLastStatus(sensorId) {
        return Readingmodel.findOne({ sensorId }, {}, { sort: { 'dateTime': -1 } }).exec();

    }
    saveReading(readingObject) {

        var date = new Date();
        readingObject.dateTime = date;
        let reading = new Readingmodel(readingObject);
        reading.save()
            .then(() => {
                console.log("[*] Reading saved.");
            })
            .catch(err => {
                console.error(err);
            });
    }
}
module.exports = new DatabaseManager();

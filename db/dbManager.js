let mongoose = require("mongoose");
mongoose.set('useUnifiedTopology', true);
const server = "127.0.0.1:27017";
const database = "parking";

let SensorModel = require("./models/sensor");
let Readingmodel = require("./models/readings");
class DatabaseManager {
    constructor() {
        this.connect();
    }

    connect() {
        mongoose.connect(`mongodb://${server}/${database}`, { useNewUrlParser: true }).then(() => {
            console.log("[*] Connected to the DB.");
        }).catch(err => {
            console.log("[ERROR] DB connection failed.");
        });

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
    saveReading(readingObject) {

        var date = new Date();
        readingObject.dateTime =date;
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

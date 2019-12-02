var express = require("express");
var app = express();
var db = require("../db/dbManager");
var server = require("http").Server(app);
var io = require("socket.io")(server);
const path = require("path");
var ip = require("ip");
var moment = require("moment");
let regression = require("regression");

let SensorModel = require("../db/models/sensor");
let Readingmodel = require("../db/models/readings");

var readings = [];
// Initializing readings
db.getSensors().then(sensors => {
  sensors.forEach(sensor => {
    db.getSensorLastStatus(sensor.id).then(reading => {
      const rtemp = {
        sensorId: sensor.id,
        status: reading != null ? reading.status : false
      };
      readings.push(rtemp);
    });
  });
});

app.use(express.static(path.join(__dirname, "/views")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.get("/", function(req, res) {
  res.render("indexUsuario", { ip: ip.address() });
});
app.get("/admin", (req, res) => {
  res.render("indexAdmin", { ip: ip.address() });
});

// Route for KPI 2: get use percentage by date
app.get("/api/calculations/percentage/:date", async (req, res) => {
  const date = req.params.date;
  const percentages = await calculateDayUsePercentege(date);
  res.status(200).send(percentages);
});
// Route for KPI 3: get mean of use (minutes) by period
app.get("/api/calculations/mean/:from/:to", async (req, res) => {
  const sensor = req.params.sensor;
  const from = req.params.from;
  const to = req.params.to;
  let means = [];
  let fromDate = moment(from).startOf("day");
  let toDate = moment(to).endOf("day");
  // Sensors from database
  let sensorsDB = await SensorModel.find();
  // For every sensor
  for (let i = 0; i < sensorsDB.length; i++) {
    //Fetch readings between dates
    let sensorReadings = await Readingmodel.find({
      sensorId: sensorsDB[i].id,
      dateTime: { $gte: fromDate.toDate(), $lte: toDate.toDate() }
    });
    let diffSum = 0;
    let nDiff = 0;
    // For every reading
    for (let n = 0; n < sensorReadings.length; n++) {
      let activationDate = null;
      let freeDate = null;
      let diff = null;
      // If theres is at least one more reading after this one
      if (n < sensorReadings.length - 1) {
        // Get te date of the "true" reading
        activationDate = moment(sensorReadings[n].dateTime);
        // Add 1 to n to get the next "false" reading
        n++;
        freeDate = moment(sensorReadings[n].dateTime);
        diff = freeDate.diff(activationDate, "minutes");
      }
      // This is the last "true" reading and is the current sensor status
      else {
        // Get te date of the "true" reading (current)
        activationDate = moment(sensorReadings[n].dateTime);
        freeDate = moment(Date.now());
        // Diff will be the time in minutes that the place has been in use
        diff = freeDate.diff(activationDate, "minutes");
      }
      nDiff++;
      diffSum += diff;
    }
    const mean = nDiff > 0 ? Math.round(diffSum / nDiff) : 0;
    means.push(mean);
  }
  res.status(200).send(means);
});

// Route for analytic (linear regression) for prediction
app.get("/api/analytics/prediction/:dateToPredict", async (req, res) => {
  let percentages = [];
  let dates = [];
  let dayOfWeek = moment(req.params.dateToPredict).day(); // 0

  // Find the first reading int DB
  let rd = await Readingmodel.findOne();
  // Find the first coincidence of the recived day of week
  let firstDate = moment(rd.dateTime).startOf("day");
  let firstDay = firstDate.day(); // 5
  dayOfWeek = dayOfWeek == 0 ? 7 : dayOfWeek;
  firstDay = firstDay == 0 ? 7 : firstDay;
  if (dayOfWeek >= firstDay)
    firstDate = firstDate.add(dayOfWeek - firstDay, "d");
  else firstDate = firstDate.add(7 - firstDay + dayOfWeek, "d");
  const currentDate = moment(Date.now()).startOf("day");
  // Start iterating for searching all the "day of week" before current date
  while (firstDate.isBefore(currentDate)) {
    // Save date into array for analization and go to the next week
    dates.push(firstDate.clone());
    firstDate = firstDate.add(7, "d");
  }
  // For every date on array: calculate use percentage for every hour
  for (let i = 0; i < dates.length; i++) {
    const dayPercentage = await calculateDayUsePercentege(dates[i]);
    percentages.push(dayPercentage);
  }
  // If the number of arrays is more than 1
  if (percentages.length > 0) {
    let finalPredictions = new Int32Array(24);
    // Calculates linnear regression for every hour
    for (let hour = 0; hour < 24; hour++) {
      let bigArray = [];
      let miniArray = Array(2);
      for (let i = 0; i < percentages.length; i++) {
        miniArray[0] = i + 1;
        miniArray[1] = percentages[i][hour];
      }
      bigArray.push(miniArray);
      let lineal = regression.linear(bigArray);
      let prediction = lineal.predict(percentages.length + 1);
      finalPredictions[hour] = Math.round(prediction[1]);
    }
    res.status(200).send(finalPredictions)
  } else res.status(200).send("NOT_ENOUGH_DATA");
});
io.on("connection", function(socket) {
  console.log("Alguien se ha conectado con Sockets");
  socket.emit("messages", readings);
  socket.emit("currentPercentage", calculatePercentage());
  // socket.on('new-message', function (data) {
  //   messages.push(data);

  //   io.sockets.emit('messages', messages);
  // });
});
server.listen(8080, function() {
  console.log("Servidor corriendo en http://localhost:8080");
});

//// Private methods
// Calculate current use percentage
calculatePercentage = () => {
  const length = readings.length;
  let ocuppied = 0;
  let free = 0;
  readings.forEach(element => {
    element.status ? ocuppied++ : free++;
  });
  const percentage = {
    occupied: (ocuppied * 100) / length,
    free: (free * 100) / length
  };
  return percentage;
};
// Calculates use percentage by hours on especific date
calculateDayUsePercentege = async date => {
  let fromDate = moment(date).startOf("day");
  let toDate = moment(date).endOf("day");
  let readingsbyDate = await Readingmodel.find({
    dateTime: { $gte: fromDate.toDate(), $lte: toDate.toDate() }
  });
  let s = await SensorModel.find();
  // Search for readings with hour at i position
  let HourxSensor = [];
  HourxSensor.push([]);
  // Initialize array elements to false
  for (let i = 1; i < 24; i++) {
    let sensorArray = Array(s.length + 1);
    sensorArray[0] = i;
    for (let x = 1; x < sensorArray.length; x++) {
      sensorArray[x] = false;
    }
    HourxSensor.push(sensorArray);
  }

  for (let n = 0; n < readingsbyDate.length; n++) {
    const hour = moment(readingsbyDate[n].dateTime).hours();
    const sensorId = readingsbyDate[n].sensorId;
    HourxSensor[hour][sensorId] = readingsbyDate[n].status
      ? true
      : HourxSensor[hour][sensorId];
  }
  let percentages = new Int16Array(24);
  const totalSensors = s.length;
  for (let i = 0; i < 24; i++) {
    let activeSensors = 0;
    // Calculate percentaje of every hour
    for (let n = 1; n < s.length; n++) {
      if (HourxSensor[i][n]) {
        activeSensors++;
      }
    }
    percentages[i] = (activeSensors * 100) / totalSensors;
  }
  return percentages;
};
// Public methods
exports.sendNotification = jsonStatus => {
  var reading = jsonStatus;
  io.sockets.emit("message", reading);
  if (readings.length > 0) {
    var indexToEdit = -1;
    readings.forEach((item, index) => {
      if (item.sensorId === reading.sensorId) {
        indexToEdit = index;
        return;
      }
    });
    if (indexToEdit >= 0) {
      readings[indexToEdit] = reading;
    } else readings.push(reading);
  } else readings.push(reading);
  // Always  calculates current percentage of ocuppied places and emits it.
  io.sockets.emit("currentPercentage", calculatePercentage());
};

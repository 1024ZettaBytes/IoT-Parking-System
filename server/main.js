var express = require('express');
var app = express();
var db = require("../db/dbManager");
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');
var ip = require('ip');

var readings = [];
// Initializing readings
db.getSensors().then((sensors)=>{
  sensors.forEach(sensor=>{
    db.getSensorLastStatus(sensor.id).then((reading)=>{
      const rtemp ={
        sensorId: sensor.id,
        status: reading!=null ? reading.status : false
      }
        readings.push(rtemp);  
    });
  });
});

app.use(express.static(path.join(__dirname, '/views')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', function (req, res) {
  res.render('indexUsuario',{ip: ip.address()});
});
app.get('/admin', (req, res) => {
  res.render('indexAdmin', {ip: ip.address()});
})
app.get('/admin/api/porcentajeOcupacion', (req, res) => {
  res.render('indexUsuario');
})
io.on('connection', function (socket) {
  console.log('Alguien se ha conectado con Sockets');
  socket.emit('messages', readings);
  socket.emit('currentPercentage', calculatePercentage());
  // socket.on('new-message', function (data) {
  //   messages.push(data);

  //   io.sockets.emit('messages', messages);
  // });
});

server.listen(8080, function () {
  console.log("Servidor corriendo en http://localhost:8080");
});

// Calculations
calculatePercentage = () => {
  const length = readings.length;
  let ocuppied = 0;
  let free = 0;
  readings.forEach(element => {
    element.status ? ocuppied++ : free++;
  });
  const percentage = {
    occupied: ocuppied * 100 / length,
    free: free * 100 / length
  }
  return percentage;
}


// Public methods
exports.sendNotification = (jsonStatus) => {
  var reading = jsonStatus;
  io.sockets.emit('message', reading);
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
    }
    else
      readings.push(reading);
  }
  else
    readings.push(reading);

    console.log(readings);
  // Always  calculates current percentage of ocuppied places and emits it.
  io.sockets.emit('currentPercentage', calculatePercentage());
  

}


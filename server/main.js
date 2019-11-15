var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
const path = require('path');

var readings = [];

// importing routes
const indexRoutes = require('./routes/index')
// routes
app.use('/', indexRoutes);
app.use(express.static(path.join(__dirname, '/views')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/hello', function (req, res) {
  res.status(200).send("Hello rld!");
});

io.on('connection', function (socket) {
  console.log('Alguien se ha conectado con Sockets');
  socket.emit('messages', readings);

  // socket.on('new-message', function (data) {
  //   messages.push(data);

  //   io.sockets.emit('messages', messages);
  // });
});

server.listen(8080, function () {
  console.log("Servidor corriendo en http://localhost:8080");
});

exports.sendNotification = (jsonStatus) => {
  var reading = jsonStatus;
  io.sockets.emit('message', reading);
  if (readings.length > 0) {
    var indexToEdit = -1;
    readings.forEach((item, index) => {
      if (item.id === reading.id) {
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

}
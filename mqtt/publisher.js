var mqtt = require("mqtt");
var client = mqtt.connect("mqtt://localhost:1883");
var status = true;
client.on("connect", function() {
  setInterval(function() {
    var reading = {
      sensorId: 2,
      status: status
    };  
    client.publish("readings", JSON.stringify(reading));
    console.log("Enviado: " + status);
    console.log(JSON.stringify(reading));
    status = !status;
  }, 3200);
});

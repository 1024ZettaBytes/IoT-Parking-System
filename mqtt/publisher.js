var mqtt = require('mqtt');
var client = mqtt.connect('mqtt://localhost:1883');
var status = false;
client.on('connect', function () {
    setInterval(function () {
        var reading = {
            sensorId:1,
            status: status
        };
        client.publish('readings', JSON.stringify(reading));
        console.log('Enviado: '+status);
        console.log(JSON.stringify(reading));
        status = !status;
    }, 11000);
});
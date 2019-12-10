var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1883')
client.on('connect', function () {
    client.subscribe('readings')
    console.log("[*] Subscriber connected.");
})
client.on('message', function (topic, message) {
    const reading = JSON.parse(message.toString());
    console.log(reading);
// JSON object sent to quality
})
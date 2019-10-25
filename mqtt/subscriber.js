var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1883')
var qlity = null;
client.on('connect', function () {
    client.subscribe('readings')
    console.log("[*] Subscriber connected.");
    qlity = require("../quality/qlity");
})
client.on('message', function (topic, message) {
const reading = JSON.parse(message.toString());
// JSON object sent to quality

qlity.checkQuality(reading);
})
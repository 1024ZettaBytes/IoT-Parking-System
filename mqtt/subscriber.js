var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1883')
var serv = require("../server/main");
client.on('connect', function () {
    client.subscribe('readings')
    console.log("[*] Subscriber connected.");
})
client.on('message', function (topic, message) {
const reading = JSON.parse(message.toString());
serv.sendNotification(reading);
})
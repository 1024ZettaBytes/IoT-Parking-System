var mqtt = require('mqtt')
var client  = mqtt.connect('mqtt://localhost:1883')
var serv = require("../server/main");
client.on('connect', function () {
    client.subscribe('myTopic')
    console.log("subscriber connected");
})
client.on('message', function (topic, message) {
context = message.toString();
console.log(context);
serv.hi(context);
})
var mosca = require("mosca");
var settings = {
  port: 1883
};

var server = new mosca.Server(settings);

server.on("ready", function() {
  console.log("mqtt ready");
});
server.on("clientConnected", function(client) {
  console.log("Client connected", client.id);
});
server.on('published', function(packet, client) {
	console.log('Published', packet.messageId);
  });
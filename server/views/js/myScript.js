var socket = io.connect('http://localhost:8080', { 'forceNew': true });

socket.on('messages', (data)=> {
  console.log(data);
  data.forEach((item, index) => {
    updatePlace(item);
  });
});
socket.on('message',(data)=>{
console.log(data);
updatePlace(data);
});
function updatePlace(jsonObject){
  var color = "red";
  var text = "OCUPADO";
  if(!jsonObject.status){
    color = "green";
    text = "LIBRE";
  }
  document.getElementById('Place'+jsonObject.sensorId).innerHTML = text;
  document.getElementById('Place'+jsonObject.sensorId).style.color = color;
}
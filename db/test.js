var db = require("./dbManager")
var valor = true;
setInterval(()=>{
db.getSensorLastStatus(1).then((reading)=>{
    valor = reading.status;
});
console.log(valor);
}, 5000);

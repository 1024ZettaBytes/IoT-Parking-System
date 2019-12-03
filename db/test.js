var db = require("./dbManager")
var valor = true;
/* setInterval(()=>{
db.getSensorLastStatus(1).then((reading)=>{
    valor = reading.status;
});
console.log(valor);
}, 5000);
 */
db.connect().then(()=>{
    console.log("Conectado");
    db.saveSensor({id:4});
});

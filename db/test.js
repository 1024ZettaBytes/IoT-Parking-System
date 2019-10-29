//var db = require("./dbManager")
var moment = require("moment")
var f= moment().format("YYYY-MM-DD");
var h = moment().format("hh:mm:ss");

var fecha = Date.parse(f+" "+h);
var f2 = new Date(fecha);
console.log(f2.toLocaleString());

console.log(moment());
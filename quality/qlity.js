console.log("[*] Quality running.");
var server = require("../server/main");
var history = {
};
exports.checkQuality = (readigJSON) => {
    const historyId = readigJSON.id + "";
    var myLastReading = 0;
    if (!history[historyId]) {

        history[historyId] = { "lastReading": 0 };
    }
    else {
        myLastReading = history[historyId].lastReading +1;
        history[historyId].lastReading = myLastReading;
    }
    
    setTimeout(() => {
        // Si hubo uno o más después
        if(history[historyId].lastReading===myLastReading){
            setTimeout(() => {
                server.sendNotification(readigJSON);
                // Se guarda en la bd
            }, 10);
        }
        else{
            console.log("NO se hace nada pues fui interrumpido.")
        }

    }, 11000);
}
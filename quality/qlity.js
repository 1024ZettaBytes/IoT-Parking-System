console.log("[*] Quality running.");
var server = null;
var db = require("../db/dbManager");
var history = {
};
db.connect().then(() => {
    console.log("[*] Connected to the DB.");
    server = require("../server/main");
}).catch(err => {
    console.log("[ERROR] DB connection failed.");
    console.log(err);
});
exports.checkQuality = (readigJSON) => {
    const historyId = readigJSON.sensorId + "";
    var myLastReading = 0;
    if (!history[historyId]) {
        db.getSensorLastStatus(readigJSON.sensorId).then((readignFromDB) => {
            history[historyId] = {
                "lastReading": 0,
                "originalStatus": readignFromDB!=null ? readignFromDB.status:false
            };
        });


    }
    else {
        myLastReading = history[historyId].lastReading + 1;
        history[historyId].lastReading = myLastReading;
    }

    setTimeout(() => {
        // Si hubo no hubo cambios (no hubo una lectura posterior en el mismo sensor)
        if (history[historyId].lastReading === myLastReading) {
            // Si el nuevo estado a guardar es diferente al original
            if (history[historyId].originalStatus !== readigJSON.status) {
                history[historyId].originalStatus = readigJSON.status;
                setTimeout(() => {
                    server.sendNotification(readigJSON);
                    db.saveReading(readigJSON);
                }, 10);
            }
            else
                console.log("No se guardó porque es igual al original");
        }
        else {
            console.log("NO se hace nada pues fui interrumpido.")
        }

    }, 3000);
}
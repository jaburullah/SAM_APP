/**
 * Created by jaburur on 21-07-2017.
 */

var fs = require("fs");
module.exports = {
    readHTML: function (file, callBack) {
        var filePath =  __dirname + "/../web/scripts/view/"+file+".html";
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                callBack(false, err);
            }
            callBack(true, data);
        });

    },
    readJSON:function (file,callBack) {
        var filePath =  __dirname + "/../web/scripts/view/"+file+".json";
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                callBack(false, err);
            }
            callBack(true, data);
        });
    }
};
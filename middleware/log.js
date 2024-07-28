const fs = require("fs");
// code for making function to create log.txt file
const log = (fileName) => {
    // code for making middleware for log.txt
    return (req, res, next) => {

        fs.appendFile(fileName, `\nMethod : ${req.method} || IP : ${req.ip} || Date : ${Date.now()}`, (err) => {
            if (err) throw err;
            next();
        })
    }

}

module.exports = log
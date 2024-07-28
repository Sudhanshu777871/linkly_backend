const { Pool } = require("pg");

require("dotenv").config();
// making object for pool
const config = new Pool({
    connectionString:process.env.CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
});

config.connect((err) => {
    if (err) throw err;
    else {
        console.log("Connection Is SuccessFully..............")
    }
})

module.exports = config;
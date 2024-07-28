const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const mainRouters = require("./routes/index");
const log = require("./middleware/log");

// codee for adding the middlwware
app.use(express.json());
app.use(cors());
// code for making middleware for log.txt
app.use(log("log.txt"))
// code for making middlware to send routes 
app.use("/", mainRouters)
app.use("/history", mainRouters)
app.use("/showGraphData", mainRouters)
app.use("/signup",mainRouters)
// code for lisitining the app
app.listen(process.env.RUNNING_PORT, () => {
    console.log(`Running On Port ${process.env.RUNNING_PORT}`)
})
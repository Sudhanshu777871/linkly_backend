const express = require("express");
const router = express.Router();
const { handleNewUrl, handleURLRedirect, handelURLHistory, showGraphData, handelUserSignup, handelUserLogin, handleUserURLCreated, handleUserURLDelete
 } = require("../contollers/index");
// making separate router

// making route for adding new url
router.post("/", handleNewUrl)

// making api for getting the getting the originla url
router.get("/:shortId", handleURLRedirect)


// making api for getting the history of api
router.post("/history", handelURLHistory);

// making api for getting the history click graph of api
router.post("/showGraphData", showGraphData);

// making api for user signup
router.post("/signup", handelUserSignup);

// making api for user login
router.post("/login", handelUserLogin);

// making api for user login
router.post("/handelURLCreated", handleUserURLCreated);

// making api for user login
router.delete("/handelURLDelete", handleUserURLDelete);
// exporting them
module.exports = router;
const shortid = require('shortid');
const config = require("../config");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.SECRET_KEY;

// making api for handling new URL
const handleNewUrl = async (req, res) => {
    if (req.body.originalURL && req.body.email) {
        const shortURLId = shortid.generate();
        const { originalURL, email } = req.body;

        try {
            const query = "INSERT INTO data (Original_Url, Short_Url, Email) VALUES ($1, $2, $3)";
            await config.query(query, [originalURL, shortURLId, email]);
            res.status(200).send({ result: `${req.headers.host}/${shortURLId}` });
            res.end();
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    } else {
        res.status(400).send("Please Send The URL and Email...");
    }
};

// making api for handling redirecting URL
const handleURLRedirect = async (req, res) => {
    if (!req.params.shortId) {
        return res.status(404).send({ message: "Page Not Found" });
    }

    try {
        // Code for searching the data
        const searchQuery = "SELECT Original_Url FROM data WHERE Short_Url = $1";
        const searchResult = await config.query(searchQuery, [req.params.shortId]);

        if (searchResult.rows.length === 0) {
            return res.status(404).send({ message: "Page Not Found" });
        }

        const originalUrl = searchResult.rows[0].original_url;
        res.redirect(originalUrl);

        // Code for inserting the history data
        const insertHistoryQuery = "INSERT INTO history (short_url) VALUES ($1)";
        await config.query(insertHistoryQuery, [req.params.shortId]);

    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
};



// making api for handling URL history 
const handelURLHistory = async (req, res) => {
    if (req.body.id && req.body.email) {
        const { id, email } = req.body;
        
        try {
            // Check if the user is valid
            const userResult = await config.query("SELECT Email FROM data WHERE Email = $1 AND Short_Url = $2", [email, id]);
            
            if (userResult.rowCount > 0) {
                // Search the history data
                const historyResult = await config.query("SELECT * FROM history WHERE short_URL = $1", [id]);
                
                if (historyResult.rowCount > 0) {
                    res.status(200).send(historyResult.rows);
                } else {
                    res.status(404).send({ status: false });
                }
            } else {
                res.status(400).send({ status: 2 });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send({ message: "Internal Server Error" });
        }
    } else {
        res.status(404).send({ message: "Page Not Found" });
    }
};


// making api for showing the graph data
const showGraphData = async (req, res) => {
    if (!req.body.id) {
        return res.status(404).send({ message: "Please Send The Id" });
    }

    try {
        const query = `
            SELECT DATE(Date) AS date_only, COUNT(*) AS date_count 
            FROM history 
            WHERE short_URL = $1 
            GROUP BY DATE(Date) 
            LIMIT 4
        `;
        const result = await config.query(query, [req.body.id]);

        res.status(200).send(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

// making api for handling the user url's created

const handleUserURLCreated = async (req, res) => {
    if (req.body.email) {
        const { email } = req.body;

        try {
            const query = "SELECT Short_Url, Created_Date FROM data WHERE Email = $1";
            const result = await config.query(query, [email]);

            res.status(200).send({ url: req.headers.host, data: result.rows });
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: "Internal Server Error" });
        }
    } else {
        res.status(400).send({ status: "Invalid Activity" });
    }
};

// code for making signup function
const handelUserSignup = async (req, res) => {
    const { name, email, password } = req.body;

    if (name && email && password) {
        try {
            // Check if user already exists
            const userCheckQuery = "SELECT * FROM users WHERE email = $1";
            const userCheckResult = await config.query(userCheckQuery, [email]);

            if (userCheckResult.rows.length > 0) {
                return res.status(400).send({ status: false, message: "User already exists" });
            }

            // Store the hashed password in the database
            const hashedPassword = await bcrypt.hash(password, 10);

            const insertUserQuery = "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)";
            await config.query(insertUserQuery, [name, email, hashedPassword]);

            const token = jwt.sign({ email }, secret);
            res.status(200).send({ userToken: token });
        } catch (err) {
            console.error(err);
            res.status(500).send({ status: "Login False", error: err.message });
        }
    } else {
        res.status(400).send({ status: false, message: "Missing required fields" });
    }
};

// making api for handling the user url's created
const handleUserURLDelete = async (req, res) => {
    if (req.body.id) {
        const { id } = req.body;

        try {
            const query = "DELETE FROM data WHERE Short_Url = $1";
            await config.query(query, [id]);
            res.status(200).send(true);
        } catch (err) {
            console.error(err);
            res.status(500).send({ message: "Internal Server Error" });
        }
    } else {
        res.status(400).send(false);
    }
};

// code for making fuction to handel the login
const handelUserLogin = async (req, res) => {
    const token = req.body.token;
    if (!token) {
        return res.status(400).send({ status: false });
    }

    try {
        const auth = jwt.verify(token, secret);
        if (auth) {
            res.status(200).send({ userToken: token });
        } else {
            res.status(401).send({ status: false });
        }
    } catch (error) {
        res.status(401).send({ status: false });
    }
};

// exporting the module

module.exports = { handleNewUrl, handleURLRedirect, handelURLHistory, showGraphData, handelUserSignup, handelUserLogin, handleUserURLCreated, handleUserURLDelete }
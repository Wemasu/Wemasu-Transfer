// MODULES
const File = require("./file.js");
const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
require("dotenv").config();

// GLOBAL VARIABLES
const jsonPath = __dirname + "/files.json";
const port = process.env.PORT;

// MIDDELWARE
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(fileUpload());

app.get("/", (req, res) => {
    res.status(300).redirect("/docs.html");
});

// CHECK FOR EXPIRED FILES
expiredFileChecker();

// ENABLE HOURLY CHECK
setInterval(() => {
    expiredFileChecker();
}, 3600000); // 3600000 => 1hr

// FUNCTION TO FIND AND DELETE EXPIRED FILES
function expiredFileChecker() {
    const filesArray = JSON.parse(fs.readFileSync(jsonPath)).filter((file) => {
        if (new Date(file.expirationDate) < new Date()) {
            fs.unlinkSync(file.uploadPath);
            return false;
        } else return true;
    });
    fs.writeFileSync(jsonPath, JSON.stringify(filesArray));
}

app.post("/login", async (req, res) => {
    try {
        // CHECK IF CREDENTIALS ARE MISSING
        if (!req.body.name || !req.body.password) throw new Error("Missing credentials.");

        // READ USERS
        const users = JSON.parse(fs.readFileSync(__dirname + "/users.json"));

        // FIND SPECIFIC USER
        const user = users.filter((user) => user.name.toLowerCase() == req.body.name);
        // COMPARE PASSWORDS
        if (user.length != 0) {
            user[0].password == req.body.password
                ? res.status(200).send({ success: "Login successful.", name: user[0].name })
                : res.status(400).send({ error: "Incorrect password." });
        } else throw new Error(`User ${req.body.name} does not exist.`);
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

app.post("/upload", async (req, res) => {
    try {
        // CHECK IF EMPTY
        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send("No files were uploaded.");
        }

        // CHECK IF FILE ALREADY EXISTS
        const file = req.files.file;
        const uploadPath = __dirname + "/uploads/" + file.name;
        const filesArray = JSON.parse(fs.readFileSync(jsonPath));

        filesArray.forEach((file) => {
            if (file.uploadPath === uploadPath) {
                throw new Error("File already exists");
            }
        });

        // CHECK IF FILE SIZE TO LARGE
        const MAX_FILE_SIZE = Math.pow(10, 9); // 1,000,000,000 BYTES => 1000 MB => 1 GB
        if (file.size > MAX_FILE_SIZE) return res.status(400).send("File too large!");

        // WRITE FILE TO JSON
        const newFile = new File(new Date(), 24, req.body.author, uploadPath);
        filesArray.push(newFile);
        fs.writeFileSync(jsonPath, JSON.stringify(filesArray));

        // UPLOAD FILE TO DATABASE
        file.mv(uploadPath, function (err) {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect(req.get("referer") + "home.html");
        });

        // CATCH THROWN ERRORS
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

app.get("/download", async (req, res) => {
    try {
        const files = JSON.parse(fs.readFileSync(jsonPath));

        // FIND SPECIFIC FILE
        let file = files.filter((file) => {
            const fileName = file.uploadPath.substring(file.uploadPath.lastIndexOf("/") + 1);
            return fileName === req.query.file;
        });

        if (file.length != 0) {
            res.download(file[0].uploadPath, (err) => {
                if (err) {
                    throw new Error(err);
                }
            });
        } else {
            throw new Error("No file found.");
        }
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// LISTEN TO PORT FOR FILE UPLOAD
app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});

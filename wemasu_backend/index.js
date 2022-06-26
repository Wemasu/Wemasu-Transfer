// MODULES
const File = require("./file.js");
const User = require("./user");
const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const https = require("https");
const bcrypt = require("bcryptjs");
const { ok } = require("assert");
require("dotenv").config();

// GLOBAL VARIABLES
const databasePath = __dirname + "/database.json";
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

// LOGIN
app.post("/login", async (req, res) => {
    try {
        // CHECK IF CREDENTIALS ARE MISSING
        if (!req.body.name || !req.body.passwordHash) throw new Error("Missing credentials.");
        // CHECK IF USER EXISTS AND GET USER
        const user = getUser(req.body.name);
        // CHECK IF PASSWORD MATCHES
        if (!bcrypt.compareSync(req.body.passwordHash, user.passwordHash)) {
            throw new Error(`Password is incorrect`);
        }
        // SEND SUCCES
        res.status(200).send(user);
        // CATCH AND SEND ERROR MESSAGE
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// UPLOAD
app.post("/upload", async (req, res) => {
    try {
        // VALIDATION => CHECK IF EMPTY REQUEST => IF SO ABORT
        if (!req.files || Object.keys(req.files).length === 0) {
            throw new Error(`No upload file selected`);
        }
        // CHECK IF USER EXISTS AND GET USER
        const user = getUser(req.body.author);
        // CREATE FILE
        const uploadedFile = req.files.file;
        const uploadPath = `${__dirname}/uploads/${user.name}/${uploadedFile.name}`;
        const newFile = new File(new Date(), req.body.hours, req.body.author, uploadPath, uploadedFile.name, uploadedFile.size);
        // CHECK IF FILE SIZE TO LARGE
        const MAX_FILE_SIZE = Math.pow(10, 9); // 1,000,000,000 BYTES => 1000 MB => 1 GB
        if (uploadedFile.size > MAX_FILE_SIZE) throw new Error(`File is too large. Max file size is ${MAX_FILE_SIZE}`);
        // CHECK IF FILE ALREADY EXISTS AND ADD TO USER
        user.addFile(newFile);
        // WRITE NEW FILE TO USER IN JSON
        updateUserInJSON(user);
        // UPLOAD FILE TO DATABASE
        uploadedFile.mv(uploadPath, (err) => (err ? res.status(500).send(err) : res.status(200).send({ file: newFile })));
        // CATCH AND SEND ERROR MESSAGE
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// DOWNLOAD
app.get("/download", async (req, res) => {
    try {
        // CHECK IF USER EXISTS AND GET USER
        const user = getHashedUser(req.query.userName);
        // CHECK IF FILE EXISTS AND GET FILE
        const file = user.getHashedFile(req.query.fileName);
        // INITIATE DOWNLOAD
        res.download(file.uploadPath, (err) => {
            if (err) throw new Error(err);
        });
        // CATCH AND SEND ERROR MESSAGE
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// RETURN USER UPLOADS FOR MY UPLOADS PAGE
app.get("/uploads/:user", async (req, res) => {
    try {
        // CHECK IF USER EXISTS AND GET USER
        const user = getUser(req.params["user"]);
        // CHECK IF USER HAS UPLOADS
        if (user.files.length == 0) throw new Error(`No uploads for ${user.name} found.`);
        // RETURN USER UPLOADS
        res.status(200).send(user.files);
    } catch (e) {
        // CATCH AND SEND ERROR MESSAGE
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// GET FILE (NON-HASHED URL)
app.get("/file-nh/:userName/:fileName", async (req, res) => {
    try {
        // CHECK IF USER EXISTS AND GET USER
        const user = getUser(req.params["userName"]);
        // CHECK IF FILE EXISTS AND GET FILE
        const file = user.getFile(req.params.fileName);
        // RETURN FILE
        res.status(200).send(file);
        // CATCH AND SEND ERROR MESSAGE
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// RETURN FILE FOR DOWNLOAD PAGE (HASHED URL)
app.get("/file-h/:userName/:fileName", async (req, res) => {
    try {
        // CHECK IF USER EXISTS AND GET USER
        const user = getHashedUser(req.params["userName"]);
        // CHECK IF FILE EXISTS AND GET FILE
        const file = user.getHashedFile(req.params["fileName"]);
        // RETURN FILE
        res.status(200).send(file);
        // CATCH AND SEND ERROR MESSAGE
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// DELETE
app.post("/delete", async (req, res) => {
    try {
        // CHECK IF USER EXISTS AND GET USER
        const user = getHashedUser(req.body.userName);
        // CHECK IF FILE EXISTS AND GET FILE
        const file = user.getHashedFile(req.body.fileName);
        // DELETE FILE
        fs.unlinkSync(file.uploadPath);
        user.removeFile(file.fileName);
        updateUserInJSON(user);
        res.status(200).send({ value: `ok` });
        // CATCH AND SEND ERROR MESSAGE
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// Get user
app.get("/user", async (req, res) => {
    try {
        const user = getUser(req.query.name);
        if (!user) throw new Error("User not found.");
        res.status(200).send(user);
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

// FUNCTION TO FIND AND DELETE EXPIRED FILES
function expiredFileChecker() {
    // GET USERS AND GET ALL FILES
    const users = JSON.parse(fs.readFileSync(databasePath));
    users.forEach((user) => {
        const userFiles = user.files.filter((file) => {
            if (new Date(file.expirationDate) < new Date()) {
                fs.unlinkSync(file.uploadPath);
                return false;
            } else return true;
        });
        user.files = userFiles;
    });
    fs.writeFileSync(databasePath, JSON.stringify(users));
}

// FINDS AND RETURNS USER (user class) (non-hased)
function getUser(name) {
    // GET USERS AND USEROBJECT
    const users = JSON.parse(fs.readFileSync(databasePath));
    const userObject = users.find((user) => user.name.toLowerCase() === name.toLowerCase());
    // CHECK IF USER EXISTS
    if (!userObject) {
        throw new Error(`${name} doesn't exist`);
    }
    // INITIATE AND RETURN USER
    return new User(userObject.name, userObject.passwordHash, userObject.files);
}

// FINDS AND RETURNS USER (user class) (hashed)
function getHashedUser(hashedName) {
    // GET USERS AND USEROBJECT
    const users = JSON.parse(fs.readFileSync(databasePath));
    const userObject = users.find((user) => bcrypt.compareSync(user.name, hashedName));
    // CHECK IF USER EXISTS
    if (!userObject) {
        throw new Error(`${name} doesn't exist`);
    }
    // INITIATE AND RETURN USER
    return new User(userObject.name, userObject.passwordHash, userObject.files);
}

function updateUserInJSON(user) {
    const users = JSON.parse(fs.readFileSync(databasePath));
    const index = users.findIndex((u) => u.name === user.name);
    users.splice(index, 1, user);
    fs.writeFileSync(databasePath, JSON.stringify(users));
}

// LISTEN TO PORT FOR FILE UPLOAD
app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});

// HTTPS LISTEN
// https
//   .createServer(
//     {
//       key: fs.readFileSync("/etc/letsencrypt/live/wemasu.uksouth.cloudapp.azure.com/privkey.pem"),
//       cert: fs.readFileSync("/etc/letsencrypt/live/wemasu.uksouth.cloudapp.azure.com/cert.pem"),
//     },
//     app
//   )
//   .listen(port, () => {
//     console.log(`Listening HTTPS`);
//   });

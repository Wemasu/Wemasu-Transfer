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
    // GET USERS AND TEMPUSER
    const users = JSON.parse(fs.readFileSync(databasePath));
    const tempUser = new User(req.body.name, req.body.passwordHash);
    // CHECK NAME AND PASSWORD
    const user = users.find((user) => user.name.toLowerCase() === tempUser.name.toLowerCase());
    if (!user) {
      throw new Error(`User ${tempUser.name} does not exist.`);
    }
    if (!bcrypt.compareSync(req.body.passwordHash, user.passwordHash)) {
      throw new Error(`Password is incorrect`);
    }
    // SEND SUCCES
    res.status(200).send({ success: "Login successful.", name: tempUser.name });
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

    // GET ALL USERS
    const users = JSON.parse(fs.readFileSync(databasePath));
    // GET USER THAT SENT REQUEST
    const user = users.find((user) => user.name.toLowerCase() === req.body.author.toLowerCase());
    // ASSIGN UPLOADEDFILE & UPLOADEDPATH
    const uploadedFile = req.files.file;
    const uploadPath = `${__dirname}/uploads/${user.name}/${uploadedFile.name}`;
    // CHECK IF FILE ALREADY EXISTS
    user.files.forEach((file) => {
      if (file.uploadPath === uploadPath) {
        throw new Error("File already exists");
      }
    });
    // CHECK IF FILE SIZE TO LARGE
    const MAX_FILE_SIZE = Math.pow(10, 9); // 1,000,000,000 BYTES => 1000 MB => 1 GB
    if (uploadedFile.size > MAX_FILE_SIZE) throw new Error(`File is too large. Max file size is ${MAX_FILE_SIZE}`);

    // WRITE NEW FILE TO USER IN JSON
    const newFile = new File(new Date(), req.body.hours, req.body.author, uploadPath);
    user.files.push(newFile);
    const index = users.findIndex((u) => u.name === user.name);
    users.splice(index, 1, user);
    fs.writeFileSync(databasePath, JSON.stringify(users));

    // UPLOAD FILE TO DATABASE
    uploadedFile.mv(uploadPath, (err) => (err ? res.status(500).send(err) : res.redirect(req.get("referer") + "home.html")));

    // CATCH THROWN ERRORS
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
    const users = JSON.parse(fs.readFileSync(databasePath));
    let files = [];
    users.forEach((user) => {
      user.files.forEach((file) => files.push(file));
    });

    // FIND SPECIFIC FILE
    let downloadFile;
    const searchFile = req.query.file;
    files.forEach((f) => {
      const fileName = f.uploadPath.substring(f.uploadPath.lastIndexOf("/") + 1);
      if (fileName === searchFile) {
        downloadFile = f;
      }
    });

    if (!downloadFile) {
      throw new Error(`${searchFile} doesn't exist`);
    }

    res.download(downloadFile.uploadPath, (err) => {
      if (err) throw new Error(err);
    });
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

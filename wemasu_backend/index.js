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
const { trace } = require("console");
require("dotenv").config();

// GLOBAL VARIABLES
const databasePath = __dirname + "/database.json";
const port = process.env.PORT;

// MIDDELWARE
app.use(cors({ origin: "*" }));
app.use(express.static("public"));
app.use(bodyParser.json());
// app.use(fileUpload());

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: `${__dirname}/tmp/`,
    debug: false,
    uploadTimeout: 60000,
  })
);

app.get("/", (req, res) => {
  res.status(300).redirect("/docs.html");
});

// CHECK FOR EXPIRED FILES
expiredFileChecker();

// ENABLE HOURLY CHECK
setInterval(() => {
  expiredFileChecker();
  fs.readdir(`${__dirname}/tmp/`, (err, files) => {
    if (err) console.error(err);
    else {
      files.forEach((file) => {
        fs.stat(`${__dirname}/tmp/${file}`, (err, stats) => {
          if (err) console.error(err);
          else if (new Date() - stats.birthtime > 900000) {
            fs.unlinkSync(`${__dirname}/tmp/${file}`);
            console.log(`${file} Deleted on ${new Date()} it was ${Math.floor((new Date() - stats.birthtime) / 60000)} Minutes old`);
          }
        });
      });
    }
  });
}, 30000); // 3600000 => 1hr

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
    const uploadPath = `${__dirname}/uploads/${user.name.toLowerCase()}/${uploadedFile.name}`;
    const newFile = new File(new Date(), req.body.hours, req.body.author, uploadPath, uploadedFile.name, uploadedFile.size);
    // CHECK IF FILE SIZE TO LARGE
    const MAX_FILE_SIZE = 5368709120; // 1,000,000,000 BYTES => 1000 MB => 1 GB
    if (uploadedFile.size > MAX_FILE_SIZE) throw new Error(`File is too large. Max file size is ${MAX_FILE_SIZE} Bytes`);
    // CHECK IF FILE ALREADY EXISTS AND ADD TO USER
    user.addFile(newFile);
    // UPLOAD FILE TO DATABASE
    uploadedFile.mv(uploadPath, (err) => (err ? res.status(500).send(err) : res.status(200).send({ file: newFile })));
    // WRITE NEW FILE TO USER IN JSON
    updateUserInJSON(user);
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
      if (err) {
        console.error(`\n`);
        trace(`${new Date()}, User: ${user.name}, Error: ${err.message} ${err.name}`);
        console.error(err);
      }
    });

    // CATCH AND SEND ERROR MESSAGE
  } catch (err) {
    console.error(`\n`);
    trace(`${new Date()}, Error: ${err.message} ${err.name}`);
    console.error(err);

    res.status(500).send(`Sorry something went wrong! Try again or contact Weas`);
  }
});

// RETURN USER UPLOADS FOR MY UPLOADS PAGE
app.get("/uploads/:user", async (req, res) => {
  try {
    // CHECK IF USER EXISTS AND GET USER
    const user = getUser(req.params["user"]);
    // CHECK IF USER HAS UPLOADS
    if (user.files.length == 0) throw new Error(`No uploads found for ${user.name[0].toUpperCase() + user.name.substring(1)}.`);
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

// RETURN USER FILES FILENAMES
app.get("/files/:user", async (req, res) => {
  try {
    // CHECK IF USER EXISTS AND GET USER
    const user = getUser(req.params["user"]);
    // RETURN USER UPLOADS
    const filenames = [];
    user.files.forEach((file) => {
      filenames.push(file.fileName);
    });
    res.status(200).send(filenames);
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

// FINDS AND RETURNS USER (user class) (non-hashed)
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

// CHECKS IF USER EXISTS ALREADY
function checkUser(name) {
  const users = JSON.parse(fs.readFileSync(databasePath));
  const userObject = users.find((user) => user.name.toLowerCase() === name.toLowerCase());
  if (userObject) {
    throw new Error(`${name} already exists`);
  }
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

// Register user
app.post("/register", async (req, res) => {
  try {
    // CHECK IF CREDENTIALS ARE MISSING
    if (!req.body.name || !req.body.passwordHash || !req.body.registerCode) throw new Error("Missing credentials.");
    // CHECK IF REGISTER CODE IS CORRECT
    const rCode = `Devving`;
    const registerCode = req.body.registerCode;
    if (rCode !== registerCode) throw new Error(`Wrong register code`);
    // CHECK IF USER ALREADY EXISTS
    checkUser(req.body.name);
    // CREATE NEW USER AND HASH PASSWORD
    const newUser = new User(req.body.name, bcrypt.hashSync(req.body.passwordHash, parseInt(process.env.PASSWORD_SALT)));
    // CREATE USER DIRECTORY
    fs.mkdir(`${__dirname}/uploads/${newUser.name.toLowerCase()}`, (error) => {
      if (error) {
        throw new Error(error);
      }
    });
    // ADD USER TO JSON
    addUserInJSON(newUser);
    // SEND SUCCES
    res.status(200).send(`Succesfully registered ${newUser.name}!`);
  } catch (e) {
    res.status(500).send({
      error: e.message,
      value: e.value,
    });
  }
});

// UPDATE USERS IN JSON DATABASE
function updateUserInJSON(user) {
  const users = JSON.parse(fs.readFileSync(databasePath));
  const index = users.findIndex((u) => u.name === user.name);
  users.splice(index, 1, user);
  fs.writeFileSync(databasePath, JSON.stringify(users));
}

// ADD USER IN JSON DATABASE
function addUserInJSON(user) {
  const users = JSON.parse(fs.readFileSync(databasePath));
  users.push(user);
  fs.writeFileSync(databasePath, JSON.stringify(users));
}

// CHANGE PASSWORD
app.post("/changePassword", async (req, res) => {
  try {
    // CHECK IF CREDENTIALS ARE MISSING
    if (!req.body.oldPassword || !req.body.newPassword || !req.body.repeatPassword || !req.body.user) throw new Error("Missing input.");
    // CHECK IF OLD PASSWORD IS CORRECT
    const user = getUser(req.body.user);
    if (!bcrypt.compareSync(req.body.oldPassword, user.passwordHash)) {
      throw new Error(`Old password is incorrect`);
    }
    // change user password and update in json file
    user.passwordHash = bcrypt.hashSync(req.body.newPassword);
    updateUserInJSON(user);
    // SEND SUCCES
    res.status(200).send(`succesfully changed password!`);
  } catch (e) {
    res.status(500).send({
      error: e.message,
      value: e.value,
    });
  }
});

// DELETE ACCOUNT
app.post("/deleteAccount", async (req, res) => {
  try {
    // CHECK IF CREDENTIALS ARE MISSING
    if (!req.body.password || !req.body.user) throw new Error("Missing input.");
    // CHECK IF PASSWORD IS CORRECT
    const user = getUser(req.body.user);
    if (!bcrypt.compareSync(req.body.password, user.passwordHash)) {
      throw new Error(`incorrect password`);
    }
    // DELETE EACH FILE FROM ACCOUNT
    user.files.forEach((file) => {
      fs.unlinkSync(file.uploadPath);
    });

    // DELETE USER DIRECTORY
    fs.rmdir(`${__dirname}/uploads/${user.name.toLowerCase()}`, (error) => {
      if (error) {
        throw new Error(error);
      }
    });
    // REMOVE USER FROM JSON
    const users = JSON.parse(fs.readFileSync(databasePath));
    const index = users.findIndex((u) => u.name === user.name);
    users.splice(index, 1);
    fs.writeFileSync(databasePath, JSON.stringify(users));
    // SEND SUCCES
    res.status(200).send(`Account has been deleted!`);
  } catch (e) {
    res.status(500).send({
      error: e.message,
      value: e.value,
    });
  }
});

// FREE SPACE CALC
// 20 GB space allocated for files -> 20 000 000 000
function calcFreeSpaceLeft() {
  const users = JSON.parse(fs.readFileSync(databasePath));
  let bytes = 20000000000;
  users.forEach((user) => {
    user.files.forEach((file) => {
      bytes -= file.fileSize;
    });
  });

  return bytes;
}

// Get user
app.get("/getBytesLeft", async (req, res) => {
  try {
    res.status(200).send({ bytes: calcFreeSpaceLeft() });
  } catch (e) {
    res.status(500).send({
      error: e.message,
      value: e.value,
    });
  }
});

// LISTEN TO PORT FOR FILE UPLOAD
// app.listen(port, () => {
//   console.log(`Listening on port http://localhost:${port}`);
// });

// HTTPS LISTEN
https
  .createServer(
    {
      key: fs.readFileSync("/etc/letsencrypt/live/wemasu.com-0001/privkey.pem"),
      cert: fs.readFileSync("/etc/letsencrypt/live/wemasu.com-0001/cert.pem"),
    },
    app
  )
  .listen(port, () => {
    console.log(`Listening HTTPS`);
  });

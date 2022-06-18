const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const port = process.env.PORT;

// Middleware
app.use(cors());
app.use(express.static("public"));
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.status(300).redirect("/docs.html");
});

app.put("/upload", async (req, res) => {
    try {
        console.log(req.body);
        // const FILE = req.body.formData;
        // console.log(FILE);
        // fs.writeFileSync(`./uploads/${req.body.formData}`, FILE);
        res.status(200).send("OK");
    } catch (e) {
        res.status(500).send({
            error: e.message,
            value: e.value,
        });
    }
});

app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}`);
});

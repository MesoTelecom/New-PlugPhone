var fallback = require('express-history-api-fallback')
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");

const app = express();


const porta = 5001;

var root = __dirname + '/public'


app.use(cors());
app.use("/", express.static(root));

app.use(fallback('index.html', { root: root }))



https.createServer({
    key: fs.readFileSync("/etc/letsencrypt/live/meso.plugphone.cloud/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/meso.plugphone.cloud/fullchain.pem")
}, app).listen(porta, () => {
    console.log("API server online and running in port " + porta);
});


const porta = 3333;
const express = require("express");
const cors = require("cors");
const app = express();
const https = require("https");
const fs = require("fs");
const helmet = require("helmet");
const dadosRouter = require("./routes/dados");
const proxy = require('express-http-proxy');

app.use(cors());

app.use(helmet());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", function (req, res) {
  res.json({
    funcionou: false,
    msg: "Result Off *2 ",
    dados: [],
  });
});

app.use("/dados", dadosRouter); 

app.use('/whatsapp', proxy('https://poc.plugphone.cloud:4444'));


https.createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/poc.plugphone.cloud/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/poc.plugphone.cloud/fullchain.pem")
}, app).listen(porta, () => {
  console.log("API server online and running in port " + porta);
});


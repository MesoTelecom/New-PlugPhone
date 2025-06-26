const express = require("express");
const cors = require("cors");
const app = express();
const porta = 3773;

app.use(cors());
app.use("/", express.static(__dirname + "/public"));

app.listen(porta);
console.log('API online na porta', porta)
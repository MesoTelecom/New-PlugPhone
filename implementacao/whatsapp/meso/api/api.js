const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
//const bodyparser = require("body-parser");

//const porta = 3000; // porta do teste
const porta = 3007; //porta do site prod - Na produção, temos que alterar para a porta que liberamos
const app = express();

app.use(cors());
app.use(helmet());

const dadosRouter = require("./routes/dados");

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

app.use("*", function (req, res) {
  res.json({
    funcionou: false,
    msg: "Result Off ******** ",
    dados: [],
  });
});

app.listen(porta, () => console.log("API online na porta " + porta));

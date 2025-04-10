var jwt = require("jsonwebtoken");

let secret = "1jw4l50poi@HjGdDbnhg434#9jkLgtrwX";
let expiraEm = 43200;

const geraToken = function (nome) {
  return jwt.sign({ usu: nome }, secret, {
    expiresIn: expiraEm,
  });
};

const verificaToken = function (req, res, next) {
  //console.log(req.headers["x-access-token"])
  const token = req.headers["x-access-token"];
  //console.log(token);
  if (!token) return res.status(401).end();
  jwt.verify(token, secret, (err, decoded) => {
    if (err) return res.status(401).end();
    req.usu = decoded.usu;
    next();
  });
};

module.exports = { geraToken, verificaToken };

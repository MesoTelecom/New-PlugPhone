require('dotenv').config()
const fs = require("fs");
const AsteriskManagerWrapper = require('./asterisk/AsteriskManagerWrapper');
const SocketIOWrapper = require('./socket/SocketIOWrapper');
const ExpressAppWrapper = require('./servidor/ExpressAppWrapper');
const Aplicacao = require('./Aplicacao');

// config DB
const hostDB = process.env.hostDB
const userDB = process.env.userDB
const passDB = process.env.passDB
const dbDB = process.env.dbDB

// config certificados

const keyCert = process.env.keyCert
const certCert = process.env.certCert

// config ast
const portAst = process.env.portAst
const hostAst = process.env.hostAst
const userAst = process.env.userAst
const passAst = process.env.passAst

// ṕorta https
const port = process.env.port
// https
const httpsOptions = {

    key: fs.readFileSync(keyCert),
    cert: fs.readFileSync(certCert),

    // key: fs.readFileSync("./security/code.key"),
    // cert: fs.readFileSync("./security/code.crt"),
    // key: fs.readFileSync("/etc/letsencrypt/live/liga.ipxtelecom.com.br/privkey.pem"),
    // cert: fs.readFileSync("/etc/letsencrypt/live/liga.ipxtelecom.com.br/fullchain.pem"),
};

// Create instances of wrappers
const expressAppWrapper = new ExpressAppWrapper(httpsOptions, port);
//const expressAppWrapper = new ExpressAppWrapper(null, port);

const socketWrapper = new SocketIOWrapper(expressAppWrapper.getServer());
const asteriskManagerWrapper = new AsteriskManagerWrapper(portAst, hostAst, userAst, passAst);

// Database configuration
const dbConfig = {
    host: hostDB,
    user: userDB,
    password: passDB,
    database: dbDB,
};

// Initialize the example usage
const aplicacao = new Aplicacao(expressAppWrapper, socketWrapper, asteriskManagerWrapper, dbConfig, port);
aplicacao.initialize();

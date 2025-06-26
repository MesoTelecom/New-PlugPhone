const ExpressController = require('./servidor/ExpressController');
const SocketController = require('./socket/SocketController');
//const AsteriskController = require('./asterisk/AsteriskController');
const MySQLDatabase = require('./banco/MySQLDatabase');

class Aplicacao {
  constructor(expressAppWrapper, socketWrapper, asteriskManagerWrapper,dbConfig, port) {
    this.database = new MySQLDatabase(dbConfig);
    //this.asteriskController = new AsteriskController(asteriskManagerWrapper, this.database);
    this.socketController = new SocketController(socketWrapper, asteriskManagerWrapper , this.database);
    this.expressController = new ExpressController(expressAppWrapper, port,this.socketController);
    
  }

  initialize() {
    this.expressController.initializeRoutes();
    this.socketController.initializeSocketEvents();
    //this.asteriskController.initializeAsteriskEvents();
    this.database.query('SELECT 1 + 1 AS solution')
      .then((results) => {
        console.log('DB is ON: ', results[0].solution);
      })
      .catch((err) => {
        console.error('Error DB:', err.message);
      });
  }
}

module.exports = Aplicacao;


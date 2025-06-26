const { socketConnection } = require('./SocketConnection');
const helmet = require('helmet');

let testConnect = function(app) {
  // Configurar o Helmet
  app.use(helmet());

  const io = require('socket.io')(
    app, {
      cors: {
        origin: "*", // Permitir qualquer origem
      }
    }
  );
  
  socketConnection(io);
}

module.exports = { testConnect };

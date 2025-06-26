const { Server } = require('socket.io');

class SocketIOWrapper {
  constructor(server) {
    this.io = new Server(server);
    this.clients = new Map();
  }

  on(event, callback) {
    this.io.on(event, callback);
  }

  onClient(event, callback) {
    this.io.on('connection', (socket) => {
      console.log('conectou')
      this.clients.set(socket.id, socket);
      socket.on(event, callback);

      socket.on('disconnect', () => {
        console.log('desconectou')
        this.clients.delete(socket.id);
      });
    });
  }

  emitToClient(clientId, event, data) {
    const client = this.clients.get(clientId);
    if (client) {
      client.emit(event, data);
    } else {
      console.error('Client not found:', clientId);
    }
  }

  broadcast(event, data) {
    this.io.emit(event, data);
  }
}

module.exports = SocketIOWrapper;

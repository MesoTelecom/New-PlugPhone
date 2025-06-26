const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Rota para servir o arquivo HTML
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Evento de conexão do Socket.IO
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Evento de recebimento de mensagem
  socket.on('chat message', (msg) => {
    console.log('Mensagem recebida: ' + msg);

    // Broadcast da mensagem para todos os clientes conectados
    io.emit('chat message', msg);
  });

  // Evento de desconexão do cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Inicializando o servidor na porta 3000
server.listen(3001, () => {
  console.log('Servidor escutando na porta 3001');
});

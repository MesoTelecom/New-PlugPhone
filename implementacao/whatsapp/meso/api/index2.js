const express = require('express');
const proxy = require('express-http-proxy');

const app = express();

app.use('/', proxy('https://poc.plugphone.cloud:3993')); // Substitua pelo endereço desejado

app.listen(3000, () => {
  console.log('Proxy server listening on port 3000');
});
const express = require('express');

class UserRoutes {
  constructor() {
    this.router = express.Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.get('/users', this.getUsers);
    this.router.post('/users', this.createUser);
    // Adicione outras rotas aqui
  }

  getUsers(req, res) {
    res.send('List of users');
  }

  createUser(req, res) {
    res.send('User created');
  }
}

module.exports = UserRoutes;

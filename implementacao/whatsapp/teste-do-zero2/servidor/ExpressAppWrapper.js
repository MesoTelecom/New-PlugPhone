const express = require('express');
const http = require('https');
//const fs = require("fs");

class ExpressAppWrapper {
    constructor(opt) {
        this.app = express();
        this.server = http.createServer(opt, this.app);
    }

    use(middleware) {
        this.app.use(middleware);
    }

    get(route, handler) {
        this.app.get(route, handler);
    }

    post(route, handler) {
        this.app.post(route, handler);
    }

    put(route, handler) {
        this.app.put(route, handler);
    }

    delete(route, handler) {
        this.app.delete(route, handler);
    }

    addRoutes(router) {
        this.app.use(router);
    }

    listen(port, callback) {
        this.server.listen(port, callback);
    }

    getServer() {
        return this.server;
    }
}

module.exports = ExpressAppWrapper;

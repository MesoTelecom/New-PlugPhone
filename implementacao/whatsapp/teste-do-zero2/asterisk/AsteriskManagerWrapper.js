const AsteriskManager = require('asterisk-manager');

class AsteriskManagerWrapper {
  constructor(port, host, username, password) {
    this.ami = new AsteriskManager(port, host, username, password, true);
  //  this.ami.keepConnected();
  }

  on(event, callback) {
    this.ami.on(event, callback);
  }

  action(action, callback) {
    this.ami.action(action, callback);
  }
}

module.exports = AsteriskManagerWrapper;

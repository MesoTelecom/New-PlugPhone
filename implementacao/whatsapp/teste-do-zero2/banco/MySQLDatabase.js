const mysql = require('mysql2');

class MySQLDatabase {
  constructor(config) {
    this.pool = mysql.createPool(config);
    this.pool.on('connection', () => {
      console.log('Connected to MySQL database');
    });
  }

  query(sql, params) {
    return new Promise((resolve, reject) => {
      this.pool.execute(sql, params, (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      this.pool.end((err) => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  }
}

module.exports = MySQLDatabase;

const mysql = require("mysql2/promise");
require("dotenv").config()


let hostServer = process.env.HOST_SERVER
let userServer = process.env.USER_SERVER
let databaseServer = process.env.DATABASE_SERVER
let passwordServer = process.env.PASSWORD_SERVER


console.log(
  
hostServer ,
userServer ,
databaseServer ,
passwordServer ,

)


const pool = mysql.createPool({
  host: hostServer,
  user: userServer,
  database: databaseServer,
  password: passwordServer,
  dateStrings: true,
  waitForConnections: true,
 
});

async function executaQryServer(qry) {
  let resposta;
  let connection = await pool.getConnection();
  try {
    // let [rows, fields] = await connection.execute(qry);
    let [rows, fields] = await connection.execute(qry);
   // console.log('rrr',rows);

    resposta = { dados: rows, msg: "" };
  } catch (e) {
    resposta = { dados: null, msg: "erro" };
    console.log(e.message);
  } finally {
    connection.release();
  }

  return resposta;
}

module.exports = { executaQryServer };

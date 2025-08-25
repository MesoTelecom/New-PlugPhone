const mysql = require("mysql2/promise");

//Na produção, alterar para a senha do banco da máquina correspondente
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: "call_center",
  password: "Mtes0206",
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
});

async function executaQry3(qry) {
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

module.exports = { executaQry3 };

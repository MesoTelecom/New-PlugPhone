const mysql = require('mysql2/promise');

// create the connection to database
const con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Mtes0206",
  database: "asterisk",

});
/*
function pegarLogin(){
    let client = await con.getConnection();
  
    try {
      let qry = `
          select *
          from AgentLogin
          where  uniqueid = ${evt.uniqueid}
          
        `;
      //console.log(qry);
      let result = await client.execute(qry);
      //console.log(result);
      return {
        funcionou: true,
        msg: null,
        dados: result,
      };
    } catch (e) {
      return {
        funcionou: false,
        msg: "erro na query pegarLogin",
        dados: null,
      };
    } finally {
      client.release();
    }

    
}*/
async function executaQry1(qry) {
  //let resposta;
  let connection = await con.getConnection();
  try {


    // let [rows, fields] = await connection.execute(qry);
    let res = await connection.execute(qry);


    // resposta = { dados: res, msg: "" };
  } catch (e) {
    // resposta = { dados: null, msg: "erro" };
    console.log(e.message);
  } finally {
    connection.release();
  }

  // return resposta;
}


module.exports = {
  executaQry1
}
/*

const pegarAgentLogin = async function (id) {
    let client = await con.getConnection();

    try {
      let qry = `
          select *
          from AgentLogin
          where  uniqueid = ${id}

        `;
      //console.log(qry);
      let result = await client.execute(qry);
      //console.log(result);
      return {
        funcionou: true,
        msg: null,
        dados: result,
      };
    } catch (e) {
      return {
        funcionou: false,
        msg: "erro na query pegarCaso",
        dados: null,
      };
    } finally {
      client.release();
    }
  };
*/
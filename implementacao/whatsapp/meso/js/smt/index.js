const { exec } = require('child_process');
const fs = require('fs');
let { executaQry } = require('./db');
let { executaQry2 } = require('./db2');
const { CronJob } = require('cron');

function executa() {
  let qry = "SET GLOBAL max_prepared_stmt_count = 1048576;";
  console.log('O Matheus é ...');
  executaQry2(qry);
  console.log('executado');
}

// Roda todo domingo à meia-noite (00:00)
const job1 = new CronJob(
  '0 0 0 * * 0', // minuto 0, hora 0, qualquer dia, qualquer mês, dia da semana 0 (domingo)
  async function () {
    executa();
  },
  null,
  true,
  'America/Sao_Paulo'
);

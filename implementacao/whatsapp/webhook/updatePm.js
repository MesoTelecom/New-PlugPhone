const fs = require('fs');
const csv = require('csv-parser');
const mysql = require('mysql');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'Mtes0206',
  database: 'excelInserir'
};

const connection = mysql.createConnection(dbConfig);

function updateDataInMySQL(data) {
  const query = 'UPDATE dadosCsv SET Telefone = ? WHERE Nome = ?';

  connection.query(query, [data.Nome,data.Telefone], (error, results, fields) => {
    if (error) throw error;
    console.log(`Dados atualizados com sucesso para ${data.Telefone}`);
  });
}

const arquivoCSV = 'pm.csv';

fs.createReadStream(arquivoCSV)
  .pipe(csv())
  .on('data', (row) => {
    try {
      const linha = { Nome, Telefone } = row;
      if (!linha.Nome || !linha.Telefone) {
        throw new Error('Dados ausentes nas colunas nome ou telefone.');
      }
      updateDataInMySQL(linha);
    } catch (error) {
      console.error('Erro ao processar linha:', error.message);
    }
  })
  .on('end', () => {
    console.log('Processamento concluído.');
    connection.end();
  })
  .on('error', (error) => {
    console.error('Erro durante a leitura do arquivo CSV:', error.message);
  });
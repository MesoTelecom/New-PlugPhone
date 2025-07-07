// Importa os módulos necessários
const { Sequelize, QueryTypes } = require('sequelize');
const cron = require('node-cron');

// Configuração do Sequelize para conexão com o banco de dados
const sequelize = new Sequelize('asteriskcdrdb', 'root', 'Mtes0206', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false // Desativa logs para evitar poluição no console
});

// Função para obter o primeiro dia de um mês
function getPrimeiroDiaMes(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}

// Função para obter o último dia de um mês
function getUltimoDiaMes(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

// Função para calcular o período de três meses atrás
function definirPeriodoTresMesesAtras() {
    const dataAtual = new Date();
    const tresMesesAtras = new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 3, 1);

    // Define os valores de primeiroDiaMes e ultimoDiaMes
    const primeiroDiaMes = getPrimeiroDiaMes(tresMesesAtras).toISOString().split('T')[0];
    const ultimoDiaMes = getUltimoDiaMes(tresMesesAtras).toISOString().split('T')[0];

    // Retorna os valores calculados
    return { primeiroDiaMes, ultimoDiaMes };
}

// Variáveis globais para armazenar o período
let primeiroDiaMes, ultimoDiaMes;

// Função para atualizar o período de três meses atrás
function atualizarPeriodoTresMesesAtras() {
    const periodo = definirPeriodoTresMesesAtras();
    primeiroDiaMes = periodo.primeiroDiaMes;
    ultimoDiaMes = periodo.ultimoDiaMes;
}

// Redefine o período antes de iniciar os processos
atualizarPeriodoTresMesesAtras();

// Agendamento do cron job para o primeiro dia de cada mês, à meia-noite
cron.schedule('0 0 1 * *', async () => {
    await inicia();
});

// Função principal para coordenar o cron job
async function inicia() {
    const dataCompleta = new Date().toLocaleString();
    console.log(`[${dataCompleta}] Iniciando os processos`);

    // Redefine o período de três meses antes de iniciar os processos
    atualizarPeriodoTresMesesAtras();

    try {
        await executarProcessos();
        console.log(`[${dataCompleta}] Processos concluídos com sucesso!`);
    } catch (error) {
        console.error(`[${dataCompleta}] Erro durante a execução do cron job:`, error);
    }
}

// Função principal para coordenar o backup e a deleção de dados
async function executarProcessos() {
    try {
        await copiarDadosTresMesesAtras();
        await deletarDadosTresMesesAtras();
    } catch (error) {
        console.error('Erro durante os processos:', error);
        throw error;
    } finally {
        // Fecha a conexão com o banco de dados
        await sequelize.close();
    }
}

// Função para copiar os dados do banco de três meses atrás para a tabela de backup
async function copiarDadosTresMesesAtras() {
    const query = `
        INSERT INTO meu_teste_bkp
        SELECT *
        FROM meu_teste
        WHERE DATE(datahora) BETWEEN '${primeiroDiaMes}' AND '${ultimoDiaMes}';
    `;

    try {
        await sequelize.query(query, { type: QueryTypes.INSERT });
        console.log(`[${new Date().toLocaleString()}] Dados copiados com sucesso! ${query}`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erro ao copiar dados:`, error);
        throw error;
    }
}

// Função para deletar os dados do banco referentes a três meses atrás
async function deletarDadosTresMesesAtras() {
    const query = `
        DELETE FROM meu_teste
        WHERE DATE(datahora) BETWEEN '${primeiroDiaMes}' AND '${ultimoDiaMes}';
    `;

    try {
        await sequelize.query(query, { type: QueryTypes.DELETE });
        console.log(`[${new Date().toLocaleString()}] Dados deletados com sucesso! ${query}`);
    } catch (error) {
        console.error(`[${new Date().toLocaleString()}] Erro ao deletar dados:`, error);
        throw error;
    }
}

// Inicia o processo imediatamente ao carregar o script
inicia();

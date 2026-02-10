require('./src/config/env');
require('./src/config/database');

console.log('🚀 Iniciando PlugPhone AMI Collector');

const ami = require('./src/config/ami');
const registerEvents = require('./src/ami/registerEvents');

// Banco só é inicializado ao importar
require('./database/mysql');

registerEvents(ami);

process.on('uncaughtException', (err) => {
    console.error('❌ Erro não tratado:', err);
});

process.on('unhandledRejection', (reason) => {
    console.error('❌ Promise rejeitada:', reason);
});

const Ami = require('asterisk-manager');

const ami = new Ami(
    process.env.AMI_PORT,
    process.env.AMI_HOST,
    process.env.AMI_USER,
    process.env.AMI_PASS,
    true
);

ami.keepConnected();

ami.on('connect', () => {
    console.log('✅ Conectado ao Asterisk AMI');
});

ami.on('disconnect', () => {
    console.warn('⚠️ AMI desconectado, tentando reconectar...');
});

ami.on('error', (err) => {
    console.error('❌ Erro no AMI:', err.message);
});

module.exports = ami;

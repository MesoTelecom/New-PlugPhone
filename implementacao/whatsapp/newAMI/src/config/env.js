const dotenv = require('dotenv');

dotenv.config();

const required = [
    'AMI_HOST',
    'AMI_PORT',
    'AMI_USER',
    'AMI_PASS'
];

required.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ Variável de ambiente ausente: ${key}`);
        process.exit(1);
    }
});

module.exports = process.env;

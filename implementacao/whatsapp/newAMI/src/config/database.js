const required = [
    'DB_HOST',
    'DB_USER',
    'DB_PASS',
    'DB_NAME'
];

required.forEach((key) => {
    if (!process.env[key]) {
        console.error(`❌ Variável de banco ausente: ${key}`);
        process.exit(1);
    }
});

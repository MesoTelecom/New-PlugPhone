require("dotenv").config({
    path: require("path").join(__dirname, "..", ".env")
});

// IMPORTAÇÃO CERTA PARA O SDK 4.28.4
const OpenAI = require("openai").default;

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

module.exports = client;

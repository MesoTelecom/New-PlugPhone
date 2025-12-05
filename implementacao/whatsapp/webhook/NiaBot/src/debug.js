const client = require("./openaiClient");
const pkg = require("../node_modules/openai/package.json");

console.log("🔥 Versão carregada do OpenAI:", pkg.version);
console.log("💥 Tem vectorStores?", client.vectorStores);
console.log("💥 Tem assistants?", client.assistants);

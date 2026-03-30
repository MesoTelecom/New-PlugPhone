const { Ollama } = require("ollama");

module.exports = new Ollama({
    host: "http://127.0.0.1:11434"
});

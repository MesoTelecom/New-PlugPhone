const ollamaEmbed = require("../config/ollama_local");

async function embedText(text) {
    const res = await ollamaEmbed.embeddings({
        model: "nomic-embed-text",
        prompt: text
    });

    return res.embedding;
}

module.exports = {
    embedText
};

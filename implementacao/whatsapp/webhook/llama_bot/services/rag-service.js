const { embedText } = require("./embedder");
const { searchQdrant } = require("./qdrant-service");

async function buscarConhecimento(question) {
    const embedding = await embedText(question);

    const textos = await searchQdrant(embedding, 5);

    return textos.join("\n\n");
}

module.exports = {
    buscarConhecimento
};


const SYSTEM_PROMPT = require("../prompts/nia-system");
const { buscarConhecimento } = require("./rag-service");
const PALAVRAO_PROMT = require("../prompts/nia-palavrao");
const ollama = require("../config/ollama_cloud")
const {
    salvarMensagem,
    buscarHistorico
} = require("./history-service");

async function sendToNia({ messageUser, threadId, ollama }) {
    console.log("Olha aqui chamou?")
    const historico = await buscarHistorico(threadId, 10);

    // 1. Busca conhecimento técnico no Llama Cloud
    const contextoTecnico = await buscarConhecimento(messageUser);


    // console.log("Olha o contexto dessa merda", contextoTecnico)

    // 2. Injeta o conhecimento no prompt
    const messages = [
        {
            role: "system",
            content: `${SYSTEM_PROMPT}\n\nUSE ESTE CONHECIMENTO TÉCNICO SE NECESSÁRIO:\n${contextoTecnico}`
        },
        ...historico.map(m => ({
            role: m.role,
            content: m.content
        })),
        { role: "user", content: messageUser }
    ];

    // 3. Chama o seu modelo local (Ollama)
    const response = await ollama.chat({
        model: "gpt-oss:120b",
        format: "json",
        messages
    });

    const json = JSON.parse(response.message.content);

    await salvarMensagem(threadId, messageUser, "user");
    await salvarMensagem(threadId, json.resposta, "assistant");

    return json.resposta;
}

async function sendToPalavrao({ messageUser }) {
    const messages = [
        { role: "system", content: PALAVRAO_PROMT },
        { role: "user", content: messageUser },
    ];

    const response = await ollama.chat({
        model: "gpt-oss:120b",
        format: "json",
        think: "medium",
        messages
    });

    const json = JSON.parse(response.message.content);

    return json.resposta;
}

module.exports = {
    sendToNia,
    sendToPalavrao
};

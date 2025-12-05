// src/plugBot.js
const { sendToNia } = require("./niaService");

// você pode reaproveitar seus marcadores aqui:
const marcadoresConcluido = [
    "já fiz", "ja fiz", "já enviei", "enviei", "já coloquei",
    "já estão", "já esta", "já está", "fiz sim", "feito", "pronto",
    "sim fiz", "já resolvi"
];

const encerramento = [
    "acho que é só isso", "acredito que seja só isso", "resolvido",
    "beleza", "ok", "tudo certo", "valeu", "obrigado", "obg",
    "tmj", "fechou", "show", "é só"
];

function clienteEncerrar(msg) {
    const lower = msg.toLowerCase();
    return encerramento.some(f => lower.includes(f));
}

async function plugBot(message, session = {}) {
    console.log("[PlugBot-NIA] Mensagem recebida:", message);

    if (clienteEncerrar(message)) {
        return {
            reply: "Perfeito! Qualquer coisa estou por aqui. 😊",
            session,
        };
    }

    // Aqui o session pode armazenar o threadId em vez de history
    const threadId = session.threadId || null;

    const result = await sendToNia({ message, threadId });

    return {
        reply: result.reply,
        session: { threadId: result.threadId },
    };
}

module.exports = { plugBot };

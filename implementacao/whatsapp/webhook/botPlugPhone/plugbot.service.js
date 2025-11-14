require("dotenv").config();
const { buscaExp } = require("../methods");
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// 🧠 EXPRESSÕES QUE INDICAM QUE O CLIENTE JÁ FEZ ALGO
const marcadoresConcluido = [
    "já fiz", "ja fiz", "já enviei", "enviei", "já coloquei",
    "já estão", "já esta", "já está", "fiz sim", "feito", "pronto",
    "sim fiz", "já resolvi"
];

// 🧯 EXPRESSÕES QUE INDICAM ENCERRAMENTO NATURAL
const encerramento = [
    "acho que é só isso", "acredito que seja só isso", "resolvido",
    "beleza", "ok", "tudo certo", "valeu", "obrigado", "obg",
    "tmj", "fechou", "show", "é só"
];

function clienteConcluiu(msg) {
    const lower = msg.toLowerCase();
    return marcadoresConcluido.some(f => lower.includes(f));
}

function clienteEncerrar(msg) {
    const lower = msg.toLowerCase();
    return encerramento.some(f => lower.includes(f));
}

async function plugBot(message, session = {}) {
    console.log("[PlugBot] Mensagem recebida:", message);

    if (clienteEncerrar(message)) {
        return {
            reply: "Perfeito! Qualquer coisa estou por aqui. 😊",
            session
        };
    }

    // 🔎 BUSCA EXPERIÊNCIA NO BANCO
    const experienciaTexto = await buscaExp(message);

    let contextoExperiencia = "";
    let regraExperiencia = "";

    if (experienciaTexto && experienciaTexto.length > 0) {

        contextoExperiencia = `
Base de conhecimento (experiência correspondente):
${experienciaTexto}
`;

        regraExperiencia = `
MODO EXPERIÊNCIA ATIVA — SIGA SOMENTE ESTA REGRA:

1) Leia a mensagem MAIS RECENTE do cliente.
2) Identifique o que ele JÁ FEZ e pule imediatamente essas etapas.
3) Se o cliente disser "já fiz", "já enviei", "já coloquei", "já estão", "pronto", etc:
   - NÃO repita o mesmo passo.
   - NÃO pergunte de novo.
   - RECONHEÇA que o passo está concluído e SIGA ADIANTE.
4) A resposta deve ser baseada SOMENTE no conteúdo da experiência,
   mas REESCRITA de forma natural, curta e humana.
5) NÃO invente novas etapas.
6) Se todos os passos da experiência já foram cumpridos,
   responda: "Perfeito, como todas as etapas já foram concluídas, vou analisar internamente."
7) Não use linguagem robótica. Não reinicie o fluxo.
`;
    }

    const systemPrompt = `
Você é a Nia, assistente virtual técnica do PlugPhone.

${contextoExperiencia}
${regraExperiencia}

REGRAS GERAIS (somente se NÃO houver experiência correspondente):
- Não repita perguntas que o cliente já respondeu.
- Não seja robótica.
- Seja objetiva, humana e educada.
- Pergunte somente se necessário:
   1) Plataforma (Web, App, IP)
   2) Qual erro aparece.
- Seu tom é calmo, direto e empático.

IMPORTANTE:
- Sempre responda baseado APENAS na última mensagem do cliente.
- Se o cliente disser que já fez algo → pule esse passo.
- Nunca repita a mesma coisa três vezes como um loop.
`;

    // 🔥 HISTÓRICO curto para não bagunçar a cabeça da modelo
    const messages = [
        { role: "system", content: systemPrompt },
        ...(session.history || []),
        { role: "user", content: message }
    ];

    console.log("[PlugBot] Chamando OpenAI…");

    const response = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages
    });

    const reply = response.choices[0].message.content;
    console.log("[PlugBot] Resposta:", reply);

    return {
        reply,
        session: { history: messages.slice(-10) }
    };
}

module.exports = { plugBot };

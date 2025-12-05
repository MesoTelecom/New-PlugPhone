require("dotenv").config({ path: "../.env" });
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function listFiles() {
    const vectorStoreId = process.env.NIA_VECTOR_STORE_ID;

    console.log("🧠 Vector Store ID:", vectorStoreId);
    console.log("📡 Buscando arquivos indexados...\n");

    const list = await client.beta.vectorStores.files.list(vectorStoreId);

    if (!list.data.length) {
        console.log("⚠️ Nenhum arquivo encontrado no Vector Store.");
        return;
    }

    console.log(`📄 Encontrados ${list.data.length} arquivos:\n`);

    for (const entry of list.data) {
        const fileId = entry.id;

        // Recupera informações reais do arquivo
        const fullFile = await client.files.retrieve(fileId);

        console.log(`🗂️ Nome: ${fullFile.filename}`);
        console.log(`📌 File ID: ${fileId}`);
        console.log(`📏 Tamanho: ${fullFile.bytes} bytes`);
        console.log(`📅 Criado: ${new Date(fullFile.created_at * 1000).toLocaleString()}`);
        console.log(`⏳ Status: ${entry.status}`);
        console.log("---");
    }
}

listFiles().catch(console.error);

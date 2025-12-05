require("dotenv").config({ path: "../.env" });
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

async function uploadAll() {
    const vectorStoreId = process.env.NIA_VECTOR_STORE_ID;
    const docsPath = path.join(__dirname, "../docs");

    console.log("📁 Pasta dos documentos:", docsPath);

    const files = fs.readdirSync(docsPath);

    if (!files.length) {
        console.log("⚠️ Nenhum arquivo encontrado em /docs");
        return;
    }

    console.log(`📄 Encontrado(s) ${files.length} arquivo(s):`);
    files.forEach(f => console.log(" -", f));

    const uploadedFiles = [];

    for (const fileName of files) {
        const filePath = path.join(docsPath, fileName);

        console.log(`\n⏳ Enviando arquivo: ${fileName}`);

        const file = await client.files.create({
            file: fs.createReadStream(filePath),
            purpose: "assistants",
        });

        uploadedFiles.push(file.id);

        console.log(`✔️ Upload concluído → File ID: ${file.id}`);
    }

    // 🔥 AQUI É O COMANDO CORRETO PARA INDEXAR
    console.log("\n📡 Indexando todos arquivos no Vector Store...");

    const batch = await client.beta.vectorStores.fileBatches.createAndPoll(
        vectorStoreId,
        {
            file_ids: uploadedFiles,
        }
    );

    console.log("🎉 TODOS ARQUIVOS INDEXADOS COM SUCESSO!");
    console.log(batch.status);
}

uploadAll().catch(console.error);

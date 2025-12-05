const client = require("./openaiClient");

console.log("🚀 Iniciando script de deleção...");

// IDs que devem ser deletados
const arquivosParaDeletar = [
    "file-AVjhdBErBPX4ooYASLsX1m",
    "file-GqQezPmteqfczf8iqoF7rC",

    "file-8Z7qSKU31cvLQP3pC4SLEW",
    "file-XE4gi2cZTjzZcuz3XpnSD6",

    "file-K8bS8ts92ZFmerYb3wMk5b",
    "file-VbJKwgkXWiPwnQPRHgQoHt",
    "file-QhUF3YL2HtTnWNWYx1AYLT"
];

(async () => {
    console.log("📌 Começando deleção...");

    for (const fileId of arquivosParaDeletar) {
        console.log(`🧹 Tentando deletar: ${fileId}`);

        try {
            const result = await client.files.del(fileId);
            console.log("✔️ Sucesso:", result);
        } catch (err) {
            console.log("❌ Erro:", err.response?.data || err);
        }
    }

    console.log("🏁 Finalizado.");
})();

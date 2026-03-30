async function buscarNoManual(pergunta) {
    try {
        if (!pergunta) return "";

        const PIPELINE_ID = "9a2b090a-6b6a-4ae7-80a3-8dcfa94c6b83";
        const url = `https://api.cloud.llamaindex.ai/api/v1/pipelines/${PIPELINE_ID}/retrieve`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'Authorization': `Bearer llx-gBl1JWA0Uv8MGOHf3cY4kj5VfvtF2YMR7aYgcmb1f9WoQYxP`
            },
            body: JSON.stringify({
                query: pergunta,
                // Remova o retrieval_mode: "chunks" se não estiver funcionando, 
                // deixe a API decidir o padrão primeiro.
            }),
        });

        const data = await response.json();

        // Log para depuração real
        console.log("Total de nodes retornados:", data.retrieval_nodes?.length || 0);

        if (!data.retrieval_nodes || data.retrieval_nodes.length === 0) {
            return "Nenhum dado encontrado no índice.";
        }

        // Reduza o score para teste
        const MIN_SCORE = 0.4;

        const textos = data.retrieval_nodes
            .filter(item => {
                console.log(`Node Score: ${item.score}`); // Verifique os scores no terminal
                return item.score >= MIN_SCORE;
            })
            .map(item => item.node?.text || item.text) // Tenta pegar de 'node.text' ou 'text'
            .filter(Boolean);

        return textos.join("\n\n").trim();

    } catch (error) {
        console.error("Erro:", error);
        return "";
    }
}
module.exports = {
    buscarNoManual
};
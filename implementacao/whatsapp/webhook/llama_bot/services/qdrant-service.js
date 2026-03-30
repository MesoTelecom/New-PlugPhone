const { QdrantClient } = require("@qdrant/js-client-rest");

const qdrant = new QdrantClient({
    url: "https://60e307af-4f0d-4fd4-a9da-cc6f76009fe6.sa-east-1-0.aws.cloud.qdrant.io:6333",
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.OGivU_1Glm2kEDHmiKVrdJZx0tVXwJc4L9dSdafSkRQ',
});

async function searchQdrant(embedding, limit = 5) {
    const result = await qdrant.search("docs_meso_2026_01_13", {
        vector: {
            name: "default",
            vector: embedding
        },
        limit: limit
    });
    return result.map(r => r.payload?.text).filter(Boolean);
}

module.exports = {
    searchQdrant
};
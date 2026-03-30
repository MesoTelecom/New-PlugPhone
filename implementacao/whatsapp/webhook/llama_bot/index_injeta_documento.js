require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const mammoth = require("mammoth");
const pdf = require("pdf-parse");
const { QdrantClient } = require("@qdrant/js-client-rest");
const { embedText } = require("./services/embedder");

const DOCUMENTS_PATH = path.resolve(__dirname, "./documentos");

const qdrant = new QdrantClient({
    url: "https://60e307af-4f0d-4fd4-a9da-cc6f76009fe6.sa-east-1-0.aws.cloud.qdrant.io:6333",
    apiKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.OGivU_1Glm2kEDHmiKVrdJZx0tVXwJc4L9dSdafSkRQ",
});

function chunkText(text, size = 800) {
    const chunks = [];
    for (let i = 0; i < text.length; i += size) {
        chunks.push(text.slice(i, i + size));
    }
    return chunks;
}

async function readFile(filePath) {
    const ext = path.extname(filePath);

    if (ext === ".txt") {
        return fs.readFileSync(filePath, "utf8");
    }

    if (ext === ".docx") {
        const res = await mammoth.extractRawText({ path: filePath });
        return res.value;
    }

    if (ext === ".pdf") {
        const data = await pdf(fs.readFileSync(filePath));
        return data.text;
    }

    return null;
}

async function ingest() {
    const files = fs.readdirSync(DOCUMENTS_PATH);

    for (const file of files) {
        const filePath = path.join(DOCUMENTS_PATH, file);
        const text = await readFile(filePath);

        if (!text) continue;

        const chunks = chunkText(text);

        for (const chunk of chunks) {
            const embedding = await embedText(chunk);

            await qdrant.upsert("docs_meso_2026_01_13", {
                wait: true,
                points: [
                    {
                        id: uuidv4(),
                        vector: {
                            default: embedding
                        },
                        payload: {
                            text,
                            source: file
                        }
                    }
                ]
            });
        }

        console.log(`✔ Indexado: ${file}`);
    }
}

ingest();

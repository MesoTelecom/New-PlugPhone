require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const express = require("express");
const bodyParser = require("body-parser");
const { sendToNia } = require("./niaService");   // <-- IMPORTAÇÃO CERTA

const app = express();
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("NIA is running");
});

app.post("/nia", async (req, res) => {
    console.log("[PlugBot-NIA] Requisição recebida");
    try {
        const { message, threadId } = req.body;

        console.log("[PlugBot-NIA] Mensagem recebida:", message);

        const result = await sendToNia({ message, threadId });

        return res.json({
            reply: result.reply,
            threadId: result.threadId
        });

    } catch (err) {
        console.error("Erro na NIA:", err);
        return res.status(500).json({ error: "Erro interno na NIA" });
    }
});

const PORT = 32025;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`NIA rodando em http://meso.plugphone.cloud:${PORT}/nia`);
});

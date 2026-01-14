require("dotenv").config();
const client = require("./openaiClient");

const ASSISTANT_ID = process.env.NIA_ASSISTANT_ID;

async function teste() {
    console.log("Testando assistant:", ASSISTANT_ID);

    // 1. Criar thread
    const thread = await client.beta.threads.create();
    console.log("Thread criada:", thread.id);

    // 2. Mandar uma mensagem
    await client.beta.threads.messages.create(thread.id, {
        role: "user",
        content: "Oi NIA, você tá viva?",
    });

    // 3. Criar run
    let run = await client.beta.threads.runs.create(thread.id, {
        assistant_id: ASSISTANT_ID,
    });

    // 4. Aguardar a resposta
    while (true) {
        run = await client.beta.threads.runs.retrieve(thread.id, run.id);
        console.log("STATUS:", run.status);

        if (run.status === "completed") break;
        if (run.status === "failed") {
            console.log("💀 RUN FALHOU:", run.last_error);
            return;
        }

        await new Promise((r) => setTimeout(r, 800));
    }

    // 5. Mostrar resposta
    const msgs = await client.beta.threads.messages.list(thread.id, {
        order: "desc",
        limit: 3,
    });

    console.log("==== RESPOSTA DA NIA ====");
    console.log(JSON.stringify(msgs.data[0].content, null, 2));
}

teste();

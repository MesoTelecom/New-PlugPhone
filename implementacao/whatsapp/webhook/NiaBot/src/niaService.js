// src/niaService.js
const client = require("./openaiClient");
const ASSISTANT_ID = process.env.NIA_ASSISTANT_ID;

async function sendToNia({ message, threadId }) {
    let thread_id = threadId;

    // 1. Criar thread se não existir
    if (!thread_id) {
        const thread = await client.beta.threads.create();
        thread_id = thread.id;
    }

    // 2. Adicionar mensagem
    await client.beta.threads.messages.create(thread_id, {
        role: "user",
        content: message,
    });

    // 3. Criar run
    let run = await client.beta.threads.runs.create(thread_id, {
        assistant_id: ASSISTANT_ID,
    });

    // 4. Loop principal
    while (true) {
        run = await client.beta.threads.runs.retrieve(thread_id, run.id);

        // RUN CONCLUÍDO
        if (run.status === "completed") break;

        // ASSISTENTE PEDIU UMA ACTION
        if (run.status === "requires_action") {
            const toolCalls = run.required_action.submit_tool_outputs.tool_calls;

            const outputs = toolCalls.map((tool) => ({
                tool_call_id: tool.id,
                output: "OK", // sempre OK — o assistant executa o file_search sozinho
            }));

            await client.beta.threads.runs.submitToolOutputs(
                thread_id,
                run.id,
                { tool_outputs: outputs }
            );

            continue;
        }

        // ERRO
        if (run.status === "failed") {
            return {
                reply: "Não consegui processar essa solicitação no momento.",
                threadId: thread_id,
            };
        }

        await new Promise((r) => setTimeout(r, 800));
    }

    // 5. Capturar resposta final
    const messages = await client.beta.threads.messages.list(thread_id, {
        order: "desc",
        limit: 1,
    });

    const last = messages.data[0];
    const reply = last.content
        .map((c) => (c.type === "text" ? c.text.value : ""))
        .join("\n");

    return { reply, threadId: thread_id };
}

module.exports = { sendToNia };

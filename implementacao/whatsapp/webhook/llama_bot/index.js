require("dotenv").config();
const { sendToNia, sendToPalavrao } = require("./services/nia-service");

(async () => {

  console.log("me mostra a api key", process.env.OLLAMA_API_KEY)
  const resposta = await sendToNia({
    messageUser: "Quem são os devs da meso",
    threadId: "thread-553196472282"
  });
  //onst resposta = await sendToPalavrao({
  //   messageUser: "Ah tomar banho",
  // });

  console.log("RESPOSTA FINAL:", resposta);
})();

// Importação dos módulos e configuração inicial
const express = require("express");
const body_parser = require("body-parser");
const https = require("https");
const fs = require("fs");
const axios = require("axios");
const app = express().use(body_parser.json());
const porta = 3000;
let entry 
// Configuração das variáveis de ambiente
require('dotenv').config();

// Configuração para suporte HTTPS com certificado SSL
const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/poc.plugphone.cloud/privkey.pem"), // Carrega a chave privada
    cert: fs.readFileSync("/etc/letsencrypt/live/poc.plugphone.cloud/fullchain.pem") // Carrega o certificado
};

// Criação do servidor HTTPS
https.createServer(options, app).listen(porta, () => {
    console.log("API server online and running in port " + porta);
});

// Rota inicial
app.get("/", (req, res) => {
    res.json({
        funcionou: false,
        msg: "Result Off *2 ",
        dados: [],
    });
});

// Rota de webhook para receber dados POST
app.post("/webhooks", (req, res) => {
    let body_param = req.body;
    //console.log(body_param);
    entry = body_param.entry[0]
    console.log(entry.changes[0].value);
  let mensagem
    try {
        mensagem = entry.changes[0].value.messages[0]
        console.log(mensagem, 'recebi')
    } catch (error) {
        if(entry.changes[0].value.statuses[0].status !='read'){
        mensagem = entry.changes[0].value.statuses[0].conversation        
        console.log(mensagem)
        }
    }
    res.status(200).end()
});





// Rota de webhook para verificação de integridade
app.get("/webhooks", (req, res) => {
    let hub = {};
    hub.mode = req.query['hub.mode'];
    hub.challenge = req.query['hub.challenge'];
    hub.verify_token = req.query['hub.verify_token'];
   //// console.log(req.query, hub);
    let resposta = hub.challenge;
    res.send(resposta);
});

// Rota para download de um arquivo com base em um ID
app.get('/download/:id', async (req, res) => {
    let id = req.params.id;

    const requestOptions = {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer EABpILka8Wz0BOxLufU9imK9suY5AqptkzxmfmagrO4e5aCCSBIgwGpBPQgeKUnUwzOL0V0UDyZAHZC8TUSXHWZAXxNZCJRUbAtHST875gIx2FZCPHZB6igWEwaG5aPLZBaXBLsSDBKcsi9j5G2ZALZCZCXcZAZCEv6v30hNr2NAA9TCu2aM8ZCraAsBq66BOCkaczplKR3VRR7gEnsubXHdNATSwZD"
        }
    };

    try {
        // Obter informações com base no ID
        const response = await axios.get(`https://graph.facebook.com/v17.0/${id}`, requestOptions);
        console.log('Ola eu sou response', response.data);

        // Baixar o arquivo usando a URL obtida acima
        const response1 = await axios.get(response.data.url, requestOptions);
        res.json(response1.data.url);

        // Configuração para download de arquivo em formato PDF
        const instance = axios.create({
            responseType: 'arraybuffer',
            headers: {
                "Content-Type": "application/pdf",
                'Authorization': "Bearer EABpILka8Wz0BOymZAVWZBePBXiSjKJwmE1t9PTtVIAAQPtgJA3fc30qbwrOwMQQ3tAEM9ARVXmBT4qo1BVimsbxYkPWa54HfluyN0ZB3BxZCHHADt5sr2A5YZCYPeDuLZABndT9SK27KSyMHbMIO2urOnwQ7ZCFdgxpkxzqkdAVN9avdDY3vbTjP7NNNgXEtWmSyRLNy7w8Sky2ZAGcot7gZD"
            }
        });

        // Realizar o download do arquivo
        instance.get(response.data.url)
            .then(function (response) {
                console.log("ola eu sou o response", response.data);
                // Escrever o arquivo no sistema de arquivos
                fs.writeFile(`${"Documento"}` + '.pdf', response.data, err => {
                    if (err) {
                        console.log(err);
                    }
                    console.log("Deu Certo Aleluia Gloria DEUS!!!!!!!!!!!");
                });
            })
            .catch(function (error) {
                console.log("Ola eu sou o erro", error);
            });
    } catch (erro) {
        console.error(erro, "Algo de errado não esta certo");
        res.status(500).json({ error: "Erro ao baixar a mensagem" });
    }
});
 
app.post("/send" , async (req,res) =>{
    let to = req.body.to
    let body = req.body.body
    const requestOptions = {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json",
            'Authorization': "Bearer EABpILka8Wz0BO4UEF8zDkuB41geUsTgfu7c0GeYZC8ryjGeaMhNeR784SnrO0UNZCuZA2qT7nazTmQd7uvKFQQRWiFVuwgPbrOIvwfpgKRZBFDmlgI5kDFsMNH9ZAJTMnRod1kshTVfzZCNDcunJIdq8iODoHt0I05zJNmzC2pLMMZCZBtjEOf2YXNz52lYZA6UFSYGVfjSzQWmo8HCcIJzUZD"
        },
        body: JSON.stringify({
            "messaging_product": "whatsapp", // Adicione o messaging_product aqui
            "recipient_type" : "individual",
            to,
            "type": "text",
            "text": {
                "preview_url": false,
                body
            }     
        })
    }
    try {
        const fetch = require('node-fetch');
        const response = await fetch("https://graph.facebook.com/v17.0/116793154851650/messages", requestOptions);
        const data = await response.json();
        console.log(data);
        res.json(data);
      } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao enviar a mensagem" });
    }
})
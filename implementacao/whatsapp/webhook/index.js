const express = require("express");
const helmet = require("helmet");
const { socketConnection, buscarMensagem, emitirContatosAtualizados } = require("./SocketConnection");
const webpush = require('web-push');
const { api } = require("./api.js");
const { v4 } = require("uuid");
const body_parser = require("body-parser");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const { executaQry } = require('/meso/whatsapp/webhook/db');
const { send, sendImage, sendVideo, sendAudio, normalizaTextoWhatsApp, gerenciarAtendimento, sendDocument, sendTemplate, download, sendTemplateMenu, reciveMediaLink, verificaPalavrao, audioGpt, precisaDeHumano } = require('./methods');
const { emitMensagem, emitImage, emitAudio, emitDocument, emitMensagem2 } = require("./emit");
const { sendToNia } = require("./llama_bot/services/nia-service.js");
const { Socket } = require("socket.io");
const app = express().use(body_parser.json());
const porta = 3333;
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const { plugBot } = require("./botPlugPhone/plugbot.service.js");

const { Ollama } = require("ollama");

const ollama = new Ollama({
    host: "https://ollama.com",
    headers: {
        Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
    },
});



// const vapidKeys = webpush.generateVAPIDKeys();
//// console.log(vapidKeys);

// Depois de gerar, use estas chaves fixas:
const publicVapidKey = 'BF9I5Hn6nPKVmAStkc5UhAs052m6ODPL2Ph48d3fN5z_9U_6LXAgGePD3cEVnzJ7lERMmqENpo_gFe73FpExRIE';
const privateVapidKey = '_w0BrYQ_F7UOKc4iEhXKyVs-iDISpvcsIai2jLR8Tcg';

webpush.setVapidDetails(
    'mailto:seu-email@dominio.com',
    publicVapidKey,
    privateVapidKey
);


let tokens = [];
const serviceAccount = require('./plugphonechat-f3a19-firebase-adminsdk-fbsvc-4432807ed7.json'); // Substitua pelo caminho correto

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
let entry;

require('dotenv').config();

const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/meso.plugphone.cloud/privkey.pem"),
    cert: fs.readFileSync("/etc/letsencrypt/live/meso.plugphone.cloud/fullchain.pem")
};

app.use(helmet());

app.use(cors({
    origin: "*", // Permite qualquer origem
    methods: ["GET", "POST"],
    ///allowedHeaders: ["my-custom-header"],
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Permite qualquer origem
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "my-custom-header");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    ////////////console.log('Response Headers:', res.getHeaders());
    next();
});

const server = https.createServer(options, app);

const io = require('socket.io')(server, {
    cors: {
        origin: "*", // Permite qualquer origem
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

server.listen(porta, () => {
    ////////console.log("API server online and running in port " + porta);
});


// Rota inicial
app.get("/", (req, res) => {
    res.json({
        funcionou: false,
        msg: "Fumaça",
        dados: [],
    });
});

// Inicia a conexão do Socket.IO
socketConnection(io);
emitirContatosAtualizados(io);

// Rota de webhook para receber dados POST
app.post("/webhooks", async (req, res) => {
    let body_param = req.body;
    let tudo = body_param;
    //console.log('NegocioAqui', JSON.stringify(tudo))

    const msgObj = tudo?.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    const meta = tudo?.entry?.[0]?.changes?.[0]?.value?.metadata;
    const statusObj = tudo?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0];

    //console.log('vinijr é foda', msgObj, meta, statusObj)


    // ❌ se não tem mensagem, provavelmente é evento de status
    if (!msgObj && statusObj) {
        //console.log(`⚠️ Ignorado STATUS: ${statusObj.status}`);
        return res.sendStatus(200);
    }

    // ❌ se é mensagem do bot, ignora
    const botNumber = meta?.display_phone_number?.replace("+", "");
    const from = msgObj?.from;
    if (from === botNumber) {
        //console.log("⚠️ Ignorado — Bot falando");
        return res.sendStatus(200);
    }

    // ✅ IA só responde TEXTO — mas não dá return, deixa fluxo seguir
    let iaPodeResponder = false;
    if (msgObj?.type === "text") {
        iaPodeResponder = true;
    } else {
        //console.log(`⚠️ Mídia recebida (${msgObj?.type}) — IA não responde`);
    }


    let visualização = tudo?.entry?.[0].changes?.[0].value?.statuses?.[0].status
    let numRecebe = tudo.entry[0].changes[0].value.metadata.display_phone_number
    console.log('requiem ofereço', numRecebe)
    let waId = tudo?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id;
    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;

    let arrayID = await api.get(`/pegaIdEmpresa/${numRecebe}`)
    let idEmpresa = arrayID.data.dados[0].id_empresa
    let wpp_id = arrayID.data.dados[0].wpp_id

    console.log(wpp_id)

    await gerenciarAtendimento(msgObj, nome, meta, numRecebe, idEmpresa);

    let numeroWhatsapp = body_param?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id;
    let status = tudo?.entry?.[0]?.changes?.[0]?.value?.statuses?.[0]?.status || '';
    console.log('status', status)


    if (!numeroWhatsapp) {
        return res.status(400).json({ error: "Número de WhatsApp não encontrado na requisição" });
    }
    let qry = `select count(whatsappid) as quantNum from meso_mensagens_solicitante where whatsappid = '${numeroWhatsapp}' and id_empresa = '${idEmpresa}' and DATE(datetime) = CURDATE()`;
    let quantNumArray = await executaQry(qry);
    let quantNum = quantNumArray.dados[0].quantNum;

    let qry2 = `select estado from meso_contatos where id_empresa = '${idEmpresa}' and telefone = '${numeroWhatsapp}' `;
    let estadoArray = await executaQry(qry2);
    let estado = estadoArray.dados[0].estado;
    console.log('Cupcake', estado)

    /*   let queryMudaEmpresa = `update meso_contatos set id_empresa = ${idEmpresa} where telefone = '${waId}'`
       console.log('queryMudaEMpresa', queryMudaEmpresa)
   
       await executaQry(queryMudaEmpresa)
       */
    console.log('besteirinhas', quantNum, 'e', estado)
    if (quantNum >= 1 && estado != 'Concluído') {



        entry = body_param.entry[0]
        let mensagem
        if (tudo.entry[0].changes[0].value.messages) {
            if (tudo.entry[0].changes[0].value.messages[0].type == 'text') {
                try {
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value;
                    let type = mensagem.type;
                    let msg = mensagem.text.body;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;

                    let telEmpresa = tudo.entry[0].changes[0].value.metadata.display_phone_number

                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);
                    let message_id_resposta = mensagem.context ? true : false;

                    let pegaEmpresa = `select id_empresa, telefone from meso_contatos where telefone = '${waId}'`
                    console.log('velinho de barba', pegaEmpresa)
                    let arrayID = await executaQry(pegaEmpresa)

                    let empresa = arrayID.dados[0].id_empresa
                    let wpnumber = arrayID.dados[0].telefone


                    let arrayWpp = `select wpp_id from meso_empresas where id_empresa = '${empresa}'`

                    let whatId = await executaQry(arrayWpp)
                    console.log('vida e viver', whatId.dados[0].wpp_id)
                    let wpp_id = whatId.dados[0].wpp_id

                    // 👉 verifica IA
                    const verIA = await executaQry(`SELECT atendimento_ai FROM meso_contatos WHERE telefone = '${waId}'`);
                    const iaAtiva = verIA.dados[0]?.atendimento_ai == 1;
                    const precisaHumano = precisaDeHumano(msg);

                    const emp = await executaQry(`
  SELECT empresa
  FROM meso_empresas
  WHERE id_empresa = '${idEmpresa}'
  LIMIT 1
`);

                    const nomeEmpresa = emp?.dados?.[0]?.empresa || "PlugPhone";
                    const botName = `Bot-${nomeEmpresa}`;

                    console.log("Precisa mostrar isso urgente")

                    if (iaAtiva && precisaHumano) {
                        // handoff
                        await executaQry(`
                            UPDATE meso_contatos
                            SET atendimento_ai = 0
                            WHERE telefone = '${waId}' AND id_empresa = '${idEmpresa}'
                        `);

                        await send(
                            waId,
                            "Para evitar qualquer desencontro de informações, vou te direcionar agora para um atendente humano.",
                            botName,
                            res,
                            wpp_id,
                            telEmpresa
                        );

                        return res.sendStatus(200);
                    }

                    console.log("Oq tem nessa merda", iaAtiva, iaPodeResponder)


                    if (iaAtiva && iaPodeResponder) {

                        console.log('🤖 IA ativada para', waId);

                        let buscaThread = await executaQry(`
                        SELECT thread_id 
                        FROM meso_contatos 
                        WHERE telefone = '${waId}' and id_empresa = '${idEmpresa}'
                            `);

                        let threadId = buscaThread.dados[0]?.thread_id || null;

                        const msgLower = msg.toLowerCase();
                        const querHumano =
                            msgLower.includes("falar com atendente") ||
                            msgLower.includes("humano") ||
                            msgLower.includes("suporte humano") ||
                            msgLower.includes("transferir") ||
                            msgLower.includes("atendente");

                        if (querHumano) {
                            await executaQry(`UPDATE meso_contatos SET atendimento_ai = 0 WHERE telefone = '${waId}'`);
                            await send(waId, "Certo, vou te transferir para um de nossos atendentes. Um momento...", botName, wpp_id, telEmpresa);
                            return res.sendStatus(200);
                        }

                        // Registrar mensagem
                        let qry55 = `
                                INSERT INTO meso_mensagens_solicitante 
                                (nome, whatsappid, mensagem, telefone, wpnumber, type, visualizacao, message_id, id_empresa) 
                                VALUES ('${nome}', '${waId}', '${msg}', '${waId}','${telEmpresa}', '${type}', 'not read', '${messageId}', '${idEmpresa}');
                            `;

                        console.log('teyrubitou', qry55)
                        await executaQry(qry55);

                        // Enviar para NIA
                        // const { reply, threadId: novoThread } = await sendToNia({
                        //     message: msg,
                        //     threadId
                        // });
                        // console.log('sessão nostalgia', reply)
                        // Atualizar thread
                        console.log("Entrou nesse caralho")

                        console.log("me mostra a api key 4.0", process.env.OLLAMA_API_KEY)
                        const resposta = await sendToNia({
                            messageUser: msg,
                            threadId: `thread-${waId}}`,
                            ollama: ollama,
                        });
                        // const resposta = await sendToPalavrao({
                        //     messageUser: "Ah tomar banho",
                        // });

                        let respostaFinal = normalizaTextoWhatsApp(resposta);

                        console.log("RESPOSTA FINAL:", respostaFinal);

                        console.log("Para de falar palavrão animal");
                        console.log(
                            "Eita porra mostra aqui",
                            waId,
                            respostaFinal,
                            botName,
                            res,
                            wpp_id,
                            telEmpresa
                        );

                        if (waId === '553199285573' || waId === '553189738409') {
                            await send(
                                waId,
                                respostaFinal,
                                botName,
                                res,
                                wpp_id,
                                telEmpresa
                            );
                        }



                        if (!threadId && novoThread) {
                            await executaQry(`
                                UPDATE meso_contatos 
                                SET thread_id = '${novoThread}' 
                                WHERE telefone = '${waId}'
                            `);
                            console.log("Entrou aqui? 1")
                        }
                        console.log("A vai tomar no c#")
                        // Finalizar IA se identificar término
                        if (reply.includes("concluídas") || reply.includes("Perfeito")) {
                            await executaQry(`
                                UPDATE meso_contatos 
                                SET atendimento_ai = 0 
                                WHERE telefone = '${waId}'
                            `);
                            console.log("Entrou aqui? 2")
                        }

                        // *** AQUI FALTAVA! ***
                        //                                await send(to, body, nome, res, wpp_id, wpnumber)



                        return res.sendStatus(200);
                    }


                    if (agora - timestamp > 10) return res.sendStatus(200);
                    ;
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return res.sendStatus(200);
                    ;
                    let qry
                    if (message_id_resposta) {
                        qry = `update meso_mensagens_solicitante set message_id_resposta = '${messageId}' where message_id = '${mensagem.context.id}';`
                        await executaQry(qry);
                    }

                    qry = `INSERT INTO meso_mensagens_solicitante 
                        (nome, whatsappid, mensagem, telefone,wpnumber, type, visualizacao, message_id, id_empresa) 
                        VALUES ('${nome}', '${waId}','${msg}','${waId}','${telEmpresa}','${type}', 'not read', '${messageId}','${idEmpresa}');`;
                    console.log('TA ERRADO CHEFE?', qry)

                    await executaQry(qry);

                    let qry1 = `SELECT MAX(id) as id FROM meso_mensagens_solicitante WHERE telefone = ${waId}`;
                    let id = await executaQry(qry1);

                    // VERIFICA se o contato existe
                    let qry5 = `SELECT COUNT(*) as contatoExiste FROM meso_contatos WHERE nome = '${nome}';`;
                    console.log('chapei?', qry5)

                    console.log('LUFFY O MEU CHAPÉU EU VOU TE ENTREGAR',)
                    let contatoExisteArray = await executaQry(qry5);
                    let contatoExiste = contatoExisteArray.dados[0].contatoExiste;

                    let qry4 = `update meso_contatos set estado = 'Aguardando Atendimento' where telefone like '%${waId}%' and id_empresa = '${idEmpresa}' ; `
                    ////////console.log('veia chata', qry4)
                    await executaQry(qry4)

                    ////console.log("Faz o L vagabundo text")
                    // SE NÃO EXISTE, INSERE
                    if (nome != 'boas_vindas_plugphone' && contatoExiste == 0) {
                        let qry4 = `INSERT INTO meso_contatos (nome, telefone, id_empresa)
                            SELECT '${nome}', '${waId}', '${idEmpresa}'
                            FROM DUAL
                            WHERE NOT EXISTS (
                                SELECT 1 FROM meso_contatos WHERE telefone = '${waId}' and id_empresa = ${idEmpresa}
                            );`;
                        console.log('sucker for pain', qry4)
                        await executaQry(qry4);
                    }

                    let salva = { "msg": msg, "tel": waId, "idEmpresa": idEmpresa };
                    await api.post("/atualizacontato", salva);

                    const agoraTempo = new Date();
                    const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }).format(agoraTempo);
                    ////////console.log('minha msg', horaFormatada)

                    let msgEnviada = {
                        telefone: waId,
                        nome: nome,
                        agente: '',
                        mensagem: msg,
                        type: 'text',
                        datetime: horaFormatada
                    }
                    //emitMensagem2(io, msgEnviada)

                    emitMensagem(io, nome, msg, waId);

                    console.log("Mamute pequenino ", msgEnviada);

                    io.emit('receive-message', [
                        msgEnviada.telefone,
                        msgEnviada.nome,
                        msgEnviada.agente,
                        '551131646301',
                        msgEnviada.mensagem,
                        msgEnviada.type,
                        msgEnviada.datetime
                    ]);





                    //     let qryBuscaEstadoCampanha = `select * from estado_contato;`
                    //////////     console.log("Estou aqui bonitinho", qryBuscaEstadoCampanha)
                    //     let estadoCampanha = await executaQry(qryBuscaEstadoCampanha)
                    //////////     //console.log("estado campanha", estadoCampanha)

                    let qryContatos = `select * from meso_contatos`
                    let contatosValor = await executaQry(qryContatos)

                    ////////console.log("My contacts", contatosValor.dados)

                    const estadosValidos = [
                        'Novo',
                        'Aguardando Cliente',
                        'Aguardando Atendimento',
                        'Concluido'
                    ];

                    const agrupados = {
                        'Todos': contatosValor.dados,
                        'Novo': [],
                        'Aguardando Cliente': [],
                        'Aguardando Atendimento': [],
                        'Concluido': []
                    };

                    contatosValor.dados.forEach(element => {
                        const estado = element.estado;

                        if (estadosValidos.includes(estado)) {
                            agrupados[estado].push({
                                estado: element.estado,
                                nome: element.nome,
                                usuario: element.usuario,
                                telefone: element.telefone,
                                ultimamsg: element.ultimamsg,
                                setor: element.setor,
                                datahora: element.datahora

                            });
                        } else {
                            ////////console.log('Estado desconhecido ou não tratado:', estado);
                        }
                    });

                    io.emit('contatos', agrupados)


                    let qryMandaToken = `select usuario, setor,nome from meso_contatos where telefone = '${waId}'`
                    let mandaToken = await executaQry(qryMandaToken)
                    ////console.log("Manda meu setor", mandaToken.dados[0].setor)
                    //estado, usuario, setor, tipo
                    // await emitContatosFlutter(io, estadoCampanha.dados[0].estado, mandaToken.dados[0].usuario, mandaToken.dados[0].setor, mandaToken.dados[0].tipo)

                    if (mandaToken.dados[0].usuario == null || mandaToken.dados[0].usuario == "") {
                        pegatokenfire(msg, nome, null, mandaToken.dados[0].setor, waId, io)
                        pegatokenfireMobile(msg, nome, null, mandaToken.dados[0].setor, waId)
                        console.log("me retorna aqui usuario nulo");
                    } else {
                        pegatokenfire(msg, nome, mandaToken.dados[0].usuario, null, waId, io)
                        pegatokenfireMobile(msg, nome, mandaToken.dados[0].usuario, null, waId)
                        console.log("me retorna aqui setor");
                    }

                    ////////console.log("Depois me mostre", mandaToken.dados[0].usuario, mandaToken.dados[0].setor)

                } catch (error) {
                    ////console.error("Erro ao processar mensagem:", error);
                }
            }

            else if (tudo.entry[0].changes[0].value.messages[0].type == 'button') {
                try {
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value.messaging_product;

                    let type = mensagem.type;
                    let msg = mensagem.button.text;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
                    let telEmpresa = tudo.entry[0].changes[0].value.metadata.display_phone_number

                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);

                    // IGNORA mensagens antigas (mais de 10 segundos)
                    if (agora - timestamp > 10) return res.sendStatus(200);
                    ;

                    // VERIFICA se a mensagem já foi processada
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return res.sendStatus(200);
                    ;

                    // INSERE A MENSAGEM NO BANCO
                    let qry = `
                        INSERT INTO meso_mensagens_solicitante 
                        (nome, whatsappid, mensagem, telefone,wpnumber, type, message_id, id_empresa) 
                        VALUES ('${nome}', '${waId}','${msg}','${waId}','${telEmpresa}','${type}', '${messageId}','${idEmpresa}');
                    `;
                    console.log('vc me sente?', qry)
                    await executaQry(qry);

                    let verSetorqry = `select setor from meso_contatos where telefone = '${waId}'`
                    let verSetor = await executaQry(verSetorqry);

                    let getSetor = verSetor.dados[0].setor
                    // ATUALIZA SETOR COM BASE NO BOTÃO
                    let getId = `select id_empresa from meso_contatos where telefone = '${waId}'`
                    console.log('velinho de barba', getId)
                    let id_empresaArray = await executaQry(getId)

                    let id_empresa = id_empresaArray.dados[0].id_empresa
                    console.log('eu sou o idEmpresa', id_empresa)
                    ////////console.log('ver Setor', getSetor)
                    let verificaAtendimento = await executaQry(`
  SELECT id FROM meso_atendimentos 
  WHERE telefone = '${waId}' AND status IN ('Novo', 'Aguardando Atendimento')
  ORDER BY id DESC LIMIT 1;
`);

                    if (verificaAtendimento.dados.length === 0) {
                        console.log(`🪄 Criando novo atendimento para ${waId} (${msg})`);

                        let qryInsert = `
    INSERT INTO meso_atendimentos 
      (id_contato, telefone, id_empresa,setor_origem, setor_atual, canal, status, data_inicio, ultima_mensagem, criado_por, atualizado_em)
    VALUES (
      (SELECT id FROM meso_contatos WHERE telefone = '${waId}' LIMIT 1),
      '${waId}',
      '${id_empresa}',
      'Bot',
      '${msg}',
      'WhatsApp',
      'Novo',
      NOW(),
      NOW(),
      'Sistema',
      NOW()
    );
  `;
                        await executaQry(qryInsert);
                    } else {
                        console.log(`🧭 Atendimento já existente para ${waId}`);
                    }

                    if (getSetor == msg) {
                        let qry1 = `UPDATE meso_contatos SET setor = '${msg}' WHERE telefone = '${waId}'`;
                        await executaQry(qry1);
                        let qry3 = `UPDATE meso_contatos SET estadomsg = 'novamsg' WHERE telefone = '${waId}'`;
                        await executaQry(qry3);
                        let qry4 = `update meso_contatos set estado = 'Novo' where telefone = '${waId}'`
                        await executaQry(qry4)
                        let qry5 = `UPDATE meso_atendimentos SET setor_origem = '${msg}', setor_atual = '${msg}' WHERE telefone = '${waId}'`;
                        console.log(qry5)
                        await executaQry(qry5);
                    } else {
                        let qry1 = `UPDATE meso_contatos SET setor = '${msg}' WHERE telefone = '${waId}'`;
                        await executaQry(qry1);
                        let qry3 = `UPDATE meso_contatos SET estadomsg = 'novamsg' WHERE telefone = '${waId}'`;
                        await executaQry(qry3);
                        let qry2 = `UPDATE meso_contatos SET usuario = NULL WHERE telefone = '${waId}'`;
                        await executaQry(qry2);
                        let qry4 = `update meso_contatos set estado = 'Novo' where telefone = '${waId}'`
                        await executaQry(qry4)
                        let qry5 = `UPDATE meso_atendimentos SET setor_origem = '${msg}', setor_atual = '${msg}' WHERE telefone = '${waId}'`;
                        console.log(qry5)
                        await executaQry(qry5);
                    }

                    // INÍCIO DO ATENDIMENTO IA
                    if (
                        msg.toLowerCase().includes("técnico") ||
                        msg.toLowerCase().includes("tecnico") ||
                        msg.toLowerCase().includes("comercial") ||
                        msg.toLowerCase().includes("financeiro")
                    ) {
                        console.log("📌 Cliente selecionou um setor.");

                        // identificar setor
                        let setor = "geral";
                        if (msg.toLowerCase().includes("técnico") || msg.toLowerCase().includes("tecnico")) setor = "técnico";
                        if (msg.toLowerCase().includes("comercial")) setor = "comercial";
                        if (msg.toLowerCase().includes("financeiro")) setor = "financeiro";

                        // 1) Ativa IA
                        await executaQry(`
        UPDATE meso_contatos 
        SET atendimento_ai = 1, setor='${setor}'
        WHERE telefone = '${waId}' AND id_empresa = '${idEmpresa}'
    `);

                        let buscaThread = await executaQry(`
SELECT thread_id 
FROM meso_contatos 
WHERE telefone = '${waId}' and id_empresa = '${idEmpresa}'
    `);

                        let threadId = buscaThread.dados[0]?.thread_id || null;

                        console.log('vish', threadId)

                        if (msg == 'Comercial') {
                            console.log('entrei no comercial')
                            await sendToNia({
                                message: 'ativar modo comercial',
                                threadId
                            });
                        }


                        // ⚠️ IMPORTANTE: NÃO CHAMA A NIA AQUI!
                        // Agora o próximo texto do cliente cairá no bloco (iaAtiva && iaPodeResponder)

                        return res.sendStatus(200);
                    }



                    //////console.log("Mensagens vindas da API", msg);

                    // VERIFICA SE O CONTATO JÁ EXISTE
                    let qry5 = `SELECT COUNT(*) as contatoExiste FROM meso_contatos WHERE nome = '${nome}'  and id_empresa = '${idEmpresa}';`;
                    console.log('chapei?', qry5)
                    let contatoExisteArray = await executaQry(qry5);
                    let contatoExiste = contatoExisteArray.dados[0].contatoExiste;


                    ////console.log("Faz o L vagabundo button")

                    if (nome != 'boas_vindas_plugphone' && contatoExiste == 0) {
                        let qry4 = `INSERT INTO meso_contatos (nome, telefone,id_empresa)
SELECT '${nome}', '${waId}','${idEmpresa}'
FROM DUAL
WHERE NOT EXISTS (
    SELECT 1 FROM meso_contatos WHERE telefone = '${waId}' and id_empresa = ${idEmpresa}
);`;
                        console.log('sucker for pain', qry4)
                        await executaQry(qry4);
                    }

                    // EMITE PARA O SOCKET
                    emitMensagem(io, nome, msg, waId);


                    const agoraTempo = new Date();
                    const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }).format(agoraTempo);
                    ////////console.log('minha msg', horaFormatada)

                    let msgEnviada = {
                        telefone: waId,
                        nome: nome,
                        agente: '',
                        mensagem: msg,
                        type: 'text',
                        datetime: horaFormatada
                    }

                    io.emit('receive-message', [
                        msgEnviada.telefone,
                        msgEnviada.nome,
                        msgEnviada.agente,
                        '551131646301',
                        msgEnviada.mensagem,
                        msgEnviada.type,
                        msgEnviada.datetime
                    ]);



                    //     let qryBuscaEstadoCampanha = `select * from estado_contato;`
                    //////////     console.log("Estou aqui bonitinho", qryBuscaEstadoCampanha)
                    //     let estadoCampanha = await executaQry(qryBuscaEstadoCampanha)
                    //////////     //console.log("estado campanha", estadoCampanha)

                    let qryContatos = `select * from meso_contatos`
                    let contatosValor = await executaQry(qryContatos)

                    ////////console.log("My contacts", contatosValor.dados)

                    const estadosValidos = [
                        'Novo',
                        'Aguardando Cliente',
                        'Aguardando Atendimento',
                        'Concluido'
                    ];

                    const agrupados = {
                        'Todos': contatosValor.dados,
                        'Novo': [],
                        'Aguardando Cliente': [],
                        'Aguardando Atendimento': [],
                        'Concluido': []
                    };

                    contatosValor.dados.forEach(element => {
                        const estado = element.estado;

                        if (estadosValidos.includes(estado)) {
                            agrupados[estado].push({
                                estado: element.estado,
                                nome: element.nome,
                                usuario: element.usuario,
                                telefone: element.telefone,
                                ultimamsg: element.ultimamsg,
                                setor: element.setor,
                                datahora: element.datahora

                            });
                        } else {
                            ////////console.log('Estado desconhecido ou não tratado:', estado);
                        }
                    });

                    io.emit('contatos', agrupados)


                    let qryMandaToken = `select usuario, setor from meso_contatos where telefone = '${waId}'`
                    let mandaToken = await executaQry(qryMandaToken)
                    ////////console.log("Manda meu setor", mandaToken.dados[0].setor)
                    //     //estado, usuario, setor, tipo
                    //    // await emitContatosFlutter(io, estadoCampanha.dados[0].estado, mandaToken.dados[0].usuario, mandaToken.dados[0].setor, mandaToken.dados[0].tipo)

                    if (mandaToken.dados[0].usuario == null || mandaToken.dados[0].usuario == "") {
                        pegatokenfire(msg, nome, null, mandaToken.dados[0].setor)
                        ////////console.log("me retorna aqui usuario nulo");
                    } else {
                        pegatokenfire(msg, nome, mandaToken.dados[0].usuario, null)
                        ////////console.log("me retorna aqui setor");
                    }

                    ////////console.log("Depois me mostre", mandaToken.dados[0].usuario, mandaToken.dados[0].setor)

                } catch (error) {
                    ////console.error("Erro ao processar botão:", error);
                }


            }
            else if (tudo.entry[0].changes[0].value.messages[0].type == 'image') {
                try {
                    console.log('cheguei aqui  narutin')
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value;

                    let type = mensagem.type;
                    let msg = mensagem.image.id;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
                    let telEmpresa = tudo.entry[0].changes[0].value.metadata.display_phone_number

                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);

                    // IGNORA mensagens antigas (mais de 10 segundos)
                    if (agora - timestamp > 10) return res.sendStatus(200);
                    ;

                    // VERIFICA se a imagem já foi processada
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return res.sendStatus(200);
                    ;

                    // INSERE NO BANCO
                    let qry = `
                        INSERT INTO meso_mensagens_solicitante 
                        (nome, whatsappid, mensagem, wpnumber,telefone,  type, message_id, id_empresa) 
                        VALUES ('${nome}', '${waId}','${msg}.jpeg','${telEmpresa}','${waId}','${type}', '${messageId}','${idEmpresa}');
                    `;

                    console.log('é o fim?', qry)
                    await executaQry(qry);

                    console.log('passei da query')
                    console.log('id da imagem', msg)
                    // PEGA URL DA IMAGEM
                    let a = await api.get(`/pegaURL/${msg}`);
                    let url = a.data.url;
                    console.log('eu sou a URL', url)
                    let bodyImage = {
                        "url": url,
                        "id": msg
                    };

                    await api.post(`/geraImage/`, bodyImage);

                    // PEGA BUFFER DA IMAGEM CONVERTIDA
                    let geraMidia = await api.get(`/get-image/${msg}.jpeg`, { responseType: 'arraybuffer' });
                    console.log('passei pelo get image', geraMidia)
                    if (geraMidia.status === 200) {
                        const imageBuffer = Buffer.from(geraMidia.data, 'binary');
                        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

                        // EMITE IMAGEM PARA O SOCKET
                        emitImage(io, nome, base64Image, waId);
                        let salva = { "msg": "imagem", "tel": waId };
                        await api.post("/atualizacontato", salva);

                        // coloca aqui, ui
                        const agoraTempo = new Date();
                        const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                        }).format(agoraTempo);
                        ////////console.log('minha msg', horaFormatada)

                        let msgEnviada = {
                            telefone: waId,
                            nome: nome,
                            agente: '',
                            mensagem: `${msg}.jpeg`,
                            type: 'image',
                            datetime: horaFormatada
                        }

                        ////console.log("Mamute pequenino ", msgEnviada);

                        io.emit('receive-message', [
                            msgEnviada.telefone,
                            msgEnviada.nome,
                            msgEnviada.agente,
                            '551131646301',
                            msgEnviada.mensagem,
                            msgEnviada.type,
                            msgEnviada.datetime
                        ]);



                        //     let qryBuscaEstadoCampanha = `select * from estado_contato;`
                        //////////     console.log("Estou aqui bonitinho", qryBuscaEstadoCampanha)
                        //     let estadoCampanha = await executaQry(qryBuscaEstadoCampanha)
                        //////////     //console.log("estado campanha", estadoCampanha)

                        let qryContatos = `select * from meso_contatos`
                        let contatosValor = await executaQry(qryContatos)

                        ////////console.log("My contacts", contatosValor.dados)

                        const estadosValidos = [
                            'Novo',
                            'Aguardando Cliente',
                            'Aguardando Atendimento',
                            'Concluido'
                        ];

                        const agrupados = {
                            'Todos': contatosValor.dados,
                            'Novo': [],
                            'Aguardando Cliente': [],
                            'Aguardando Atendimento': [],
                            'Concluido': []
                        };

                        contatosValor.dados.forEach(element => {
                            const estado = element.estado;

                            if (estadosValidos.includes(estado)) {
                                agrupados[estado].push({
                                    estado: element.estado,
                                    nome: element.nome,
                                    usuario: element.usuario,
                                    telefone: element.telefone,
                                    ultimamsg: element.ultimamsg,
                                    setor: element.setor,
                                    datahora: element.datahora

                                });
                            } else {
                                ////////console.log('Estado desconhecido ou não tratado:', estado);
                            }
                        });

                        io.emit('contatos', agrupados)


                        let qryMandaToken = `select usuario, setor from meso_contatos where telefone = '${waId}'`
                        let mandaToken = await executaQry(qryMandaToken)
                        ////////console.log("Manda meu setor", mandaToken.dados[0].setor)
                        //     //estado, usuario, setor, tipo
                        //    // await emitContatosFlutter(io, estadoCampanha.dados[0].estado, mandaToken.dados[0].usuario, mandaToken.dados[0].setor, mandaToken.dados[0].tipo)

                        if (mandaToken.dados[0].usuario == null || mandaToken.dados[0].usuario == "") {
                            pegatokenfire(msg, nome, null, mandaToken.dados[0].setor)
                            ////////console.log("me retorna aqui usuario nulo");
                        } else {
                            pegatokenfire(msg, nome, mandaToken.dados[0].usuario, null)
                            ////////console.log("me retorna aqui setor");
                        }

                        ////////console.log("Depois me mostre", mandaToken.dados[0].usuario, mandaToken.dados[0].setor)


                    } else {
                        ////console.error('Erro ao obter a imagem:', geraMidia.status);
                    }

                } catch (error) {
                    ////console.error('Erro ao processar imagem:', error);
                }


            }
            else if (tudo.entry[0].changes[0].value.messages[0].type == 'audio') {
                try {
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value;

                    let type = mensagem.type;
                    let msg = mensagem.audio.id;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
                    let telEmpresa = tudo.entry[0].changes[0].value.metadata.display_phone_number

                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);

                    // IGNORA mensagens antigas (mais de 10 segundos)
                    if (agora - timestamp > 10) return res.sendStatus(200);
                    ;

                    // VERIFICA se a mensagem já foi processada
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return res.sendStatus(200);
                    ;


                    // INSERE NO BANCO
                    let qry = `
                        INSERT INTO meso_mensagens_solicitante 
                        (nome, whatsappid, mensagem, wpnumber, telefone, type, message_id, id_empresa) 
                        VALUES ('${nome}', '${waId}','${msg}.mp3','${telEmpresa}', '${waId}','${type}', '${messageId}','${idEmpresa}');
                    `;
                    console.log('bolsonaro segue preso', qry)
                    await executaQry(qry);

                    // PEGA A URL DO ÁUDIO
                    let a = await api.get(`/pegaURL/${msg}`);
                    let url = a.data.url;

                    let bodyAudio = {
                        "url": url,
                        "id": msg
                    };

                    await api.post(`/geraAudio/`, bodyAudio);

                    // PEGA O ÁUDIO COMO BUFFER
                    let geraMidia = await api.get(`/get-audio/${msg}.mp3`, { responseType: 'arraybuffer' });

                    if (geraMidia.status === 200) {
                        const audioBuffer = Buffer.from(geraMidia.data, 'binary');
                        const base64Audio = `data:audio/mp3;base64,${audioBuffer.toString('base64')}`;

                        // EMITE VIA SOCKET
                        emitAudio(io, nome, base64Audio, waId);

                        let salva = { "msg": "audio", "tel": waId };
                        await api.post("atualizacontato", salva);
                        let qry4 = `update meso_contatos set estado = 'Aguardando Atendimento' where telefone like '%${waId}%' and id_empresa = '${idEmpresa}';`
                        ////////console.log('veia chata', qry4)
                        await executaQry(qry4)

                    } else {
                        ////console.error('Erro ao obter o áudio:', geraMidia.status);
                    }

                    const agoraTempo = new Date();
                    const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }).format(agoraTempo);
                    ////////console.log('minha msg', horaFormatada)

                    let msgEnviada = {
                        telefone: waId,
                        nome: nome,
                        agente: '',
                        mensagem: `${msg}.mp3`,
                        type: 'audio',
                        datetime: horaFormatada
                    }

                    io.emit('receive-message', [
                        msgEnviada.telefone,
                        msgEnviada.nome,
                        msgEnviada.agente,
                        '551131646301',
                        msgEnviada.mensagem,
                        msgEnviada.type,
                        msgEnviada.datetime
                    ]);



                    //     let qryBuscaEstadoCampanha = `select * from estado_contato;`
                    //////////     console.log("Estou aqui bonitinho", qryBuscaEstadoCampanha)
                    //     let estadoCampanha = await executaQry(qryBuscaEstadoCampanha)
                    //////////     //console.log("estado campanha", estadoCampanha)

                    let qryContatos = `select * from meso_contatos`
                    let contatosValor = await executaQry(qryContatos)

                    ////////console.log("My contacts", contatosValor.dados)

                    const estadosValidos = [
                        'Novo',
                        'Aguardando Cliente',
                        'Aguardando Atendimento',
                        'Concluido'
                    ];

                    const agrupados = {
                        'Todos': contatosValor.dados,
                        'Novo': [],
                        'Aguardando Cliente': [],
                        'Aguardando Atendimento': [],
                        'Concluido': []
                    };

                    contatosValor.dados.forEach(element => {
                        const estado = element.estado;

                        if (estadosValidos.includes(estado)) {
                            agrupados[estado].push({
                                estado: element.estado,
                                nome: element.nome,
                                usuario: element.usuario,
                                telefone: element.telefone,
                                ultimamsg: element.ultimamsg,
                                setor: element.setor,
                                datahora: element.datahora

                            });
                        } else {
                            ////////console.log('Estado desconhecido ou não tratado:', estado);
                        }
                    });

                    io.emit('contatos', agrupados)


                    let qryMandaToken = `select usuario, setor from meso_contatos where telefone = '${waId}'`
                    let mandaToken = await executaQry(qryMandaToken)
                    ////////console.log("Manda meu setor", mandaToken.dados[0].setor)
                    //     //estado, usuario, setor, tipo
                    //    // await emitContatosFlutter(io, estadoCampanha.dados[0].estado, mandaToken.dados[0].usuario, mandaToken.dados[0].setor, mandaToken.dados[0].tipo)

                    if (mandaToken.dados[0].usuario == null || mandaToken.dados[0].usuario == "") {
                        pegatokenfire(msg, nome, null, mandaToken.dados[0].setor)
                        ////////console.log("me retorna aqui usuario nulo");
                    } else {
                        pegatokenfire(msg, nome, mandaToken.dados[0].usuario, null)
                        ////////console.log("me retorna aqui setor");
                    }

                    ////////console.log("Depois me mostre", mandaToken.dados[0].usuario, mandaToken.dados[0].setor)

                } catch (error) {
                    ////console.error('Erro ao processar áudio:', error);
                }
            }

            else if (tudo.entry[0].changes[0].value.messages[0].type == 'document') {
                console.log('Eu sou o documento né pae')
                try {
                    console.log("entrei aqui")

                    //console.log('teste produto', produto.value)
                    ////// console.log(mensagem, 'recebi')
                    //console.log('maioria', tudo.entry[0].changes[0].value.messages[0])
                    //console.log('eu sou tudo antes do if', tudo.entry[0].changes[0].value)
                    let type = tudo.entry[0].changes[0].value.messages[0].document.mime_type
                    let msg = tudo.entry[0].changes[0].value.messages[0].document.id
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id
                    let telEmpresa = tudo.entry[0].changes[0].value.metadata.display_phone_number

                    let fileName = tudo.entry[0].changes[0].value.messages[0].document.filename; // ex: "contrato.v1.final.pdf"
                    let extensao = fileName.substring(fileName.lastIndexOf(".") + 1);
                    let qry = `insert into meso_mensagens_solicitante (nome, whatsappid, mensagem, telefone, wpnumber, type ) VALUES ('${nome}', '${waId}','https://meso.plugphone.cloud:4444/midia/${msg}.${extensao}','${waId}','${telEmpresa}','${type}');`
                    console.log('Satoru gojo', qry)
                    await executaQry(qry)

                    let a = await api.get(`/pegaURL/${msg}`);
                    console.log(a.data);
                    let url = a.data.url;
                    console.log('MÃE SOLTEIRA', url)

                    let bodyImage = {
                        "url": url,
                        "id": msg,
                        "extensao": extensao
                    };
                    let qry4 = `update meso_contatos set estado = 'Aguardando Atendimento', ultimamsg = 'documento' where telefone like '%${waId}%' and id_empresa = '${idEmpresa}';`
                    console.log('query4', qry4)
                    await executaQry(qry4)

                    await api.post(`/geraDocument/`, bodyImage);
                    emitMensagem(io, nome, `Link do documento: \nhttps://meso.plugphone.cloud:4444/midia/${msg}.${extensao}`, waId)


                    const agora = new Date();
                    const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
                        day: '2-digit',

                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    }).format(agora);
                    console.log('minha msg', msg)

                    io.emit('receive-message', [
                        waId,
                        nome,
                        "agente",
                        '551131646301',
                        `${msg}.${extensao}`,
                        type,
                        horaFormatada
                    ]);

                } catch (error) {
                    //   if (entry.changes[0].value.statuses[0].status != 'read') {
                    //     mensagem = entry.changes[0].value.statuses[0].conversation

                    // console.log('teste se e aqui', mensagem)
                    console.log('chatino heim', error)

                }
            }

        } else {
            console.log('mensagem enviada')
        }
    } else {
        console.log('entrei no ELSE')
        let mensagem = tudo.entry[0].changes[0].value.messages[0];
        let produto = tudo.entry[0].changes[0].value;



        let type = mensagem.type;
        let msg = mensagem?.text?.body || "";
        let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
        let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
        let telEmpresa = tudo.entry[0].changes[0].value.metadata.display_phone_number

        let messageId = mensagem.id;
        let timestamp = parseInt(mensagem.timestamp);
        let agora = Math.floor(Date.now() / 1000);

        // IGNORA mensagens antigas (mais de 10 segundos)
        if (agora - timestamp > 10) return res.sendStatus(200);
        ;

        // VERIFICA se a mensagem já foi processada
        let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
        let check = await executaQry(qryCheck);
        if (check.dados[0].jaExiste > 0) return res.sendStatus(200);
        ;

        let qry = `INSERT INTO meso_mensagens_solicitante 
        (nome, whatsappid, mensagem, telefone,wpnumber, type, visualizacao, message_id) 
        VALUES ('${nome}', '${waId}','${msg}','${waId}','${telEmpresa}','${type}', '${visualização}', '${messageId}');`;
        await executaQry(qry);
        //buscarMensagem();
        //////console.log('me mostra qry',qry)
        let qry5 = `select count(*) as contatoExiste from meso_contatos where nome = '${nome}'  and id_empresa = '${idEmpresa}';`
        console.log('chapei?', qry5)

        ////////////console.log(qry5)
        let contatoExisteArray = await executaQry(qry5)

        let contatoExiste = contatoExisteArray.dados[0].contatoExiste


        ////////////console.log('Eu sou o contatoExiste', contatoExiste)
        let qry4 = `update meso_contatos set estado = 'Aguardando Atendimento' where telefone like '%${waId}%' and id_empresa = '${idEmpresa}';`
        ////////console.log('veia chata', qry4)
        await executaQry(qry4)

        ////console.log("Faz o L vagabundo else")

        let template = "menu_plugphone"
        ////////////console.log(numeroWhatsapp)

        emitMensagem(io, nome, msg, waId);


        const agoraTempo = new Date();
        const horaFormatada = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).format(agoraTempo);
        ////////console.log('minha msg', horaFormatada)

        let msgEnviada = {
            telefone: waId,
            nome: nome,
            agente: '',
            mensagem: msg,
            type: 'text',
            datetime: horaFormatada
        }

        ////console.log('vou mostrar os dados da msg')

        io.emit('receive-message', [
            msgEnviada.telefone,
            msgEnviada.nome,
            msgEnviada.agente,
            '551131646301',
            msgEnviada.mensagem,
            msgEnviada.type,
            msgEnviada.datetime
        ]);



        //     let qryBuscaEstadoCampanha = `select * from estado_contato;`
        //////////     console.log("Estou aqui bonitinho", qryBuscaEstadoCampanha)
        //     let estadoCampanha = await executaQry(qryBuscaEstadoCampanha)
        //////////     //console.log("estado campanha", estadoCampanha)

        let qryContatos = `select * from meso_contatos`
        let contatosValor = await executaQry(qryContatos)

        ////////console.log("My contacts", contatosValor.dados)

        const estadosValidos = [
            'Novo',
            'Aguardando Cliente',
            'Aguardando Atendimento',
            'Concluido'
        ];

        const agrupados = {
            'Todos': contatosValor.dados,
            'Novo': [],
            'Aguardando Cliente': [],
            'Aguardando Atendimento': [],
            'Concluido': []
        };

        contatosValor.dados.forEach(element => {
            const estado = element.estado;

            if (estadosValidos.includes(estado)) {
                agrupados[estado].push({
                    estado: element.estado,
                    nome: element.nome,
                    usuario: element.usuario,
                    telefone: element.telefone,
                    ultimamsg: element.ultimamsg,
                    setor: element.setor,
                    datahora: element.datahora

                });
            } else {
                ////////console.log('Estado desconhecido ou não tratado:', estado);
            }
        });
        io.emit('contatos', agrupados)


        // let qryMandaToken = `select usuario, setor from meso_contatos where telefone = '${waId}'`
        //let mandaToken = await executaQry(qryMandaToken)
        ////////console.log("Manda meu setor", mandaToken.dados[0].setor)
        //     //estado, usuario, setor, tipo
        //    // await emitContatosFlutter(io, estadoCampanha.dados[0].estado, mandaToken.dados[0].usuario, mandaToken.dados[0].setor, mandaToken.dados[0].tipo)



        ////////console.log("Depois me mostre", mandaToken.dados[0].usuario, mandaToken.dados[0].setor)

        ////////////else{////console.log('Jurassic world')}

        if (nome != 'boas_vindas_plugphone' && contatoExiste == 0) {
            let qry4 = `INSERT INTO meso_contatos (nome, telefone, id_empresa)
            SELECT '${nome}', '${waId}','${idEmpresa}'
                FROM DUAL
            WHERE NOT EXISTS (
            SELECT 1 FROM meso_contatos WHERE telefone = '${waId}' and id_empresa = ${idEmpresa}
                );`;
            console.log('sucker for pain', qry4)
            await executaQry(qry4);
        }

        //let arrayID = await api.get(`/pegaIdEmpresa/${numRecebe}`)

        let pegaEmpresa = `select id_empresa from meso_contatos where telefone = '${waId}'`
        console.log('velinho de barba', pegaEmpresa)
        let arrayID = await executaQry(pegaEmpresa)

        let empresa = arrayID.dados[0].id_empresa


        let arrayWpp = `select wpp_id from meso_empresas where id_empresa = '${idEmpresa}'`

        let whatId = await executaQry(arrayWpp)
        console.log('vida e viver', whatId.dados[0].wpp_id)
        let wpp_id = whatId.dados[0].wpp_id

        console.log('maira', numeroWhatsapp, template, wpp_id)

        console.log('legends never dies', numeroWhatsapp, template, wpp_id, idEmpresa)

        sendTemplateMenu(numeroWhatsapp, template, res, wpp_id, telEmpresa, idEmpresa)

    }
    res.status(200).end()
});

app.get("/pegaid/:midia", async (req, res) => {
    let midia = req.params.midia

    let qry = `select mensagem as id from meso_mensagens_solicitante where type = '${midia}' and id = (select max(id)  from meso_mensagens_solicitante);`
    let idArray = await executaQry(qry)
    let id = idArray.dados[0].id

    res.json(id)
})

app.get("/recebidas", (req, res) => {
    ////////////console.log(entry.changes[0].value.messages[0])
    let resp = entry.changes[0].value.messages[0]
    res.json(resp)
    res.status(200).end()

});

// Rota de webhook para verificação de integridade
app.get("/webhooks", (req, res) => {
    let hub = {};
    hub.mode = req.query['hub.mode'];
    hub.challenge = req.query['hub.challenge'];
    hub.verify_token = req.query['hub.verify_token'];
    ////////////console.log(req.query, hub);
    let resposta = hub.challenge;
    res.send(resposta);
});

// Rota para download de um arquivo com base em um ID
app.get('/download/:id/:nome/:formato', async (req, res) => {
    let id = req.params.id;
    let nome = req.params.nome
    let formato = req.params.formato

    download(id, nome, formato, res)
});

app.post("/send", async (req, res) => {

    let to = req.body.to
    let body = req.body.body
    let nome = req.body.nome
    let id_empresa = req.body.idEmpresa

    let qry = `select wpp_id, telefone from meso_empresas where id_empresa = '${id_empresa}'`
    console.log('irritado', qry)
    let wpp = await executaQry(qry)
    let wpp_id = wpp.dados[0].wpp_id
    let wpnumber = wpp.dados[0].telefone

    console.log('dificil heim kkkkkkk', to, body, nome, wpp_id, wpnumber)
    let palavrao = await verificaPalavrao(body)
    ////console.log('palavrão nãokkkkkkk', palavrao)
    if (palavrao) {
        let qry = `insert into meso_mensagens_banidas (nome, mensagem) VALUES ('${nome}', '${body}')`
        await executaQry(qry)
        res.json({ "dados": "mensagem não tolerada" });
    } else {
        //////////console.log('passei mesmo kkkkk')


        /*
                let qry1 = `
            UPDATE meso_contatos 
            SET atendimento_ai = 0
            WHERE telefone = '${to}' and id_empresa = '${id_empresa}'
          `;
        
                console.log('opaaaaa vamo q vamo', qry1)
                await executaQry(qry1)
        */
        await send(to, body, nome, res, wpp_id, wpnumber)
        let qry = `update meso_contatos set ultimamsg = '${body}' where telefone = ${to} and id_empresa = '${id_empresa}'`
        console.log('eu sou a ultimamsg', qry)
        await executaQry(qry)


        ////console.log("Essa bosta aqui")

        //////console.log("Sem ter hora pra chegar")

        res.json({ "dados": "mensagem enviada" });

    }
})

app.post("/sendimage", async (req, res) => {



    let to = req.body.to
    let id = req.body.id
    let link = req.body.link
    ////////////console.log(to, id, link, res)
    ////////////console.log('oque vem sem link', link)
    sendImage(to, id, link, res)
})


app.post("/sendvideo", async (req, res) => {

    let to = req.body.to
    let id = req.body.id

    let link = req.body.link

    sendVideo(to, id, link, res)
})

app.post("/sendaudio", async (req, res) => {

    let to = req.body.to
    let id = req.body.id
    let link = req.body.link

    sendAudio(to, id, link)
})


app.post("/sendtemplate", async (req, res) => {


    let to = req.body.to
    let name = 'boas_vindas_plugphone'
    let usuario = req.body.usuario
    let text = req.body.text

    ////////////console.log('eu sou o send template', to,name,usuario)

    sendTemplate(to, name, usuario, text, res)
})


app.post("/sendtemplateMenu", async (req, res) => {

    let to = req.body.to
    let name = req.body.name

    ////////////console.log('SHE KNOWS')

    sendTemplateMenu(to, name, res)
    res.status(200)
})

app.post("/senddocument", async (req, res) => {

    let to = req.body.to
    let id = req.body.id.replace(/\D/g, "")
    let usuario = req.body.usuario
    let filename = req.body.nomeArquivo

    ////console.log(`teste do send document, \nto${to},\n id:${id},\n nomeArquivo ${filename},\nusuario ${usuario}`)

    sendDocument(to, id, filename, usuario, res)
})
app.get("/gerarprotocolo/:status", async (req, res, next) => {

    ////////////console.log(v4())
    const id = v4(); // Gera um novo id
    let status = req.params.status


    let qry = `INSERT INTO meso_gravar_id (id,protocolo,dataInicio,status) VALUES (0,'${id}',now(),'${status}')`
    ////////////console.log(qry)

    let res1 = await executaQry(qry);
    res.json(res1)
    ////////////console.log(res1)
})

app.post("/criarlogin", async (req, res, next) => {
    let login = req.body.login
    let senha = req.body.senha
    let qry = `insert into meso_login (login, senha) values ('${login}', md5('${senha}'))`
    ////////////console.log(qry)

    let res1 = await executaQry(qry);
    res.json(res1)
    ////////////console.log(res1)
})


app.post("/login", async (req, res, next) => {
    let login = req.body.login
    let senha = req.body.senha
    let qry = `select login,senha from meso_login where login like '${login}' and senha like md5('${senha}');`
    ////////////console.log(qry)
    let res1 = await executaQry(qry);
    res.json(res1)
    ////////////console.log(res1)

})





app.use(bodyParser.json());

// app.post('/registrar-token', async (req, res) => {
//     try {
//         const { token, usuario } = req.body;
//         const tokenFunc = await funcToken(usuario);

////         console.log("Meu ovo heim", token, usuario)

//         if (!token || !usuario) {
//             return res.status(400).json({ success: false, mensagem: "Token e usuário são obrigatórios." });
//         }

//         // só atualiza se o token for diferente do atual
//         if (token !== tokenFunc) {
//             let qry = `UPDATE meso_usuariologin 
//                        SET token = '${token}', logadoWeb = 1 
//                        WHERE usuario LIKE '%${usuario}%'`;

//             let resultado = await executaQry(qry);

//             if (resultado?.dados?.affectedRows > 0) {
//                 return res.status(200).json({ success: true, mensagem: "Token atualizado com sucesso!" });
//             } else {
//                 return res.status(400).json({ success: false, mensagem: "Nenhum usuário encontrado para atualizar." });
//             }
//         } else {
//             return res.status(200).json({ success: true, mensagem: "Token já estava atualizado, nada foi alterado." });
//         }
//     } catch (error) {
////         console.error("Erro ao registrar token:", error);
//         return res.status(500).json({ success: false, mensagem: "Erro interno ao registrar token." });
//     }
// });


app.post('/registrar-token-mobile', async (req, res) => {
    const { token } = req.body;
    const { usuario } = req.body

    ////console.log('auauau', token, usuario)

    const tokenFuncMobile = await funcTokenMobile(usuario);

    ////console.log("token e usuario aqui", token, usuario);

    if (token !== tokenFuncMobile) {
        let qry = `update meso_usuariologin set tokenMobile = '${token}',logadoMobile = 1 where usuario like '%${usuario.trim()}%'`;
        let tokenAtualizado = await executaQry(qry);
        ////console.log("Token atualizado", qry);

        if (tokenAtualizado?.dados.affectedRows > 0) {
            ////console.log('chegou aqui no insert');
            res.json({ success: true, mensagem: 'Token Atualizado Com Sucesso!' });
        } else {
            ////console.log('não chegou aqui no insert');
            res.json({ success: false, mensagem: 'Não foi possível atualizar o token!' });
        }
    }


});

app.post('/transcrever-audio', async (req, res) => {
    audioGpt();
    res.json("Foi")
});

app.get('/public_key', (req, res) => {
    res.json({ publicKey: publicVapidKey });
});

app.post('/register', async (req, res) => {
    const { subscription, usuario, tipo } = req.body;

    if (!subscription || !subscription.endpoint) {
        return res.status(400).json({ error: "Subscription inválida" })
    }

    let existe = await executaQry(`select exists(select 1 from meso_push_subscriptions where id_usuario = (select id from meso_usuariologin where usuario like '%${usuario}%')) as existe;`)


    //console.log("meu pai amado", existe.dados[0].existe)

    try {

        if (existe.dados[0].existe == 0) {
            executaQry(
                `insert into meso_push_subscriptions (id_usuario, tipo, endpoint, p256dh,auth) 
            values ((select id from meso_usuariologin where usuario 
            like '%${usuario}%'),'${tipo}', '${subscription.endpoint}', '${subscription.keys.p256dh}', '${subscription.keys.auth}')`)

            // console.log(`borracha forte insert into meso_push_subscriptions (id_usuario, tipo, endpoint, p256dh,auth) 
            // values((select id from meso_usuariologin where usuario 
            // like '%${usuario}%'), '${tipo}', '${subscription.endpoint}', '${subscription.keys.p256dh}', '${subscription.keys.auth}')`)

        } else {
            executaQry(`update meso_push_subscriptions set endpoint = '${subscription.endpoint}', p256dh = '${subscription.keys.p256dh}', auth = '${subscription.keys.auth}' 
                where id_usuario = (select id from meso_usuariologin where usuario like '%${usuario}%')`)

            // console.log(`borracha fraca update meso_push_subscriptions set endpoint = '${subscription.endpoint}', p256dh = '${subscription.keys.p256dh}', auth = '${subscription.keys.auth}' 
            //     where id = (select id from meso_usuariologin where usuario like '%${usuario}%')`)
        }

        res.json({ success: true, message: "Subscription registrada com sucesso" });
    } catch {
        //console.error("Erro ao salvar subscription:", err);
        res.status(500).json({ error: "Erro ao salvar subscription" });
    }
});

let funcToken = async function (nome) {
    let qry = `select token from meso_usuariologin where usuario like '%${nome}%'; `;
    token = await executaQry(qry)
    let tokenFormatado = token.dados.length > 0 ? token.dados[0].token : "";
    return tokenFormatado
}

let funcTokenMobile = async function (nome) {
    let qry = `select tokenMobile from meso_usuariologin where usuario like '%${nome}%'; `;
    token = await executaQry(qry)
    let tokenFormatado = token.dados.length > 0 ? token.dados[0].tokenMobile : "";
    return tokenFormatado
}

let pegatokenfire = async function (mensagem, nome, usuario, setor, telefone, io) {
    try {
        // 1. Buscar tokens do banco

        const rows = await executaQry(`select *
    FROM meso_push_subscriptions 
            WHERE id_usuario = (select id from meso_usuariologin where usuario like '%${usuario}%') 
               OR tipo = '${setor}' 
               OR tipo = 'admin'`)



        const payload = JSON.stringify({
            title: nome,
            body: mensagem,
            icon: "https://static.wixstatic.com/media/b7b2fb_4a6e74513d104222a819b7e01298e35c~mv2.png",
            data: {
                nome,
                telefone,
                usuario
            }
        });

        rows['dados'].forEach(async element => {
            const subscription = {
                endpoint: element.endpoint,
                keys: {
                    p256dh: element.p256dh,
                    auth: element.auth
                }
            }

            //console.log("Cabeça de gelo", subscription)

            try {
                let abc = await webpush.sendNotification(subscription, payload);
                //console.log("✅ Notificação enviada para:", element.endpoint, abc);
            } catch (err) {
                //console.warn("⚠️ Falha ao enviar para:", element.endpoint, err.statusCode);
                io.emit('erro', "⚠️ Falha ao enviar notificação por favor atualize a pagína:")
                // Se subscription estiver inválida (ex: usuário removeu permissão)
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await executaQry(`delete from meso_push_subscriptions where id = ${element.id} `);
                    //console.log("🗑️ Subscription removida:", element.endpoint);
                }
            }

        });

        return { success: true, message: "Notificações enviadas" };

    } catch (err) {
        //console.error("Erro ao enviar notificações:", err);
        return { error: "Erro ao enviar notificações" };
    }
}





let pegatokenfireMobile = async function (mensagem, nome, usuario, setor, telefone) {

    console.log(
        "mensagem:", mensagem, typeof mensagem,
        "nome:", nome, typeof nome,
        "usuario:", usuario, typeof usuario,
        "setor:", setor, typeof setor,
        "telefone:", telefone, typeof telefone,
    );

    try {
        let qry = `
      SELECT tokenMobile, somNotificacaoMobile
      FROM meso_usuariologin 
      WHERE usuario LIKE '%${usuario}%' 
         OR tipo = '${setor}' 
         OR tipo = 'admin';
    `;

        let resultado = await executaQry(qry);
        console.log('🔍 Consulta executada:', qry);

        if (!resultado?.dados?.length) {
            console.log("⚠️ Nenhum token encontrado");
            return;
        }

        let tokens = [];

        resultado.dados.forEach(item => {
            if (item.tokenMobile && item.tokenMobile.trim() !== '') {
                tokens.push({
                    token: item.tokenMobile.trim(),
                    audio: item.somNotificacaoMobile || "sim", // default sim
                });
            }
        });

        if (!tokens.length) {
            console.log("⚠️ Lista final de tokens vazia");
            return;
        }

        const messages = tokens.map(item => {
            const audioFlag = String(item.audio ?? "sim"); // "sim" / "não"

            return {
                token: item.token,
                notification: {
                    title: String(nome ?? "Nova mensagem"),
                    body: String(mensagem ?? ""),
                },
                data: {
                    nome: String(nome ?? ""),
                    telefone: String(telefone ?? ""),
                    usuario: String(usuario ?? ""),
                },
                android: {
                    priority: 'high',
                    notification: {
                        channelId: audioFlag === "SIM"
                            ? "custom_sound_channel"
                            : "custom_sound_channel_silent",
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: "notification.wav",
                            'content-available': 1,
                        },
                    },
                },
            };
        });

        const response = await admin.messaging().sendEach(messages);

        const successCount = response.responses.filter(r => r.success).length;
        const failureCount = response.responses.filter(r => !r.success).length;

        console.log(`✅ Enviado ${messages.length} notificações — Sucesso: ${successCount}, Falha: ${failureCount}`);

        response.responses.forEach((res, idx) => {
            if (!res.success) {
                console.warn(`⚠️ Falha no token: ${messages[idx].token}`);
                console.warn(`   ↳ Código do erro: ${res.error?.code}`);
                console.warn(`   ↳ Detalhes: ${res.error?.message}`);
            }
        });

    } catch (error) {
        console.error("🔥 Erro geral ao enviar notificações:", error.message);
        console.error("📄 Detalhes completos:", error);
    }
};

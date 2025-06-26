const express = require("express");
const helmet = require("helmet");
const { socketConnection } = require("./SocketConnection");
const { api } = require("./api.js");
const { v4 } = require("uuid");
const body_parser = require("body-parser");
const https = require("https");
const fs = require("fs");
const cors = require("cors");
const axios = require("axios");
const { executaQry } = require('/meso/whatsapp/webhook/db');
const { send, sendImage, sendVideo, sendAudio, sendDocument, sendTemplate, download, sendTemplateMenu, reciveMediaLink, verificaPalavrao } = require('./methods');
const { emitMensagem, emitImage, emitAudio, emitDocument, emitContatosFlutter } = require("./emit");
const { Socket } = require("socket.io");
const app = express().use(body_parser.json());
const porta = 3333;
const admin = require('firebase-admin');
const bodyParser = require('body-parser');


let tokens = [];
const serviceAccount = require('./flutterpushnotification-6cb4d-firebase-adminsdk-xy1ds-7583101b98.json'); // Substitua pelo caminho correto

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
    allowedHeaders: ["my-custom-header"],
    credentials: true
}));

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // Permite qualquer origem
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader("Access-Control-Allow-Headers", "my-custom-header");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    ////console.log('Response Headers:', res.getHeaders());
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
    console.log("API server online and running in port " + porta);
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

// Rota de webhook para receber dados POST
app.post("/webhooks", async (req, res) => {
    ////console.log('Webhook recebido!');
    //console.log('requisição aqui',req)

    let body_param = req.body;
    let tudo = body_param
    console.log('Negocio aqui', JSON.stringify(body_param))

    let visualização = tudo?.entry?.[0].changes?.[0].value?.statuses?.[0].status
    let numRecebe = tudo.entry[0].changes[0].value.metadata.display_phone_number


    // Verificação segura para evitar erros de leitura de propriedades
    let numeroWhatsapp = body_param?.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]?.wa_id;

    if (!numeroWhatsapp) {
        console.error('O número de WhatsApp não foi encontrado.');
        return res.status(400).json({ error: "Número de WhatsApp não encontrado na requisição" });
    }


    let qry = `select count(whatsappid) as quantNum from meso_mensagens_solicitante where whatsappid = '${numeroWhatsapp}' and DATE(datetime) = CURDATE()`;
    let quantNumArray = await executaQry(qry);
    let quantNum = quantNumArray.dados[0].quantNum;

    if (quantNum >= 1) {


        ////console.log(body_param);
        entry = body_param.entry[0]
        ////console.log(entry.changes[0].value);
        let mensagem
        ////console.log('eu sou tudo antes de tudo', tudo.entry[0].value)
        if (tudo.entry[0].changes[0].value.messages) {
            //console.log("Ninho de mafagafos")551131646301
            if (tudo.entry[0].changes[0].value.messages[0].type == 'text' && numRecebe == '551131646301') {
                try {
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value;

                    let type = mensagem.type;
                    let msg = mensagem.text.body;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);

                    // IGNORA mensagens antigas (mais de 10 segundos)
                    if (agora - timestamp > 10) return;

                    // VERIFICA se a mensagem já foi processada
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return;

                    let qry = `INSERT INTO meso_mensagens_solicitante 
                    (nome, whatsappid, mensagem, telefone, type, visualizacao, message_id) 
                    VALUES ('${nome}', '${waId}','${msg}','${waId}','${type}', '${visualização}', '${messageId}');`;
                    await executaQry(qry);



                    let qry1 = `SELECT MAX(id) as id FROM meso_mensagens_solicitante WHERE telefone = ${waId}`;
                    let id = await executaQry(qry1);

                    // VERIFICA se o contato existe
                    let qry5 = `SELECT COUNT(*) as contatoExiste FROM meso_contatos WHERE nome = '${nome}';`;
                    let contatoExisteArray = await executaQry(qry5);
                    let contatoExiste = contatoExisteArray.dados[0].contatoExiste;

                    let qry4 = `update meso_contatos set estado = 'Aguardando Atendimento' where telefone like '%${waId}%';`
                    console.log('veia chata', qry4)
                    await executaQry(qry4)


                    // SE NÃO EXISTE, INSERE
                    if (nome != 'template_plugphone2' && contatoExiste == 0) {
                        let qry4 = `INSERT INTO meso_contatos (nome, telefone) VALUES ('${nome}', '${waId}');`;
                        await executaQry(qry4);
                    }

                    emitMensagem(io, nome, msg, waId);

                    let salva = { "msg": msg, "tel": waId };
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
                    console.log('minha msg', horaFormatada)

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
                    //     console.log("Estou aqui bonitinho", qryBuscaEstadoCampanha)
                    //     let estadoCampanha = await executaQry(qryBuscaEstadoCampanha)
                    //     //console.log("estado campanha", estadoCampanha)

                    let qryContatos = `select * from meso_contatos`
                    let contatosValor = await executaQry(qryContatos)

                    console.log("My contacts", contatosValor.dados)

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
                            console.log('Estado desconhecido ou não tratado:', estado);
                        }
                    });

                    io.emit('contatos', agrupados)


                    let qryMandaToken = `select usuario, setor from meso_contatos where telefone = '${waId}'`
                    let mandaToken = await executaQry(qryMandaToken)
                    console.log("Manda meu setor", mandaToken.dados[0].setor)
                    //     //estado, usuario, setor, tipo
                    //    // await emitContatosFlutter(io, estadoCampanha.dados[0].estado, mandaToken.dados[0].usuario, mandaToken.dados[0].setor, mandaToken.dados[0].tipo)

                    if (mandaToken.dados[0].usuario == null || mandaToken.dados[0].usuario == "") {
                        pegatokenfire(msg, nome, null, mandaToken.dados[0].setor)
                        console.log("me retorna aqui usuario nulo");
                    } else {
                        pegatokenfire(msg, nome, mandaToken.dados[0].usuario, null)
                        console.log("me retorna aqui setor");
                    }

                    console.log("Depois me mostre", mandaToken.dados[0].usuario, mandaToken.dados[0].setor)

                } catch (error) {
                    console.error("Erro ao processar mensagem:", error);
                }
            }

            else if (tudo.entry[0].changes[0].value.messages[0].type == 'button' && numRecebe == '551131646301') {
                try {
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value.messaging_product;

                    let type = mensagem.type;
                    let msg = mensagem.button.text;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);

                    // IGNORA mensagens antigas (mais de 10 segundos)
                    if (agora - timestamp > 10) return;

                    // VERIFICA se a mensagem já foi processada
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return;

                    // INSERE A MENSAGEM NO BANCO
                    let qry = `
                        INSERT INTO meso_mensagens_solicitante 
                        (nome, whatsappid, mensagem, telefone, type, message_id) 
                        VALUES ('${nome}', '${waId}','${msg}','${waId}','${type}', '${messageId}');
                    `;
                    await executaQry(qry);
                    let verSetorqry = `select setor from meso_contatos where telefone = '${waId}'`
                    let verSetor = await executaQry(verSetorqry);

                    let getSetor = verSetor.dados[0].setor
                    // ATUALIZA SETOR COM BASE NO BOTÃO
                    console.log('ver Setor', getSetor)
                    if (getSetor == msg) {
                        let qry1 = `UPDATE meso_contatos SET setor = '${msg}' WHERE telefone = '${waId}'`;
                        await executaQry(qry1);
                        let qry3 = `UPDATE meso_contatos SET estadomsg = 'novamsg' WHERE telefone = '${waId}'`;
                        await executaQry(qry3);
                        let qry4 = `update meso_contatos set estado = 'Novo' where telefone = '${waId}'`
                        executaQry(qry4)
                    } else {
                        let qry1 = `UPDATE meso_contatos SET setor = '${msg}' WHERE telefone = '${waId}'`;
                        await executaQry(qry1);
                        let qry3 = `UPDATE meso_contatos SET estadomsg = 'novamsg' WHERE telefone = '${waId}'`;
                        await executaQry(qry3);
                        let qry2 = `UPDATE meso_contatos SET usuario = NULL WHERE telefone = '${waId}'`;
                        await executaQry(qry2);
                        let qry4 = `update meso_contatos set estado = 'Novo' where telefone = '${waId}'`
                        executaQry(qry4)
                    }

                    // VERIFICA SE O CONTATO JÁ EXISTE
                    let qry5 = `SELECT COUNT(*) as contatoExiste FROM meso_contatos WHERE nome = '${nome}';`;
                    let contatoExisteArray = await executaQry(qry5);
                    let contatoExiste = contatoExisteArray.dados[0].contatoExiste;



                    if (nome != 'template_plugphone2' && contatoExiste == 0) {
                        let qry4 = `INSERT INTO meso_contatos (nome, telefone) VALUES ('${nome}', '${waId}');`;
                        await executaQry(qry4);
                    }

                    // EMITE PARA O SOCKET
                    emitMensagem(io, nome, msg, waId);

                } catch (error) {
                    console.error("Erro ao processar botão:", error);
                }
            }
            else if (tudo.entry[0].changes[0].value.messages[0].type == 'image' && numRecebe == '551131646301') {
                try {
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value;

                    let type = mensagem.type;
                    let msg = mensagem.image.id;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);

                    // IGNORA mensagens antigas (mais de 10 segundos)
                    if (agora - timestamp > 10) return;

                    // VERIFICA se a imagem já foi processada
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return;

                    // INSERE NO BANCO
                    let qry = `
                        INSERT INTO meso_mensagens_solicitante 
                        (nome, whatsappid, mensagem, telefone, type, message_id) 
                        VALUES ('${nome}', '${waId}','${msg}.jpeg','${waId}','${type}', '${messageId}');
                    `;
                    await executaQry(qry);

                    // PEGA URL DA IMAGEM
                    let a = await api.get(`/pegaURL/${msg}`);
                    let url = a.data.url;

                    let bodyImage = {
                        "url": url,
                        "id": msg
                    };

                    await api.post(`/geraImage/`, bodyImage);

                    // PEGA BUFFER DA IMAGEM CONVERTIDA
                    let geraMidia = await api.get(`/get-image/${msg}.jpeg`, { responseType: 'arraybuffer' });

                    if (geraMidia.status === 200) {
                        const imageBuffer = Buffer.from(geraMidia.data, 'binary');
                        const base64Image = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;

                        // EMITE IMAGEM PARA O SOCKET
                        emitImage(io, nome, base64Image, waId);
                        let salva = { "msg": "imagem", "tel": waId };
                        await api.post("/atualizacontato", salva);


                    } else {
                        console.error('Erro ao obter a imagem:', geraMidia.status);
                    }

                } catch (error) {
                    console.error('Erro ao processar imagem:', error);
                }
            }
            else if (tudo.entry[0].changes[0].value.messages[0].type == 'audio' && numRecebe == '551131646301') {
                try {
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value;

                    let type = mensagem.type;
                    let msg = mensagem.audio.id;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);

                    // IGNORA mensagens antigas (mais de 10 segundos)
                    if (agora - timestamp > 10) return;

                    // VERIFICA se a mensagem já foi processada
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return;

                    // INSERE NO BANCO
                    let qry = `
                        INSERT INTO meso_mensagens_solicitante 
                        (nome, whatsappid, mensagem, telefone, type, message_id) 
                        VALUES ('${nome}', '${waId}','${msg}.mp3','${waId}','${type}', '${messageId}');
                    `;
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
                        await api.post("/atualizacontato", salva);
                        let qry4 = `update meso_contatos set estado = 'Aguardando Atendimento' where telefone like '%${waId}%';`
                        console.log('veia chata', qry4)
                        await executaQry(qry4)

                    } else {
                        console.error('Erro ao obter o áudio:', geraMidia.status);
                    }

                } catch (error) {
                    console.error('Erro ao processar áudio:', error);
                }
            }

            else if (tudo.entry[0].changes[0].value.messages[0].type == 'document' && numRecebe == '551131646301') {
                try {
                    let mensagem = tudo.entry[0].changes[0].value.messages[0];
                    let produto = tudo.entry[0].changes[0].value;

                    let type = mensagem.document.mime_type;
                    let msg = mensagem.id;
                    let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
                    let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
                    let messageId = mensagem.id;
                    let timestamp = parseInt(mensagem.timestamp);
                    let agora = Math.floor(Date.now() / 1000);

                    // IGNORA mensagens antigas (mais de 10 segundos)
                    if (agora - timestamp > 10) return;

                    // VERIFICA se a mensagem já foi processada
                    let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
                    let check = await executaQry(qryCheck);
                    if (check.dados[0].jaExiste > 0) return;

                    // INSERE NO BANCO
                    let qry = `
                        INSERT INTO meso_mensagens_solicitante 
                        (nome, whatsappid, mensagem, telefone, type, message_id) 
                        VALUES ('${nome}', '${waId}','${msg}.pdf','${waId}','${type}', '${messageId}');
                    `;
                    await executaQry(qry);

                    // EMITE PARA O SOCKET
                    emitMensagem(io, nome, msg, waId);
                    let salva = { "msg": "documento", "tel": waId };
                    await api.post("/atualizacontato", salva);


                } catch (error) {
                    console.error('Erro ao processar documento:', error);
                }
            }

        } else {
            ////console.log('mensagem enviada')
        }
    } else {
        let mensagem = tudo.entry[0].changes[0].value.messages[0];
        let produto = tudo.entry[0].changes[0].value;

        let type = mensagem.type;
        let msg = mensagem.text.body;
        let nome = tudo.entry[0].changes[0].value.contacts[0].profile.name;
        let waId = tudo.entry[0].changes[0].value.contacts[0].wa_id;
        let messageId = mensagem.id;
        let timestamp = parseInt(mensagem.timestamp);
        let agora = Math.floor(Date.now() / 1000);

        // IGNORA mensagens antigas (mais de 10 segundos)
        if (agora - timestamp > 10) return;

        // VERIFICA se a mensagem já foi processada
        let qryCheck = `SELECT COUNT(*) as jaExiste FROM meso_mensagens_solicitante WHERE message_id = '${messageId}'`;
        let check = await executaQry(qryCheck);
        if (check.dados[0].jaExiste > 0) return;

        let qry = `INSERT INTO meso_mensagens_solicitante 
        (nome, whatsappid, mensagem, telefone, type, visualizacao, message_id) 
        VALUES ('${nome}', '${waId}','${msg}','${waId}','${type}', '${visualização}', '${messageId}');`;
        await executaQry(qry);
        let qry5 = `select count(*) as contatoExiste from meso_contatos where nome = '${nome}';`

        ////console.log(qry5)
        let contatoExisteArray = await executaQry(qry5)

        let contatoExiste = contatoExisteArray.dados[0].contatoExiste


        ////console.log('Eu sou o contatoExiste', contatoExiste)
        let qry4 = `update meso_contatos set estado = 'Aguardando Atendimento' where telefone like '%${waId}%';`
        console.log('veia chata', qry4)
        await executaQry(qry4)

        if (nome != 'template_plugphone2' && contatoExiste == 0) {
            let qry4 = `insert into meso_contatos (nome, telefone ) VALUES ('${nome}', '${waId}');`
            ////console.log(qry4)
            await executaQry(qry4)
        }


        let template = "menu_plugphone"
        ////console.log(numeroWhatsapp)
        sendTemplateMenu(numeroWhatsapp, template, res)
    }
    ////else{////console.log('Jurassic world')}
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
    ////console.log(entry.changes[0].value.messages[0])
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
    ////console.log(req.query, hub);
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
    //console.log('dificil heim kkkkkkk', to, body, nome)
    let palavrao = await verificaPalavrao(body)
    //console.log('palavrão nãokkkkkkk', palavrao)
    if (palavrao) {
        let qry = `insert into meso_mensagens_banidas (nome, mensagem) VALUES ('${nome}', '${body}')`
        await executaQry(qry)
        res.json({ "dados": "mensagem não tolerada" });
    } else {
        //console.log('passei mesmo kkkkk')
        send(to, body, nome, res)
        res.json({ "dados": "mensagem enviada" });
    }
})

app.post("/sendimage", async (req, res) => {



    let to = req.body.to
    let id = req.body.id
    let link = req.body.link
    ////console.log(to, id, link, res)
    ////console.log('oque vem sem link', link)
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
    let name = 'template_plugphone2'
    let usuario = req.body.usuario

    ////console.log('eu sou o send template', to,name,usuario)

    sendTemplate(to, name, usuario, res)
})


app.post("/sendtemplateMenu", async (req, res) => {

    let to = req.body.to
    let name = req.body.name

    ////console.log('SHE KNOWS')

    sendTemplateMenu(to, name, res)
})

app.post("/senddocument", async (req, res) => {

    let to = req.body.to
    let id = req.body.id
    let link = req.body.link
    let filename = req.body.filename

    sendDocument(to, id, filename, res)
})
app.get("/gerarprotocolo/:status", async (req, res, next) => {

    ////console.log(v4())
    const id = v4(); // Gera um novo id
    let status = req.params.status


    let qry = `INSERT INTO meso_gravar_id (id,protocolo,dataInicio,status) VALUES (0,'${id}',now(),'${status}')`
    ////console.log(qry)

    let res1 = await executaQry(qry);
    res.json(res1)
    ////console.log(res1)
})

app.post("/criarlogin", async (req, res, next) => {
    let login = req.body.login
    let senha = req.body.senha
    let qry = `insert into meso_login (login, senha) values ('${login}', md5('${senha}'))`
    ////console.log(qry)

    let res1 = await executaQry(qry);
    res.json(res1)
    ////console.log(res1)
})


app.post("/login", async (req, res, next) => {
    let login = req.body.login
    let senha = req.body.senha
    let qry = `select login,senha from meso_login where login like '${login}' and senha like md5('${senha}');`
    ////console.log(qry)
    let res1 = await executaQry(qry);
    res.json(res1)
    ////console.log(res1)

})


app.use(bodyParser.json());

app.post('/registrar-token', async (req, res) => {
    const { token } = req.body;
    const { usuario } = req.body
    const tokenFunc = await funcToken(usuario);

    console.log("token e usuario aqui", token, usuario);

    if (token !== tokenFunc) {
        let qry = `update meso_usuariologin set token = '${token}' where usuario = '${usuario}'`;
        executaQry(qry);
        ////console.log("Token atualizado",qry);
    }
    res.status(200).send('Token registrado com sucesso!');
});

app.post('/registrar-tokenmobile', async (req, res) => {
    const { token } = req.body;
    const { usuario } = req.body

    console.log('auauau',token,usuario)

    const tokenFuncMobile = await funcTokenMobile (usuario);

    console.log("token e usuario aqui", token, usuario);

    if (token !== tokenFuncMobile) {
        let qry = `update meso_usuariologin set tokenMobile = '${token}' where usuario = '${usuario}'`;
        executaQry(qry);
        ////console.log("Token atualizado",qry);
    }
    res.status(200).send('Token registrado com sucesso!');
});


let funcToken = async function (nome) {
    let qry = `select token from meso_usuariologin where usuario = '${nome}';`;
    token = await executaQry(qry)
    let tokenFormatado = token.dados.length > 0 ? token.dados[0].token : "";
    return tokenFormatado
}

let funcTokenMobile = async function (nome) {
    let qry = `select tokenMobile from meso_usuariologin where usuario = '${nome}';`;
    token = await executaQry(qry)
    let tokenFormatado = token.dados.length > 0 ? token.dados[0].tokenMobile : "";
    return tokenFormatado
}

let pegatokenfire = async function (mensagem, nome, usuario, setor) {
    try {
        // Consulta para buscar todos os tokens válidos
        let qry = `select token,tokenMobile from meso_usuariologin where usuario = '${usuario}' or tipo = '${setor}' or tipo = 'admin';`;
        let resultado = await executaQry(qry);
        console.log('só pra verificar', qry);

        // Verifica se há tokens registrados
        if (!Array.isArray(resultado.dados) || resultado.dados.length === 0) { 
            ////console.log("Nenhum token encontrado para enviar a notificação.");
            return;
        }

        // Mapeia todos os tokens
        let tokens = resultado.dados.map((registro) => registro.token);

        // Define o limite de tokens por lote (Firebase suporta até 500 por vez)
        const MAX_TOKENS = 500;

        for (let i = 0; i < tokens.length; i += MAX_TOKENS) {
            // Divide os tokens em lotes de até 500
            const tokenBatch = tokens.slice(i, i + MAX_TOKENS);

            // Prepara o payload para cada lote
            const multicastMessage = {
                notification: {
                    title: nome,
                    body: mensagem,
                },
                android: {
                    notification: {
                        sound: 'notification.wav', // esse arquivo precisa estar em android/app/src/main/res/raw/
                        channelId: 'custom_sound_channel',
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: 'notification.wav', // esse arquivo precisa estar em ios/Runner e adicionado no Xcode
                        },
                    },
                },
                tokens: tokenBatch,
            };

            // Envia mensagens usando o método atualizado
            const response = await admin.messaging().sendEachForMulticast(multicastMessage);

            ////console.log(`Lote ${i / MAX_TOKENS + 1} enviado com sucesso:`, response.successCount);

            // Trata falhas específicas
            if (response.failureCount > 0) {
                ////console.log('Erros no lote:', response.responses.filter(r => !r.success));
                response.responses.forEach(async (res, idx) => {
                    if (!res.success) {
                        ////console.log(`Erro no token: ${tokenBatch[idx]}, motivo: ${res.error.message}`);
                        // Remove tokens inválidos ou expirados
                        if (res.error.code === 'messaging/registration-token-not-registered') {
                            ////console.log(`Removendo token inválido: ${tokenBatch[idx]}`);
                            let removeQry = `update meso_usuariologin set token = '' where token = '${tokenBatch[idx]}';`;
                            await executaQry(removeQry);
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error("Erro ao enviar notificações:", error.message);
        console.error("Detalhes do erro:", error);
    }
};



const { executaQry } = require("./db");

let emitMensagem = function (io, idEmpresa, nome, msg, telefone) {
    const room = `empresa:${idEmpresa}`;

    console.log("🚀 EMITINDO CHAT MESSAGE");
    console.log("room:", room);
    console.log("nome:", nome);
    console.log("msg:", msg);
    console.log("telefone:", telefone);

    io.to(room).emit('chat message', nome, msg, telefone);
};

let emitMensagem2 = function (io, idEmpresa, data) {
    const room = `empresa:${idEmpresa}`;
    io.to(room).emit(
        'chat_message_teste',
        data.nome,
        data.telefone,
        data.mensagem,
        data.agente,
        data.type,
        data.datetime
    );

    console.log('Mensagem enviada 2.0:', data, 'empresa:', idEmpresa);
};

let emitVideo = function (io, idEmpresa, nome, videoUrl, telefone) {
    const room = `empresa:${idEmpresa}`;
    io.to(room).emit('chat video', nome, videoUrl, telefone);

    console.log('video enviado:', nome, videoUrl, telefone, 'empresa:', idEmpresa);
};

let emitImage = function (io, idEmpresa, nome, imageBuffer, telefone) {
    const room = `empresa:${idEmpresa}`;
    io.to(room).emit('chat image', nome, imageBuffer, telefone);

    console.log('imagem enviada:', nome, telefone, 'empresa:', idEmpresa);
};

let emitAudio = function (io, idEmpresa, nome, audioBuffer, telefone) {
    const room = `empresa:${idEmpresa}`;
    io.to(room).emit('chat audio', nome, audioBuffer, telefone);

    console.log('audio enviado:', nome, telefone, 'empresa:', idEmpresa);
};

let emitDocument = function (io, idEmpresa, nome, documentBuffer) {
    const room = `empresa:${idEmpresa}`;
    io.to(room).emit('chat document', nome, documentBuffer);

    console.log('documento enviado:', nome, 'empresa:', idEmpresa);
};

async function cadastrarMensagem(msg) {
    console.log('buraco profundo', msg);

    let qry = `insert into meso_mensagens_solicitante 
        (telefone, nome, agent, wpnumber, mensagem, type) 
        values ('${msg.telefone}','${msg.nome}','${msg.agente}','551131646301','${msg.mensagem}','${msg.type}')`;

    await executaQry(qry);
}

async function emitContatosFlutter(io, idEmpresa, estado, usuario, setor) {
    console.log('estado campanha baralho', estado, usuario, setor);

    let qry;

    if (setor === 'admin') {
        qry = `SELECT * FROM meso_contatos WHERE id_empresa = ${idEmpresa} ORDER BY datahora DESC`;
    } else {
        const usuarioFiltro = usuario == null
            ? `usuario IS NULL`
            : `usuario = '${usuario}'`;

        qry = `
            SELECT * FROM meso_contatos
            WHERE ${usuarioFiltro}
            AND setor = '${setor}'
            AND id_empresa = ${idEmpresa}
            ORDER BY datahora DESC
        `;
    }

    let contatos = await executaQry(qry);

    const room = `empresa:${idEmpresa}`;
    io.to(room).emit('contatos', contatos.dados);

    console.log("Contatos enviados empresa:", idEmpresa);
}

module.exports = {
    emitMensagem,
    emitImage,
    emitAudio,
    emitDocument,
    cadastrarMensagem,
    emitContatosFlutter,
    emitMensagem2,
    emitVideo
};

const { executaQry } = require("./db");

let emitMensagem = function (socket, nome, msg, telefone) {
    socket.emit('chat message', nome, msg, telefone)
    console.log('Mensagem enviada:', nome, msg, telefone);

}

let emitImage = function (socket, nome, imageBuffer, telefone) {
    socket.emit('chat image', nome, imageBuffer, telefone);
    //console.log('Imagem enviada:', nome, telefone);
};

let emitAudio = function (socket, nome, audioBuffer, telefone) {
    socket.emit('chat audio', nome, audioBuffer, telefone);
    console.log('audio enviado:', nome);
};

let emitDocument = function (socket, nome, documentBuffer) {
    socket.emit('chat document', nome, documentBuffer)
    console.log('documento enviado:', nome)
}

async function cadastrarMensagem(msg) {
    console.log('buraco profundo', msg)
    let qry = `insert into meso_mensagens_solicitante 
        (telefone, nome, agent, wpnumber, mensagem, type) 
        values ('${msg.telefone}','${msg.nome}','${msg.agente}','551131646301','${msg.mensagem}','${msg.type}')`;

    await executaQry(qry);
}

async function emitContatosFlutter(socket, estado, usuario, setor) {
    console.log('estado campanha baralho', estado, usuario, setor)
    let qry
    if (setor === 'admin') {
        qry = `SELECT * FROM meso_contatos ORDER BY datahora DESC`
    } else {
        // Usuário comum
        const usuarioFiltro = usuario == null
            ? `usuario IS NULL`
            : `usuario = '${usuario}'`;

        qry = `
            SELECT * FROM meso_contatos
            WHERE ${usuarioFiltro}
            AND setor = '${setor}'
            ORDER BY datahora DESC
        `;
    }

    console.log('Tá de brincadeira comigo né?', qry)
    let contatos = await executaQry(qry);
    console.log("Chamou o buscar-contato ", contatos.dados);
    socket.emit('contatos', contatos.dados);
}

module.exports = { emitMensagem, emitImage, emitAudio, emitDocument, cadastrarMensagem, emitContatosFlutter };


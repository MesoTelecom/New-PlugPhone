const { executaQry } = require("./db");
const { cadastrarMensagem, emitMensagem } = require("./emit");
let ioGlobal; // escopo de módulo

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function buscarMensagem(telefone) {
  if (!ioGlobal) return;

  ////console.log("⏳ Aguardando 500ms antes do SELECT...");
  await sleep(500); // <- espera meio segundo

  const qry = `SELECT * FROM meso_mensagens_solicitante WHERE telefone = '${telefone}'`;
  const mensagens = await executaQry(qry);
  console.log("Me mostre as 20 mensagens", mensagens)
  ioGlobal.emit("mensagens", mensagens.dados || []);
}

async function emitirContatosAtualizados(io, data) {
  ////console.log("data recebida:", data);
  let agrupados = [];

  const estadosValidos = [
    'Novo',
    'Aguardando Atendimento',
    'Concluído',
  ];

  let qry = '';

  //console.log("Oq tem na data", data)

  // 🔍 Com filtro de texto
  if (data?.valorTexto != null && data?.valorTexto !== '') {

    qry = `SELECT * FROM meso_contatos where nome like '%${data.valorTexto}%' or telefone like '%${data.valorTexto}%' or email like '%${data.valorTexto}%' ORDER BY datahora DESC`
  }
  // 📦 Sem filtro de texto (carrega todos)
  else {
    qry = `SELECT * FROM meso_contatos ORDER BY datahora DESC`
  }

  const contatosValor = await executaQry(qry);

  //console.log("Query executada:", qry);
  ////console.log("Resultado dos contatos:", contatosValor);

  // 🔀 Agrupando por estado
  agrupados = {
    'Todos': contatosValor.dados,
    'Novo': [],
    'Aguardando Atendimento': [],
    'Concluído': []
  };

  contatosValor.dados.forEach(element => {
    if (estadosValidos.includes(element.estado)) {
      agrupados[element.estado].push({ ...element });
    }
  });

  io.emit("contatos", agrupados);
}


let socketConnection = function (io) {
  ioGlobal = io;
  io.on("connection", async (socket) => {
console.log("🟢 Usuário conectado:", socket.id);

	  socket.on('disconnect', (reason) => {
		  console.log("🔴 Usuário desconectado:", socket.id, "— Motivo:", reason);

	  });

	  socket.on("reconnect", attempt => {
  console.log(`🔄 Reconnectou na tentativa ${attempt}:`, socket.id)
});

    socket.on("create-message", async (msg) => {
      ////console.log("📩 Nova mensagem recebida:", msg);

      try {

        const agora = new Date();
        const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(agora);


        io.emit("receive-message", [msg.telefone, msg.nome, msg.agente, '551131646301', msg.mensagem, msg.type, horaFormatada]);
        ////console.log("📤 Mensagem emitida para todos:", [msg.telefone, msg.nome, msg.agente, '551131646301', msg.mensagem, msg.type, horaFormatada]);
      } catch (error) {
        ////console.error("❌ Erro ao processar 'create-message':", error);
      }
    });

    socket.on("read-mensagem", async (msg) => {
      ////console.log("Cadastrando mensagem no banco:", msg);
      try {
        let contato = await executaQry(`SELECT c.*, COUNT(m.id) AS total_mensagens FROM meso_contatos AS c INNER JOIN meso_mensagens_solicitante AS m    ON c.telefone = m.telefone WHERE c.telefone = '${msg.telefone}' and m.visualizacao = 'not read' GROUP BY c.id;`)
        ////console.log("contato atualizado", `SELECT c.*, COUNT(m.id) AS total_mensagens FROM meso_contatos AS c INNER JOIN meso_mensagens_solicitante AS m    ON c.telefone = m.telefone WHERE c.telefone = '${msg.telefone}' and m.visualizacao = 'not read' GROUP BY c.id;`)
        ////console.log("contato enviado", contato.dados);
        io.emit("contatos-novo", contato.dados || []);
        ////console.log("✅ Mensagem cadastrada com sucesso");
      } catch (error) {
        ////console.error("❌ Erro ao cadastrar mensagem:", error);
      }
    });

    socket.on("buscar-contato", async (data) => {
      ////console.log("data aqui no buscar contato", data)
      try {
        await emitirContatosAtualizados(io, data);
     console.log("OLha a data dos contatos", data)
      } catch (error) {
        ////console.error("❌ Erro ao buscar contatos:", error);
      }
    });

    socket.on('send Message', (dados) => {
      ////console.log('📩 Dados recebidos:', dados);

      let nome = dados.usuario
      let telefone = dados.numero
      let mensagem = dados.umaMensagem
      // Se quiser, pode reenviar para todos os outros clientes


      emitMensagem(io, nome, mensagem, telefone)
    });

    socket.on('atualizar-visualizacao', async (telefone) => {
      let qry1 = `select count(*) as total from meso_mensagens_solicitante where telefone = '${telefone}' and visualizacao = 'not read'`
      let total = await executaQry(qry1)

      ////  console.log('Teu rabo tem mais espaço', total.dados[0].total > 0)

      if (total.dados[0].total > 0) {
        let qry = `update meso_mensagens_solicitante set visualizacao = 'read' where telefone = '${telefone}'`
        ////   console.log("oq tem aqui???", qry)
        await executaQry(qry)
      }

    });

    socket.on("buscar-mensagens", async (data) => {
      //.log("Não ao aborto", data)
      try {
        let qry = `
      SELECT * 
      FROM meso_mensagens_solicitante
      WHERE telefone = '${data.telefone}' order by id desc limit ${data.limit} offset ${data.offset}
    `;


        console.log("me mostra o qry", qry)

        const mensagens = await executaQry(qry);

        console.log("me mostra a data do mensagens", data);

        // console.log('mensagens.dados', mensagens.dados)
        ////console.log('mensagens.dados', mensagens.dados.length)

        socket.emit("mensagens", { "dados": mensagens.dados || [], "offset": data.offset });
      } catch (error) {
        ////console.error("❌ Erro ao buscar mensagens:", error);
      }
    });

    socket.on('esta-logado-mobile', async (setor) => {
      let qry = `select logadoWeb,logadoMobile,usuario from meso_usuariologin where tipo = '${setor}'`
      let isLogado = await executaQry(qry);
      io.emit("islogado", isLogado.dados || []);
    })

    socket.on('buscar-dados-contato', async (telefone) => {
      let qry = `select nome,telefone,empresa,email,usuario,setor from meso_contatos  where telefone = '${telefone}'`
      let dadosContato = await executaQry(qry)
      ////console.log("dados do contato", dadosContato)
      io.emit('dados-contato', dadosContato.dados || []);
    });

    socket.on("buscar-quantidade-contatos", async (data) => {
      try {
        let qry;

        if (data.tipo == 'admin') {

          if (data.valorTexto != '' && data.valorTexto != null) {

            qry = `
          SELECT estado, SUM(quantContatos) AS quantContatos FROM (
            SELECT estado, COUNT(*) AS quantContatos
            FROM meso_contatos
            WHERE estado IS NOT NULL
              AND estado != 'Aguardando Cliente'
              AND nome LIKE '%${data.valorTexto}%'
            GROUP BY estado

            UNION ALL
            SELECT 'Todos', COUNT(*)
            FROM meso_contatos
            WHERE estado IS NOT NULL
              AND estado != 'Aguardando Cliente'
              AND nome LIKE '%${data.valorTexto}%'

            UNION ALL SELECT 'Novo', 0
            UNION ALL SELECT 'Aguardando Atendimento', 0
            UNION ALL SELECT 'Concluído', 0
          ) AS dados
          GROUP BY estado
          ORDER BY FIELD(estado, 'Todos', 'Novo', 'Aguardando Atendimento', 'Concluído');
        `;

          } else {

            qry = `
          SELECT estado, SUM(quantContatos) AS quantContatos FROM (
            SELECT estado, COUNT(*) AS quantContatos
            FROM meso_contatos
            WHERE estado IS NOT NULL
              AND estado != 'Aguardando Cliente'
            GROUP BY estado

            UNION ALL
            SELECT 'Todos', COUNT(*)
            FROM meso_contatos
            WHERE estado IS NOT NULL
              AND estado != 'Aguardando Cliente'

            UNION ALL SELECT 'Novo', 0
            UNION ALL SELECT 'Aguardando Atendimento', 0
            UNION ALL SELECT 'Concluído', 0
          ) AS dados
          GROUP BY estado
          ORDER BY FIELD(estado, 'Todos', 'Novo', 'Aguardando Atendimento', 'Concluído');
        `;
          }

        } else {
          // USUÁRIO
          if (data.valorTexto != '' && data.valorTexto != null) {

            qry = `
          SELECT estado, SUM(quantContatos) AS quantContatos 
          FROM (
            SELECT estado, COUNT(*) AS quantContatos
            FROM meso_contatos
            WHERE estado IS NOT NULL
              AND estado != 'Aguardando Cliente'
              AND (usuario LIKE '%${data.usuario}%' OR usuario IS NULL)
              ${data.tipo ? `AND setor = '${data.tipo}'` : ''}
              AND nome LIKE '%${data.valorTexto}%'
            GROUP BY estado

            UNION ALL
            SELECT 'Todos', COUNT(*)
            FROM meso_contatos
            WHERE estado IS NOT NULL
              AND estado != 'Aguardando Cliente'
              AND (usuario LIKE '%${data.usuario}%' OR usuario IS NULL)
              ${data.tipo ? `AND setor = '${data.tipo}'` : ''}
              AND nome LIKE '%${data.valorTexto}%'

            UNION ALL SELECT 'Novo', 0
            UNION ALL SELECT 'Aguardando Atendimento', 0
            UNION ALL SELECT 'Concluído', 0
          ) AS dados
          GROUP BY estado
          ORDER BY FIELD(estado, 'Todos', 'Novo', 'Aguardando Atendimento', 'Concluído');
        `;

          } else {

            qry = `
          SELECT estado, SUM(quantContatos) AS quantContatos 
          FROM (
            SELECT estado, COUNT(*) AS quantContatos
            FROM meso_contatos
            WHERE estado IS NOT NULL
              AND estado != 'Aguardando Cliente'
              AND (usuario LIKE '%${data.usuario}%' OR usuario IS NULL)
              ${data.tipo ? `AND setor = '${data.tipo}'` : ''}
            GROUP BY estado

            UNION ALL
            SELECT 'Todos', COUNT(*)
            FROM meso_contatos
            WHERE estado IS NOT NULL
              AND estado != 'Aguardando Cliente'
              AND (usuario LIKE '%${data.usuario}%' OR usuario IS NULL)
              ${data.tipo ? `AND setor = '${data.tipo}'` : ''}

            UNION ALL SELECT 'Novo', 0
            UNION ALL SELECT 'Aguardando Atendimento', 0
            UNION ALL SELECT 'Concluído', 0
          ) AS dados
          GROUP BY estado
          ORDER BY FIELD(estado, 'Todos', 'Novo', 'Aguardando Atendimento', 'Concluído');
        `;
          }
        }

        const quantContatos = await executaQry(qry);
        io.emit("quantidade-contatos", quantContatos.dados || []);

      } catch (error) {
        console.error("❌ Erro ao buscar quantidade de contatos:", error);
      }
    });

  });
};

module.exports = { socketConnection, buscarMensagem, emitirContatosAtualizados };








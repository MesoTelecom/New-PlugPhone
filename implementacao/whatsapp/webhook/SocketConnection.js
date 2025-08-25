const { executaQry } = require("./db");
const { cadastrarMensagem } = require("./emit");
let ioGlobal; // escopo de módulo

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function buscarMensagem(telefone) {
  if (!ioGlobal) return;

  //console.log("⏳ Aguardando 500ms antes do SELECT...");
  await sleep(500); // <- espera meio segundo

  const qry = `SELECT * FROM meso_mensagens_solicitante WHERE telefone = '${telefone}'`;
  const mensagens = await executaQry(qry);

  ioGlobal.emit("mensagens", mensagens.dados || []);
}

async function emitirContatosAtualizados(io) {
  const contatosValor = await executaQry(`SELECT * FROM meso_contatos ORDER BY datahora DESC`);

  const estadosValidos = ['Novo', 'Aguardando Cliente', 'Aguardando Atendimento', 'Concluido'];
  const agrupados = {
    'Todos': contatosValor.dados,
    'Novo': [],
    'Aguardando Cliente': [],
    'Aguardando Atendimento': [],
    'Concluido': []
  };

  contatosValor.dados.forEach(element => {
    if (estadosValidos.includes(element.estado)) {
      agrupados[element.estado].push({ ...element });
    }
  });

  io.emit("contatos", agrupados); // usa o io recebido
}

let socketConnection = function (io) {
  ioGlobal = io;
  io.on("connection", async (socket) => {
    //console.log("🟢 Usuário conectado:", socket.id);

    socket.on("create-message", async (msg) => {
      ////console.log("📩 Nova mensagem recebida:", msg);

      try {
        await cadastrarMensagem(msg);

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
        ////  //console.log("📤 Mensagem emitida para todos:", [msg.telefone, msg.nome, msg.agente, '551131646301', msg.mensagem, msg.type, horaFormatada]);
      } catch (error) {
        //console.error("❌ Erro ao processar 'create-message':", error);
      }
    });

    socket.on("buscar-contato", async () => {
      try {
        await emitirContatosAtualizados(io);
      } catch (error) {
        //console.error("❌ Erro ao buscar contatos:", error);
      }
    });



    socket.on("buscar-mensagens", async (telefone) => {
      try {
        //console.log("🔎 Buscando mensagens para telefone:", telefone);

        const qry = `SELECT * FROM meso_mensagens_solicitante WHERE telefone = '${telefone}' and datetime >= '2025-07-14 00:00:00'`;
        const mensagens = await executaQry(qry);
        console.log('Minhas mensagens aqui por favor', mensagens)
        //console.log('Tá melhorando tá ficando até educado');
        //console.log('Tá melhorando o caralho fdp')
        //console.log("Falei cedo demais")

        io.emit("mensagens", mensagens.dados || []);
      } catch (error) {
        console.error("❌ Erro ao buscar mensagens:", error);
      }
    });

    socket.on("buscar-quantidade-contatos", async (data) => {
      try {
        ////console.log("📊 Buscando quantidade de contatos para:", data.estado);

        let qry;

        ////console.log("Mama eu", data)

        if (data.tipo == 'admin') {
          qry = `
            SELECT estado, SUM(quantContatos) AS quantContatos FROM (
              SELECT estado, COUNT(*) AS quantContatos 
              FROM meso_contatos 
              GROUP BY estado
        
              UNION ALL 
              SELECT 'Todos', COUNT(*) 
              FROM meso_contatos 
        
              UNION ALL SELECT 'Novo', 0
              UNION ALL SELECT 'Aguardando Cliente', 0
              UNION ALL SELECT 'Aguardando Atendimento', 0
              UNION ALL SELECT 'Concluido', 0
            ) AS dados
            GROUP BY estado
            ORDER BY FIELD(estado, 'Todos', 'Novo', 'Aguardando Cliente', 'Aguardando Atendimento', 'Concluido');
          `;
        } else {
          qry = `
            SELECT estado, SUM(quantContatos) AS quantContatos FROM (
              SELECT estado, COUNT(*) AS quantContatos 
              FROM meso_contatos 
              WHERE (usuario = '${data.usuario}' OR usuario IS NULL)
                ${data.tipo ? `AND setor = '${data.tipo}'` : ''}
              GROUP BY estado
        
              UNION ALL 
              SELECT 'Todos', COUNT(*) 
              FROM meso_contatos 
              WHERE (usuario = '${data.usuario}' OR usuario IS NULL)
                ${data.tipo ? `AND setor = '${data.tipo}'` : ''}
        
              UNION ALL SELECT 'Novo', 0
              UNION ALL SELECT 'Aguardando Cliente', 0
              UNION ALL SELECT 'Aguardando Atendimento', 0
              UNION ALL SELECT 'Concluido', 0
            ) AS dados
            GROUP BY estado
            ORDER BY FIELD(estado, 'Todos', 'Novo', 'Aguardando Cliente', 'Aguardando Atendimento', 'Concluido');
          `;
        }
        //// console.log('me mostrar o select esquisito', qry)


        const quantContatos = await executaQry(qry);
        ////console.log("Oq retorna", qry)
        io.emit("quantidade-contatos", quantContatos.dados || []);
      } catch (error) {
        //console.error("❌ Erro ao buscar quantidade de contatos:", error);
      }
    });
  });
};

module.exports = { socketConnection, buscarMensagem,emitirContatosAtualizados };



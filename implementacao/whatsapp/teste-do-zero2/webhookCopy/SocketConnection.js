const { executaQry } = require("./db");
const { cadastrarMensagem } = require("./emit");
const dadosSocket = require('./chace/filtro')
let ioGlobal;

let socketConnection = function (io) {
  ioGlobal = io;
  io.on("connection", async (socket) => {
    console.log("🟢 Usuário conectado:", socket.id);

    socket.on("create-message", async (msg) => {
      //console.log("📩 Nova mensagem recebida:", msg);

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
        //  //console.log("📤 Mensagem emitida para todos:", [msg.telefone, msg.nome, msg.agente, '551131646301', msg.mensagem, msg.type, horaFormatada]);
      } catch (error) {
        //console.error("❌ Erro ao processar 'create-message':", error);
      }
    });

    socket.on("buscar-contato", async () => {
      try {
        console.log("minha data")
        let qryContatos = `select * from meso_contatos order by datahora desc`
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
            //console.log('Estado desconhecido ou não tratado:', estado);
          }
        });
        console.log("me mostra os contatos", agrupados)
        io.emit("contatos", agrupados);
      } catch (error) {
        //console.error("❌ Erro ao buscar contatos:", error);
      }
    });

    socket.on("buscar-mensagens", async (telefone) => {
      try {
        //console.log("🔎 Buscando mensagens para telefone:", telefone);

        const qry = `SELECT * FROM meso_mensagens_solicitante WHERE telefone = '${telefone}'`;
        const mensagens = await executaQry(qry);

        io.emit("mensagens", mensagens.dados || []);
      } catch (error) {
        //console.error("❌ Erro ao buscar mensagens:", error);
      }
    });

    socket.on("buscar-quantidade-contatos", async (data) => {
      try {
        //console.log("📊 Buscando quantidade de contatos para:", data.estado);

        let qry;

        console.log("Mama eu", data)

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
        console.log('me mostrar o select esquisito', qry)


        const quantContatos = await executaQry(qry);
        //console.log("Oq retorna", qry)
        io.emit("quantidade-contatos", quantContatos.dados || []);
      } catch (error) {
        //console.error("❌ Erro ao buscar quantidade de contatos:", error);
      }
    });
  });
};

module.exports = { socketConnection };



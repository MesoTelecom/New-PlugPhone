const { executaQry } = require("./db");
const { cadastrarMensagem, emitMensagem } = require("./emit");
let ioGlobal; // escopo de módulo

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



async function buscarMensagem(data) {
  //console.log("Vou te mostrar a data", data);
  if (!ioGlobal) return;

  ////////console.log("⏳ Aguardando 500ms antes do SELECT...");
  await sleep(500); // <- espera meio segundo

  const qry = `SELECT * FROM meso_mensagens_solicitante WHERE telefone = '${data.telefone}' and id_empresa = ${data.idEmpresa} `;
  const mensagens = await executaQry(qry);
  ////  //console.log("Me mostre as 20 mensagens", mensagens)
  ioGlobal.emit("mensagens", mensagens.dados || []);
}

async function emitirContatosAtualizados(io, data) {
  ////////console.log("data recebida:", data);



  let agrupados = [];



  const estadosValidos = [
    'Novo',
    'Aguardando Atendimento',
    'Concluído',
  ];


  //console.log("Olha a data do contato", data)

  let qry = '';

  //////console.log("Oq tem na data", data)



  // 🔍 Com filtro de texto
  if (data?.valorTexto != null && data?.valorTexto !== '') {



    qry = `
SELECT *
FROM meso_contatos c
WHERE c.id_empresa = ${data.idEmpresa}
  AND (
        c.nome      LIKE '%${data.valorTexto}%'
     OR c.telefone  LIKE '%${data.valorTexto}%'
     OR c.email     LIKE '%${data.valorTexto}%'
     OR EXISTS (
          SELECT 1
          FROM meso_mensagens_solicitante m
          WHERE m.telefone = c.telefone
            AND m.id_empresa = ${data.idEmpresa}
            AND m.mensagem LIKE '%${data.valorTexto}%'
     )
  )
ORDER BY c.datahora DESC
`;
    console.log("Oq tem na qry do filtro de texto", qry)

  }
  // 📦 Sem filtro de texto (carrega todos)
  else {

    qry = `SELECT * FROM meso_contatos where id_empresa = ${data.idEmpresa} ORDER BY datahora DESC`

    console.log('Meu select está aqui', qry)

  }



  const contatosValor = await executaQry(qry);



  console.log("Query executada:", qry);
  //////console.log("Resultado dos contatos:", contatosValor);



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


  console.log(`Olha oq ta errado aqui 'empresa:${data.idEmpresa}'`)


  io.to(`empresa:${data.idEmpresa}`).emit("contatos", agrupados);


}


let socketConnection = function (io) {
  ioGlobal = io;
  // 🧹 LIMPA TODAS AS CONEXÕES ANTIGAS ANTES DE PERMITIR NOVAS
  ////  //console.log("🧹 Limpando conexões antigas antes de registrar novos sockets…");

  for (const [id, socket] of io.sockets.sockets) {
    ////  //console.log("🔴 Derrubando socket antigo:", id);
    socket.disconnect(true); // força desconexão total
  }

  io.on("connection", async (socket) => {
    console.log("🟢 Usuário conectado:", socket.id);

    socket.on("join-empresa", (idEmpresa) => {
      console.log('eu entrei aqui', socket.id)
      if (!idEmpresa) return;

      const room = `empresa:${idEmpresa}`;
      socket.join(room);
      console.log("RUBINHO!!!!", room);

      socket.data.idEmpresa = idEmpresa;

      console.log("Socket entrou na empresa:", room);

      socket.emit("joined-empresa", { room });
    });

    socket.on("join-chat", (data) => {
      const room = `chat:${data.idEmpresa}:${data.telefone}`;
      socket.join(room);
      console.log(`conectado na sala ${room} com id ${data.idEmpresa} e telefone ${data.telefone}`)
      socket.emit("joined-chat",
        {
          "room": room,
          "idEmpresa": data.idEmpresa,
          "telefone": data.telefone
        });
    });


    socket.on('disconnect', (reason) => {
      console.log("🔴 Usuário desconectado:", socket.id, "— Motivo:", reason);

    });

    socket.on("reconnect", attempt => {
      ////console.log(`🔄 Reconnectou na tentativa ${attempt}: `, socket.id)
    });

    socket.on("create-message", async (msg) => {
      console.log("📩 Nova mensagem recebida:", msg);

      try {

        socket.join(`chat:${msg.idEmpresa}:${msg.telefone}`);

        const agora = new Date();
        const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(agora);

        io.to(`chat:${idEmpresa}:${msgEnviada.telefone}`).emit("receive-message", [msg.telefone, msg.nome, msg.agente, '551131646301', msg.mensagem, msg.type, horaFormatada]);
        ////////console.log("📤 Mensagem emitida para todos:", [msg.telefone, msg.nome, msg.agente, '551131646301', msg.mensagem, msg.type, horaFormatada]);
      } catch (error) {
        //////console.error("❌ Erro ao processar 'create-message':", error);
      }
    });

    socket.on("read-mensagem", async (msg) => {
      ////////console.log("Cadastrando mensagem no banco:", msg);
      try {
        let contato = await executaQry(`SELECT c.*, COUNT(m.id) AS total_mensagens FROM meso_contatos AS c INNER JOIN meso_mensagens_solicitante AS m    ON c.telefone = m.telefone WHERE c.telefone = '${msg.telefone}' and m.visualizacao = 'not read' GROUP BY c.id; `)
        ////////console.log("contato atualizado", `SELECT c.*, COUNT(m.id) AS total_mensagens FROM meso_contatos AS c INNER JOIN meso_mensagens_solicitante AS m    ON c.telefone = m.telefone WHERE c.telefone = '${msg.telefone}' and m.visualizacao = 'not read' GROUP BY c.id; `)
        ////////console.log("contato enviado", contato.dados);
        io.to(`empresa:${msg.idEmpresa}`).emit("contatos-novo", contato.dados || []);
        ////////console.log("✅ Mensagem cadastrada com sucesso");
      } catch (error) {
        //////console.error("❌ Erro ao cadastrar mensagem:", error);
      }
    });

    socket.on("buscar-contato", async (data) => {
      console.log("data aqui no buscar contato", data)
      try {

        await emitirContatosAtualizados(io, data);

        ////    //console.log("OLha a data dos contatos", data)
      } catch (error) {

        //console.error("❌ Erro ao buscar contatos:", error);
      }
    });

    socket.on('send Message', (dados) => {
      ////////console.log('📩 Dados recebidos:', dados);

      let nome = dados.usuario
      let telefone = dados.numero
      let mensagem = dados.umaMensagem
      // Se quiser, pode reenviar para todos os outros clientes


      emitMensagem(io, nome, mensagem, telefone)
    });

    socket.on('atualizar-visualizacao', async (telefone) => {
      let qry1 = `select count(*) as total from meso_mensagens_solicitante where telefone = '${telefone}' and visualizacao = 'not read'`
      let total = await executaQry(qry1)

      //////  //console.log('Teu rabo tem mais espaço', total.dados[0].total > 0)

      if (total.dados[0].total > 0) {
        let qry = `update meso_mensagens_solicitante set visualizacao = 'read' where telefone = '${telefone}'`
        //////   //console.log("oq tem aqui???", qry)
        await executaQry(qry)
      }

    });

    socket.on("buscar-mensagens", async (data) => {
      try {
        socket.join(`chat:${data.idEmpresa}:${data.telefone}`);

        let qry55 = `select telefone from meso_empresas where id_empresa = '${data.idEmpresa}'`;
        console.log("Consulta da empresa:", qry55);
        let empresa = await executaQry(qry55);

        if (!empresa?.dados?.length) {
          console.log('Não veio');
        }

        let wpnumber = empresa.dados[0].telefone;

        let qry
        let offset = '';

        if (data.idMensagem == '') {
          qry = `select * from meso_mensagens_solicitante where telefone = '${data.telefone}' and wpnumber = ${wpnumber} order by id desc limit 20`
          offset = '0';
        } else if (data.primeiroIdMensagem != '' && data.ultimoIdMensagem != '') {
          qry = `select * from meso_mensagens_solicitante where telefone = '${data.telefone}' and wpnumber = ${wpnumber} and id >= ${data.ultimoIdMensagem} and id <= ${data.primeiroIdMensagem} order by id desc`
          offset = '0';
        } else {
          qry = `select * from meso_mensagens_solicitante where telefone = '${data.telefone}' and wpnumber = ${wpnumber} and id <= ${data.idMensagem} order by id desc limit 20`
        }

        console.log("Olha minha qry", qry)
        console.log("Olha minha data", data)

        const mensagens = await executaQry(qry);

        io.to(`chat:${data.idEmpresa}:${data.telefone}`).emit("mensagens", {
          dados: mensagens.dados || [],
          offset: offset,
          lastId: mensagens.dados?.length
            ? mensagens.dados[mensagens.dados.length - 1].id
            : null
        });

      } catch (error) {
        //console.error("❌ Erro ao buscar mensagens:", error);
      }
    });


    socket.on("pesquisa-mensagem", async (data) => {
      socket.join(`chat:${data.idEmpresa}:${data.telefone}`);
      ////console.log("entrou na pesquisa")
      let qry = `select id, telefone, mensagem, datetime from meso_mensagens_solicitante where mensagem like '%${data.mensagem}%' and id_empresa = '${data.idEmpresa}' and telefone = '${data.telefone}' and wpnumber = (select telefone from meso_empresas where id_empresa = ${data.idEmpresa}) order by id desc`
      let mensagem = await executaQry(qry)
      console.log("meu mostra o pesquisa mensagem", qry)
      console.log("Me mostra a data aqui", data)
      io.to(`chat:${data.idEmpresa}:${data.telefone}`).emit("mensagem-encontrada", mensagem.dados)
    })

    // socket.on("pega-posicao-mensagem", async (data) => {
    //   ////console.log("entrou na quantidade mensagens")
    //   let qryCount = `select count(*) as total from meso_mensagens_solicitante where telefone = '${data.telefone}' and id_empresa = '${data.idEmpresa}'`
    //   let quantidadeMensagemCount = await executaQry(qryCount)
    //   let qry = `select count(*) as posicao from meso_mensagens_solicitante where telefone = '${data.telefone}' and id_empresa = '${data.idEmpresa}' and id <= ${data.idMensagem} `
    //   let quantidadeMensagem = await executaQry(qry)
    //   //console.log("Me mostra o qry", qry)
    //   //console.log("Não olhe pra mim", quantidadeMensagem, 'Agora olhe pra mim', quantidadeMensagemCount)

    //   let concatenado = {
    //     "Total": quantidadeMensagemCount.dados[0].total,
    //     "Posicao": quantidadeMensagem.dados[0].posicao
    //   }

    //   //console.log("Olha o concatenado", concatenado)

    //   socket.emit("posicao-mensagem", concatenado)
    // })

    socket.on('esta-logado-mobile', async (setor) => {
      let qry = `select logadoWeb, logadoMobile, usuario from meso_usuariologin where tipo = '${setor}'`
      let isLogado = await executaQry(qry);
      io.emit("islogado", isLogado.dados || []);
    })

    socket.on('buscar-dados-contato', async (telefone) => {
      let qry = `select nome, telefone, empresa, email, usuario, setor from meso_contatos  where telefone = '${telefone}'`
      let dadosContato = await executaQry(qry)
      ////////console.log("dados do contato", dadosContato)
      io.emit('dados-contato', dadosContato.dados || []);
    });

    socket.on("buscar-quantidade-contatos", async (data) => {
      ////console.log("Oq tem na data da quantidade de contatos", data);
      try {
        let qry;

        if (data.tipo == 'admin') {

          if (data.valorTexto != '' && data.valorTexto != null) {

            qry = `SELECT estado, SUM(quantContatos) AS quantContatos 
FROM(
    SELECT c.estado, COUNT(*) AS quantContatos
    FROM meso_contatos c
    WHERE c.estado IS NOT NULL
      AND c.estado != 'Aguardando Cliente'
      AND c.id_empresa = ${data.idEmpresa}
      AND (
            c.nome      LIKE '%${data.valorTexto}%'
         OR c.telefone  LIKE '%${data.valorTexto}%'
         OR c.email     LIKE '%${data.valorTexto}%'
         OR EXISTS (
              SELECT 1
              FROM meso_mensagens_solicitante m
              WHERE m.telefone = c.telefone
                AND m.id_empresa = ${data.idEmpresa}
                AND m.mensagem LIKE '%${data.valorTexto}%'
         )
      )
    GROUP BY c.estado

    UNION ALL

    SELECT 'Todos', COUNT(*)
    FROM meso_contatos c
    WHERE c.estado IS NOT NULL
      AND c.estado != 'Aguardando Cliente'
      AND c.id_empresa = ${data.idEmpresa}
      AND (
            c.nome      LIKE '%${data.valorTexto}%'
         OR c.telefone  LIKE '%${data.valorTexto}%'
         OR c.email     LIKE '%${data.valorTexto}%'
         OR EXISTS (
              SELECT 1
              FROM meso_mensagens_solicitante m
              WHERE m.telefone = c.telefone
                AND m.id_empresa = ${data.idEmpresa}
                AND m.mensagem LIKE '%${data.valorTexto}%'
         )
      )

    UNION ALL SELECT 'Novo', 0
    UNION ALL SELECT 'Aguardando Atendimento', 0
    UNION ALL SELECT 'Concluído', 0

) AS dados
GROUP BY estado
ORDER BY FIELD(estado, 'Todos', 'Novo', 'Aguardando Atendimento', 'Concluído');`


          } else {

            qry = `
                              SELECT estado, SUM(quantContatos) AS quantContatos FROM(
                          SELECT estado, COUNT(*) AS quantContatos
                                FROM meso_contatos
                                WHERE estado IS NOT NULL
                                  AND estado != 'Aguardando Cliente' and id_empresa = ${data.idEmpresa}
                                GROUP BY estado

                                UNION ALL
                                SELECT 'Todos', COUNT(*)
                                FROM meso_contatos
                                WHERE estado IS NOT NULL
                                  AND estado != 'Aguardando Cliente' and id_empresa = ${data.idEmpresa}

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
                      FROM(
                        SELECT estado, COUNT(*) AS quantContatos
                              FROM meso_contatos
                              WHERE estado IS NOT NULL
                                AND estado != 'Aguardando Cliente'
                                AND(usuario LIKE '%${data.usuario}%' OR usuario IS NULL)
                                ${data.tipo ? `AND setor = '${data.tipo}'` : ''}
                                AND nome LIKE '%${data.valorTexto}%' and id_empresa = ${data.idEmpresa}
                              GROUP BY estado

                              UNION ALL
                              SELECT 'Todos', COUNT(*)
                              FROM meso_contatos
                              WHERE estado IS NOT NULL
                                AND estado != 'Aguardando Cliente'
                                AND(usuario LIKE '%${data.usuario}%' OR usuario IS NULL)
                                ${data.tipo ? `AND setor = '${data.tipo}'` : ''}
                                AND nome LIKE '%${data.valorTexto}%'  and id_empresa = ${data.idEmpresa}

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
                      FROM(
                        SELECT estado, COUNT(*) AS quantContatos
                              FROM meso_contatos
                              WHERE estado IS NOT NULL
                                AND estado != 'Aguardando Cliente'
                                AND(usuario LIKE '%${data.usuario}%' OR usuario IS NULL)
                                ${data.tipo ? `AND setor = '${data.tipo}'` : ''}  and id_empresa = ${data.idEmpresa}
                              GROUP BY estado

                              UNION ALL
                              SELECT 'Todos', COUNT(*)
                              FROM meso_contatos
                              WHERE estado IS NOT NULL
                                AND estado != 'Aguardando Cliente'
                                AND(usuario LIKE '%${data.usuario}%' OR usuario IS NULL)
                                ${data.tipo ? `AND setor = '${data.tipo}'` : ''}  and id_empresa = ${data.idEmpresa}

                              UNION ALL SELECT 'Novo', 0
                              UNION ALL SELECT 'Aguardando Atendimento', 0
                              UNION ALL SELECT 'Concluído', 0
                      ) AS dados
                            GROUP BY estado
                            ORDER BY FIELD(estado, 'Todos', 'Novo', 'Aguardando Atendimento', 'Concluído');
                      `;
          }
        }

        console.log("-----------------------------------------------")
        console.log("A mostra os dados do select mega esquisito", qry)
        console.log("-----------------------------------------------")

        const quantContatos = await executaQry(qry);
        io.to(`empresa:${data.idEmpresa}`).emit("quantidade-contatos", quantContatos.dados || []);

      } catch (error) {
        //console.error("❌ Erro ao buscar quantidade de contatos:", error);
      }
    });

  });
};

module.exports = { socketConnection, buscarMensagem, emitirContatosAtualizados };



const express = require("express");
const router = express.Router();
const { executaQry } = require("../db");
const { executaQry2 } = require("../db2");
const { executaQry3 } = require("../db3");

const { verificaToken, geraToken } = require("../jwt/jwt");
router.get("/", (req, res) => {
  res.json({
    funcionou: false,
    msg: "Teste",
    dados: [],
  });
});

//Para acessar o sistema

router.post("/loginconfere", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Request-Width, Content-Type, Accept");
  let usuario = req.body.login;
  let senha = req.body.senha;
  console.log(usuario, senha);
  try {
    let qry = `
          select * from meso_usuariologin where
          senha= MD5('${senha}') and 
          usuario= '${usuario}'
        `;

    let res1 = await executaQry(qry);
    console.log('log:', res1.dados[0].usuario)
    const token = geraToken(res1.dados[0].usuario)
    const tipo = res1.dados[0].tipo

    res.json({ token, tipo });
    console.log('pega token', token, tipo);
  } catch (e) {
    console.log(e);
  }
});

router.post("/insereformauto", verificaToken, async (req, res) => {
  let pin = req.body.pin
  let atendente = req.body.atendente
  let contato = req.body.contato
  let chamador = req.body.chamador
  let uniqueid = req.body.uniqueid
  try {
    let qry = `
           insert into meso_form(pin, atendente,contato, chamador, uniqueid) values ('${pin}','${atendente}','${contato}', '${chamador}', '${uniqueid}')
         `;
    let res1 = await executaQry(qry);
    res.json(res1);
  } catch (e) {
  }
});

router.post("/insereform", verificaToken, async (req, res) => {
  let nome = req.body.nome
  let rgcpf = req.body.rgcpf
  let endereco = req.body.endereco
  let solicitacao = req.body.solicitacao
  let uniqueid = req.body.uniqueid
  try {
    let qry = `
           insert into meso_form_insert(nome, rgcpf, endereco, solicitacao, uniqueid) values ('${nome}','${rgcpf}', '${endereco}', '${solicitacao}','${uniqueid}')
         `;
    let res1 = await executaQry(qry);
    res.json(res1);
  } catch (e) {
    console.log(e);
  }
});


//Circulo do painel principal Logados cor Verde

router.get("/dashlogados", verificaToken, async (req, res, next) => {

  let qry = `select * from meso_logado `;


  let res2 = await executaQry(qry);
  res.json(res2);
  console.log(res2);

});

//Circulo do painel principal Pausados cor Amarela

router.get("/dashpausados", verificaToken, async (req, res, next) => {

  let qry = `select * from meso_pausado `;


  let res3 = await executaQry(qry);
  res.json(res3);
  console.log(res3);

});

//Circulo do painel principal Deslogado cor Vermelha [como fazer o calculo?]
//Vou trazer total Operadores e no front eu trato (total operadores - total logados)

router.get("/dashdeslogados", verificaToken, async (req, res, next) => {

  let qry = `select * from meso_operadores `;
  /*select *  from meso_logado msl
  left join meso_operadores mso on msl.pin = mso.pin
  where mso.id is not null
  */

  let res4 = await executaQry(qry);
  res.json(res4);
  console.log(res4);

});

//Circulo do painel principal Em Ligação cor Azul [como fazer o calculo?]
//Na verdade o que eu fiz foi atendidas e não realtime do em ligação.... ;(

router.get("/dashligacao", verificaToken, async (req, res, next) => {

  let qry = `select * from meso_operadores_em_ligacao `;


  let res5 = await executaQry(qry);
  res.json(res5);
  console.log(res5);

});

//Gráfico de linhas do Dashboard Chamadas por hora

router.get("/dashlinha", verificaToken, async (req, res, next) => {

  let qry = `select * from meso_fluxo_ligacao`;


  let res6 = await executaQry(qry);
  res.json(res6);
  console.log(res6);

});

router.get("/fluxoteste/:d1", verificaToken, async (req, res, next) => {

  let data1 = req.params.d1

  let qry = `select * from meso_entrar where dataHora like '${data1}%'  order by 'DataHora';`;

  console.log('aaaaaaaaaaaaaaaaaaaaaaa',qry)
  let res6 = await executaQry(qry);
  res.json(res6);
  console.log(res6);

});


/*Aqui começa o CRUD das telas do PIN e Agentes*/
/***************************************************************************************/
router.post("/inserepin", verificaToken, async (req, res, next) => {
  let usuario = req.body.usuario;
  let pin = req.body.pin;
  let fila = req.body.fila;
  try {
    let qry = `
          insert into meso_operadores(usuario,pin, fila)
          values ('${usuario}', '${pin}', '${fila}')
        `;
    let res7 = await executaQry(qry);
    res.json(res7);
  } catch (e) {
    console.log(e);
  }
});


router.post("/insereramal", verificaToken, async (req, res, next) => {
  let ramal_fisico = req.body.ramal_fisico;
  let ramal_virtual = req.body.ramal_virtual;
  let fila = req.body.fila;
  try {
    let qry = `
          insert into meso_ramais(ramal_fisico,ramal_virtual, fila)
          values ('${ramal_fisico}', '${ramal_virtual}', '${fila}')
        `;
    let res8 = await executaQry(qry);
    res.json(res8);
  } catch (e) {
    console.log(e);
  }
});

router.post("/insereusuario", verificaToken, async (req, res, next) => {
  let usuario = req.body.usuario;
  let senha = req.body.senha;
  let tipo = req.body.tipo;
  try {
    let qry = `
          insert into meso_usuariologin(usuario, senha, tipo)
          values ('${usuario}', MD5('${senha}'), '${tipo}')
        `;
    let res26 = await executaQry(qry);
    res.json(res26);
  } catch (e) {
    console.log(e);
  }
});

router.post("/inserescripts", verificaToken, async (req, res, next) => {
  let filacompleta = req.body.fila;
  let titulocompleto = req.body.titulo;
  let textocompleto = req.body.texto;
  try {
    let qry = `
          insert into meso_scripts(fila, titulo, texto)
          values ('${filacompleta}', '${titulocompleto}', '${textocompleto}')
        `;
    let res50 = await executaQry(qry);
    res.json(res50);
  } catch (e) {
    console.log(e);
  }
});

router.get("/listapin", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  try {
    let qry = `
    select * from meso_operadores
    `;
    let res9 = await executaQry(qry);
    res.json(res9);
  } catch (e) {
    console.log(e);
  }
});


router.get("/listascripts", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  try {
    let qry = `
    select * from meso_scripts
    `;
    let res51 = await executaQry(qry);
    res.json(res51);
  } catch (e) {
    console.log(e);
  }
});
router.get("/listarscripttexto/:fila", verificaToken, async (req, res) => {
  let fila = req.params.fila;
  // let datafim = req.params.d2;
  try {
    let qry = `
     select * from meso_scripts where fila ='${fila}'
     `;
    let res51 = await executaQry(qry);
    res.json(res51);
  } catch (e) {
    console.log(e);
  }
});

router.get("/informacao/:ramal/:fila/", verificaToken, async (req, res) => {
  ramal = req.params.ramal
  fila = req.params.fila
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  try {
    let qry = `
    select  meso_operadores_em_ligacao.*, meso_agent_connect.uniqueid from meso_operadores_em_ligacao, meso_agent_connect where meso_agent_connect.uniqueid = '${fila}' and meso_operadores_em_ligacao.callerid1 = '${ramal}' or meso_operadores_em_ligacao.callerid2 = '${ramal}' and meso_operadores_em_ligacao.uniqueid1 = meso_agent_connect.fila or meso_operadores_em_ligacao.uniqueid2 = meso_agent_connect.fila;

    `;
    let res51 = await executaQry(qry);
    res.json(res51);
  } catch (e) {
    console.log(e);
  }
});

router.get("/transferir/:ramal/:canal/", verificaToken, async (req, res) => {
  let ramal = '##' + req.params.ramal + '#';
  let canal = 'SIP/' + req.params.canal
  // let datafim = req.params.d2;
  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      Action: 'Atxfer',
      ActionID: "0008",
      Channel: canal,
      context: 'featuremap',
      Exten: ramal,
      Priority: "1"

    })
  try {
    let qry = `select * from meso_operadores_em_ligacao where canal1 like '%${canal}%' or canal2 like '%${canal}%'`;
    let res51 = await executaQry(qry);
    res.json(res51);
  } catch (e) {
    console.log(e);
  }
});

router.get("/despausarpainel/:ramal/:pin/:fila", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.params.ramal;
  let pin = req.params.pin;
  let fila = req.params.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      Action: "QueuePause",
      Actionid: "12348",
      Queue: fila,
      Interface: ramal,
      Paused: false,
      Reason: 'teste razao'

    })
  try {
    let qry = `
                delete from meso_pausado where pin ='${pin}'
              `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});


router.post("/despausarpainelrt", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.body.ramal;
  let pin = req.body.pin;
  let fila = req.body.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      Action: "QueuePause",
      Actionid: "12348",
      Queue: fila,
      Interface: ramal,
      Paused: false,
      Reason: 'teste razao'

    })
  try {
    let qry = `
                delete from meso_pausado where pin ='${pin}'
              `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});router.get("/listaramal", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  try {
    let qry = `
    select * from meso_ramais
    `;
    let res10 = await executaQry(qry);
    res.json(res10);
  } catch (e) {
    console.log(e);
  }
});

router.get("/gravacao/:d1/:d2", verificaToken, async (req, res) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  try {
    let qry = `
    select call_recording.*, call_entry.* from call_recording, call_entry where datetime_entry >  '${data1}' and datetime_entry < '${data2}' and call_entry.id = id_call_incoming
    `
    console.log(qry)
    let res10 = await executaQry3(qry);
    
    res.json(res10);
  } catch (e) {
    console.log(e);
  }
});

router.get("/gravacaocdr/:d1/:d2/:teleatendente/:consultado", verificaToken, async (req, res) => {
  let data1 = req.params.d1 
  let data2 = req.params.d2 
  let teleatendente = req.params.teleatendente
  let consultado = req.params.consultado
  try {
    let qry = `
    select * from cdr where calldate >=  '${data1}' and calldate <= '${data2}' and src ='${teleatendente}' and dst ='${consultado}' and recordingfile like '%monitor%'`
    console.log(qry)
    let res10 = await executaQry(qry);
    
    res.json(res10);
  } catch (e) {
    console.log(e);
  }
});






router.get("/listausuario", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  try {
    let qry = `
    select * from meso_usuariologin
    `;
    let res27 = await executaQry(qry);
    res.json(res27);
  } catch (e) {
    console.log(e);
  }
});

router.get("/ramaltira/:id", verificaToken, async (req, res, next) => {
  let id = req.params.id;
  console.log(id)
  try {
    let qry = `
          delete from meso_ramais where id = ${id}
        `;
    let res11 = await executaQry(qry);
    res.json(res11);
  } catch (e) {
    console.log(e);
  }
});

router.get("/pintira/:id", verificaToken, async (req, res, next) => {
  let id = req.params.id;
  console.log(id)
  try {
    let qry = `
          delete from meso_operadores where id = ${id}
        `;
    let res12 = await executaQry(qry);
    res.json(res12);
  } catch (e) {
    console.log(e);
  }
});

router.get("/usuariotira/:id", verificaToken, async (req, res, next) => {
  let id = req.params.id;
  console.log(id)
  try {
    let qry = `
          delete from meso_usuariologin where id = ${id}
        `;
    let res28 = await executaQry(qry);
    res.json(res28);
  } catch (e) {
    console.log(e);
  }
});
router.get("/scriptstira/:id", verificaToken, async (req, res, next) => {
  let id = req.params.id;
  console.log(id)
  try {
    let qry = `
          delete from meso_scripts where id = ${id}
        `;
    let res52 = await executaQry(qry);
    res.json(res52);
  } catch (e) {
    console.log(e);
  }
});
router.post("/ramalaltera", verificaToken, async (req, res, next) => {
  console.log(req.body)
  let mostra = req.body;
  let { id, ramal_fisico, ramal_virtual, fila } = mostra;
  console.log(id, ramal_fisico, ramal_virtual, fila);


  try {
    let qry = `
           update meso_ramais set ramal_fisico= '${ramal_fisico}', ramal_virtual= '${ramal_virtual}', fila='${fila}' where id = ${id}
         `;
    let res13 = await executaQry(qry);
    res.json(res13);
  } catch (e) {
    res.json({ message: e.message })
  }
});

router.post("/pinaltera", verificaToken, async (req, res, next) => {
  console.log(req.body)
  let mostra = req.body;
  let { id, usuario, pin, fila } = mostra;
  console.log(id, usuario, pin, fila);

  try {
    let qry = `
           update meso_operadores set usuario='${usuario}', pin='${pin}', fila='${fila}' where id = ${id}
         `;
    let res14 = await executaQry(qry);
    res.json(res14);
  } catch (e) {
    res.json({ message: e.message })
  }
});

router.post("/usuarioaltera", verificaToken, async (req, res, next) => {
  console.log(req.body)
  let mostra = req.body;
  let { id, usuario, senha, tipo } = mostra;
  console.log(id, usuario, senha, tipo);

  try {
    let qry = `
          update meso_usuariologin set usuario='${usuario}', senha =MD5('${senha}'), tipo='${tipo}' where id = ${id}
        `;
    let res14 = await executaQry(qry);
    res.json(res14);
  } catch (e) {
    res.json({ message: e.message })
  }
});

router.post("/scriptsaltera", verificaToken, async (req, res, next) => {
  console.log(req.body)
  let mostra = req.body;
  let { id, fila, titulo, texto } = mostra;
  console.log(id, fila, titulo, texto);

  try {
    let qry = `
          update meso_scripts set fila='${fila}', titulo='${titulo}', texto='${texto}' where id = ${id}
        `;
    let res53 = await executaQry(qry);
    res.json(res53);
  } catch (e) {
    res.json({ message: e.message })
  }
});

/*****************************************************************************************************/
//Aqui começa os relatórios estáticos

router.get("/tma/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_bridge where DataChamada > '${data1}' and DataChamada < '${data2}' `;

  let res15 = await executaQry(qry);
  res.json(res15);
  console.log(res15);

});

router.get("/tme/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_agent_connect where DataHora > '${data1}' and  DataHora <  '${data2}' `;

  let res16 = await executaQry(qry);
  res.json(res16);
  console.log(res16);

});
router.get("/pausa/:d1/:d2/:fila/:pin", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1
  let data2 = req.params.d2
  // let data2 = req.params.d2 + ' 23:59:59'
  let ramalAgente = "SIP/" + req.params.ramal

  let qry = `select *,timediff(despausado, hora) as duracao from meso_pausa_fila where dataPausa = '${data1}'  and hora > '00:00:00' and hora < '23:59:59' and localizacao = '${ramalAgente}';
  `;

  let res17 = await executaQry(qry);
  res.json(res17);
  console.log(res17);

});



router.get("/service/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from XXX where datahora > '${data1}' and datahora < '${data2}' `;

  let res18 = await executaQry(qry);
  res.json(res18);
  console.log(res18);

});

router.get("/conexaoagente/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_login_fila where datahora > '${data1}' and dataHora < '${data2}' `;

  let res19 = await executaQry(qry);
  res.json(res19);
  console.log(res19);

});
router.get("/complete/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select * from meso_login_fila where datahora > '${data1}' and dataHora < '${data2}'; `

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});
router.get("/cdr/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select * from cdr, meso_agent_complete where cdr.uniqueid = meso_agent_complete.uniqueid `

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});
router.get("/cel/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select appname from cel, meso_agent_complete where cel.uniqueid = meso_agent_complete.uniqueid `

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});

router.get("/loginfila/:ramal/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let ramalAgente = "SIP/" + req.params.ramal;
  let qry = `select * from meso_login_fila where localizacao = '${ramalAgente}' and datahora > '${data1}' and dataHora < '${data2}' `;

  let res19 = await executaQry(qry);
  res.json(res19);
  console.log(res19);

});

router.get("/loginfilaquantidade/:ramal/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let ramalAgente = "SIP/" + req.params.ramal;
  let qry = `select count(*) as totallogin from meso_login_fila where localizacao = '${ramalAgente}' and datahora > '${data1}' and dataHora < '${data2}' `;

  let res19 = await executaQry(qry);
  res.json(res19);
  console.log(res19);

});

router.get("/tempochamada/:ramal/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let ramalAgente = "SIP/" + req.params.ramal;
  let qry = `select sec_to_time(sum(talktime)) as tempochamda from meso_agent_complete where member = '${ramalAgente}' and datahora > '${data1}' and datahora < '${data2}' `;

  let res19 = await executaQry(qry);
  res.json(res19);
  console.log(res19);

});

router.get("/loginfiladatah/:ramal/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let ramalAgente = "SIP/" + req.params.ramal;
  let qry = `select dataHora as datahoraLogin from meso_login_fila  where localizacao = '${ramalAgente}' and datahora > '${data1}' and dataHora < '${data2}' `;

  let res19 = await executaQry(qry);
  res.json(res19);
  console.log(res19);

});

router.get("/deslogafiladatah/:ramal/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let ramalAgente = "SIP/" + req.params.ramal;
  let qry = `select dataHora as datahoradesloga from meso_login_fila  where localizacao = '${ramalAgente}' and dataHora > '${data1}' and dataHora < '${data2}' `;

  let res19 = await executaQry(qry);
  res.json(res19);
  console.log(res19);

});

router.get("/detalhesligacoes/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select distinct * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 or table1.uniqueid = table2.uniqueid2 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2};' `;

  console.log(qry)
  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});
router.get("/recebidafila/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select * from meso_entrar where fila = '${filacompleta}' and datahora > '${data1}' and dataHora < '${data2}'; `

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});
router.get("/recebidasucesso/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select * from meso_agent_complete where fila = '${filacompleta}' and datahora > '${data1}' and dataHora < '${data2}'; `

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});

router.get("/recebidaabandon/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select * from meso_abandon where fila = '${filacompleta}' and dataHora > '${data1}' and dataHora < '${data2}'; `

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});

router.get("/recebidaespera/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select sec_to_time(sum(meso_abandon.holdtime))as espera from meso_abandon  where meso_abandon.fila= '${filacompleta}' and meso_abandon.dataHora > '${data1}' and meso_abandon.dataHora < '${data2}';`

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});

router.get("/recebidaesperaatende/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select sec_to_time(sum(meso_agent_complete.holdtime))as esperaAtende from meso_agent_complete  where meso_agent_complete.fila= '${filacompleta}' and meso_agent_complete.dataHora > '${data1}' and meso_agent_complete.dataHora < '${data2}';`

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});

router.get("/recebidacalled/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select * from meso_agent_called_rt where extension = '${filacompleta}' and dataHora > '${data1}' and dataHora < '${data2}'; `

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});

router.get("/recebidajoin/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select * from meso_entrar where fila = '${filacompleta}' and datahora > '${data1}' and dataHora < '${data2}'; `

  //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and dataHora > '${data1}' and dataHora < '${data2} limit 1;' `;

  let res20 = await executaQry(qry);
  res.json(res20);
  console.log(res20);

});

router.get("/filajoin/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_entrar where DataHora > '${data1}' and DataHora < '${data2}' `;

  let res21 = await executaQry(qry);
  res.json(res21);
  console.log(res21);

});
router.get("/joinreal", verificaToken, async (req, res, next) => {

  let qry = `select * from meso_entrar `;

  let res31 = await executaQry(qry);
  res.json(res31);
  console.log(res31);

});
router.get("/filasucesso/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_bridge where DataChamada > '${data1}' and DataChamada < '${data2}' `;

  let res25 = await executaQry(qry);
  res.json(res25);
  console.log(res25);

});

router.get("/filaabandono/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_abandon where DataHora > '${data1}' and DataHora < '${data2}' `;

  let res25 = await executaQry(qry);
  res.json(res25);
  console.log(res25);

});

router.get("/troncos/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from XXX where datahora > '${data1}' and datahora < '${data2}' `;

  let res22 = await executaQry(qry);
  res.json(res22);
  console.log(res22);

});

router.get("/fluxohora/:d1", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1

  let qry = `select * from meso_fluxo_ligacao where datahora = '${data1}' `;

  let res23 = await executaQry(qry);
  res.json(res23);
  console.log(res23);

});

router.get("/dashpizza/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_entrar where datahora > '${data1}' and datahora < '${data2}'`;


  let res24 = await executaQry(qry);
  res.json(res24);
  console.log(res24);

});

//Segunda bolinha do painel de filas - Chamadas em fila

router.get("/listajoin/:fila", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let qry = `select * from meso_join_rt where fila = '${filacompleta}'`;




  let res30 = await executaQry(qry);
  res.json(res30);
  console.log(res30);

});

//Primeira bolinha do painel de filas - Chamadas totais

router.get("/listajointotal/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_entrar where DataHora > '${data1}' and DataHora < '${data2}' and fila = '${filacompleta}'`;




  let res31 = await executaQry(qry);
  res.json(res31);
  console.log(res31);

});

router.get("/filaconectada/:fila", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;

  let qry = `select *, meso_agent_connect.uniqueid  from meso_operadores_em_ligacao, meso_agent_connect where meso_agent_connect.bridgedchannel = meso_operadores_em_ligacao.uniqueid2 and meso_agent_connect.uniqueid = '${filacompleta}'`;


  let res32 = await executaQry(qry);
  res.json(res32);
  console.log(res32);

});

router.get("/filasabandonadas/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_abandon where DataHora > '${data1}' and DataHora < '${data2}' and fila = '${filacompleta}'`;


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});

router.get("/tmafilas/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select avg(talktime) as media from meso_agent_complete where DataHora > '${data1}' and DataHora < '${data2}' and fila = '${filacompleta}'`;

  let res34 = await executaQry(qry);
  res.json(res34);
  console.log(res34);

});

router.get("/tmefilas/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where DataHora > '${data1}' and DataHora < '${data2}' and fila = '${filacompleta}'`;

  let res35 = await executaQry(qry);
  res.json(res35);
  console.log(res35);

});
router.get("/tmefilasabandonadas/:fila/:d1/:d2", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select avg(holdtime) as mediaesperaabandonada from meso_abandon where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}'`;

  let res35 = await executaQry(qry);
  res.json(res35);
  console.log(res35);

});

router.get("/realoperador", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  //let data1 = req.params.d1 + ' 00:00:00'
  //let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select * from meso_operadores`;

  let res36 = await executaQry(qry);
  res.json(res36);
  console.log(res36);

});

router.get("/realoperadorrt", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  //let data1 = req.params.d1 + ' 00:00:00'
  //let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select * from meso_operadores`;

  let res36 = await executaQry(qry);
  res.json(res36);
  console.log(res36);

});

router.get("/realoperadorlogados/:pin/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let pincompleto = req.params.pin;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select * from logs where user = '${pincompleto}' and datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' order by '${data1}' `;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});

router.get("/primeiraconexao/:pin/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let pincompleto = req.params.pin;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select MIN(datahora) as datahora from logs where user = '${pincompleto}' and datahora >= '${data1}' and datahora <= '${data2}' and fila = '${filacompleta}' and motivo like 'LogI%'order by '${data1}' `;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});

router.get("/contaconexao/:pin/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let pincompleto = req.params.pin;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select count(*) as contaconexoes from logs where user = '${pincompleto}' and datahora >= '${data1}' and datahora <= '${data2}' and fila = '${filacompleta}' and motivo like 'LogI%'order by '${data1}' `;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});

router.get("/contapausa/:pin/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let pincompleto = req.params.pin;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select count(*) as contPausa from logs where user = '${pincompleto}' and datahora >= '${data1}' and datahora <= '${data2}' and fila = '${filacompleta}' and motivo like 'pausai%'order by '${data1}' `;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});


router.get("/tempologin/:ramal/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;

  let ramal = 'SIP/' + req.params.ramal
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(desloga,dataHora)))) as duracao from meso_login_fila where  dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}' and localizacao = '${ramal}' order by '${data1}' `;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});

router.get("/tempopausa/:ramal/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;

  let ramal = 'SIP/' + req.params.ramal
  let data1 = req.params.d1
  let data2 = req.params.d2
  let filacompleta = req.params.fila;
  let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(despausado,hora)))) as durapausa from meso_pausa_fila where  dataPausa >= '${data1}' and dataPausa <= '${data2}' and fila = '${filacompleta}' and localizacao = '${ramal}' order by '${data1}' `;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});

router.get("/numcall/:ramal/:d1/:d2/:fila", async (req, res, next) => {

  let ramal = 'SIP/' + req.params.ramal
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let fila = req.params.fila
  let qry = `select count(evento) as acalled from meso_agent_called where agentcalled = '${ramal}' and fila = '${fila}' and dataHora > '${data1}' and dataHora < '${data2}'
  `;

  let res38 = await executaQry(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/numconn/:ramal/:fila/:d1/:d2", async (req, res, next) => {

  let ramal = req.params.ramal
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let fila = req.params.fila
  let qry = `select count(evento) as ligacoes from meso_agent_connect where member = '${ramal}' and uniqueid = '${fila}' and DataHora > '${data1}' and DataHora < '${data2}'
  `;

  let res38 = await executaQry(qry);
  res.json(res38);
  console.log(res38);

});


router.get("/ultimaconexao/:pin/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let pincompleto = req.params.pin;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select max(datahora) as datahoraMax from logs where user = '${pincompleto}' and datahora >= '${data1}' and datahora <= '${data2}' and fila = '${filacompleta}' and motivo like 'LogI%'order by '${data1}' `;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});

router.get("/pegalogin/:pin/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let pincompleto = req.params.pin;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;
  let qry = `select ramal as ramal  from logs where user = '${pincompleto}' and datahora >= '${data1}' and datahora <= '${data2}' and fila = '${filacompleta}' and motivo like 'LogI%'order by '${data1}' `;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});


router.get("/realoperadorpausado/:ramal/:d1/:d2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let ramal = req.params.ramal;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let filacompleta = req.params.fila;

  console.log(ramal, data1, data2, filacompleta)
  let qry = `select logs.*, meso_operadores.usuario as nomeagente  from logs, meso_operadores where logs.ramal = '${ramal}' and logs.datahora > '${data1}' and logs.datahora < '${data2}' and logs.fila = '${filacompleta}' and meso_operadores.ramal = '${ramal}' and logs.motivo like 'pausa%' order by '${data1}'`;
  console.log(qry)


  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});

router.get("/duracpausa/:d1/:d2/:ramal/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let data1 = req.params.d1
  let data2 = req.params.d2
  let ramal = 'SIP/' + req.params.ramal
  let filacompleta = req.params.fila;
  let qry = ` select distinct sec_to_time(SUM(time_to_sec(TIMEDIFF(despausado, hora)))) as duracao  from meso_pausa_fila where dataPausa >= '${data1}' and dataPausa <= '${data2}' and membername = '${ramal}' and fila ='${filacompleta}';
   `;
  console.log(qry)


  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});



router.get("/realoperadornome/:pin/", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let pincompleto = req.params.pin;
  let qry = `select usuario from meso_operadores where pin = '${pincompleto}'`;
  console.log(qry)

  let res37 = await executaQry(qry);
  res.json(res37);
  console.log(res37);

});




//select distinct timediff("2022-10-25 15:26:58", "2022-10-25 15:25:12") as total from logs;

router.get("/totallogin/:t2/:t1", verificaToken, async (req, res, next) => {

  let data1 = req.params.t1
  let data2 = req.params.t2

  let qry = `select distinct timediff('${data2}', '${data1}') as total from logs`;
  console.log(qry)

  let res137 = await executaQry(qry);
  res.json(res137);
  console.log(res137);

});





router.get("/realoperadordespausados/:pin/:t1/:t2/:fila", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  let pincompleto = req.params.pin;
  let data1 = req.params.t1
  let data2 = req.params.t2
  let filacompleta = req.params.fila;
  let qry = `select * from logs where user = '${pincompleto}' and datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' and motivo = 'pausaout'`;
  console.log(qry)

  let res80 = await executaQry(qry);
  res.json(res80);
  console.log(res80);

});

router.get("/nomeoperador/:pin", verificaToken, async (req, res, next) => {
  // let filacompleta = req.params.fila;
  //let data1 = req.params.d1 + ' 00:00:00'
  //let data2 = req.params.d2 + ' 23:59:59'
  let pincompleto = req.params.pin;
  let qry = `select usuario from meso_operadores where pin= '${pincompleto}'`;
  console.log(qry)

  let res48 = await executaQry(qry);
  res.json(res48);
  console.log(res48);

});

router.get("/listafilastotais", verificaToken, async (req, res, next) => {

  let qry = `select extension, descr from queues_config `;

  let res38 = await executaQry2(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/listaramais", verificaToken, async (req, res, next) => {

  let qry = `select extension, name from users `;

  let res38 = await executaQry2(qry);
  res.json(res38);
  console.log(res38);

});


router.get("/mediatma/:fila/:t1/:t2/:ramal", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.t1
  let data2 = req.params.t2
  let operador = 'SIP/' + req.params.ramal
  let qry = `select avg(talktime) as mediatma from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}'
  and member = '${operador}' `;

  let res39 = await executaQry(qry);
  res.json(res39);
  console.log(res39);

});

router.get("/totalchamadastma/:fila/:t1/:t2/:ramal", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.t1
  let data2 = req.params.t2
  let operador = 'SIP/' + req.params.ramal
  let qry = `select * from meso_agent_complete where dataHora >= '${data1}' and dataHora <= '${data2}' and fila = '${filacompleta}'
  and member = '${operador}' `;

  console.log(qry)
  let res40 = await executaQry(qry);
  res.json(res40);
  console.log(res40);

});

router.get("/totalduracaotma/:fila/:t1/:t2/:ramal", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.t1
  let data2 = req.params.t2
  let operador = 'SIP/' + req.params.ramal
  let qry = `select distinct SEC_TO_TIME(sum(talktime)) as talktime from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}'
  and member = '${operador}' `;

  let res41 = await executaQry(qry);
  res.json(res41);
  console.log(res41);

});

router.get("/totalduracaotmasec/:fila/:t1/:t2/:ramal", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.t1
  let data2 = req.params.t2
  let operador = 'SIP/' + req.params.ramal
  let qry = `select distinct sum(talktime) as talktime from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}'
  and member = '${operador}' `;

  let res41 = await executaQry(qry);
  res.json(res41);
  console.log(res41);

});


router.get("/duraconsec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

  let ramal = 'SIP/' + req.params.ramal
  let fila = req.params.fila
  let data1 = req.params.d1
  let data2 = req.params.d2
  let qry = `select SUM(time_to_sec(TIMEDIFF(desloga, datahora))) as durconsec from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora >= '${data1}' and datahora <= '${data2}'
  `;

  console.log('\n', qry)

  let res38 = await executaQry(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/talktimesec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

  let ramal = 'SIP/' + req.params.ramal
  let fila = req.params.fila
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select distinct sum(talktime) as talktimesec from meso_agent_complete where member = '${ramal}' and fila = '${fila}' and dataHora > '${data1}' and dataHora < '${data2};
  '
  `;
  console.log('\n', qry)

  let res38 = await executaQry(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/maximaduracaotma/:fila/:t1/:t2/:ramal", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.t1
  let data2 = req.params.t2
  let operador = 'SIP/' + req.params.ramal
  let qry = `select max(talktime) as duracaomaxima from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}'
  and member = '${operador}' `;

  let res42 = await executaQry(qry);
  res.json(res42);
  console.log(res42);

});

router.get("/somaespera/:fila/:d1/:d2/", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select sum(holdtime) as somaespera from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}' `;

  let res43 = await executaQry(qry);
  res.json(res43);
  console.log(res43);

});

router.get("/mediaespera/:fila/:d1/:d2/", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}' `;

  let res44 = await executaQry(qry);
  res.json(res44);
  console.log(res44);

});

router.get("/minimoespera/:fila/:d1/:d2/", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select min(holdtime) as minimaespera from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}' `;

  let res45 = await executaQry(qry);
  res.json(res45);
  console.log(res45);

});

router.get("/maximoespera/:fila/:d1/:d2/", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select max(holdtime) as maximaespera from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}' `;

  let res45 = await executaQry(qry);
  res.json(res45);
  console.log(res45);

});

router.get("/totalchamadasespera/:fila/:d1/:d2/", verificaToken, async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select * from meso_agent_complete where dataHora > '${data1}' and dataHora < '${data2}' and fila = '${filacompleta}' `;

  let res46 = await executaQry(qry);
  res.json(res46);
  console.log(res46);

});

router.get("/relatabandon/:d1/:d2/", verificaToken, async (req, res, next) => {
 
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `

  select * from  meso_abandon where dataHora > '${data1}' and dataHora < '${data2}'`;

  let res126 = await executaQry(qry);
  res.json(res126);
  console.log(res126);
});

router.get("/binaabandonadas/:d1/:d2/", verificaToken, async (req, res, next) => {
 
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select calleridnum  from meso_entrar inner join meso_abandon on meso_entrar.uniqueid = meso_abandon.uniqueid where meso_abandon.dataHora > '${data1}' and meso_abandon.dataHora < '${data2}'`;

  let res125 = await executaQry(qry);
  res.json(res125);
  console.log(res125);
});



router.get("/hanguppainel/:canal/", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let canal = 'SIP/' + req.params.canal;
  //let pin = req.params.pin;
  //let fila = req.params.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      Action: 'Hangup',
      ActionID: "789",
      Channel: canal,
      Cause: "0",
    })
  try {
    let qry = `select * from meso_operadores_em_ligacao where canal1 like '%${canal}%' or canal2 like '%${canal}%'`;

    let res47 = await executaQry(qry);

    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

//Loga no painel

router.post("/verificapainel", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.body.ramal;
  let pin = req.body.pin;
  let fila = req.body.fila;
  try {
    let qry = `select * from meso_ramais where ramal_fisico = '${ramal}' UNION select usuario, fila, ramal, pin, stat  from meso_operadores where pin = '${pin}' and fila ='${fila}'`;

    console.log(qry, '\n')
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.get("/verificalogado/:pin", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let pin = req.params.pin;
  try {
    let qry = `select * from meso_logado where pin = '${pin}'`;

    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.get("/verificachamada/:ramal/", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.params.ramal;

  try {
    let qry = `select * from meso_operadores_em_ligacao where callerid1 ='${ramal}' or callerid2 = '${ramal}';  `;

    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});


router.post("/logarpainel", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.body.ramal;
  let ramalsempin = req.body.ramal;

  let pin = req.body.pin;
  let fila = req.body.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      action: "QueueAdd",
      actionid: "123",
      Queue: fila,
      Interface: ramal

    })
  try {
    let qry = `
                insert into meso_logado(ramal ,pin, fila)
                values ('${ramalsempin}','${pin}', '${fila}')
              `;

    console.log(qry)
    let res47 = await executaQry(qry);
    res.json(res47);


  } catch (e) {
    console.log(e);
  }

});


router.post("/estadoperador",  async (req, res) => {

  let pin = req.body.pin;



  try {
    let qry = `
                      update meso_operadores set estado = 'logado' where pin = '${pin}'
                    `;
    console.log('MUDA ESTADO PARA LOGADO', qry)
    let res47 = await executaQry(qry);
    res.json(res47);


  } catch (e) {
    console.log(e);
  }

});

router.post("/estadoperadorrt",  async (req, res) => {

  let pin = req.body.pin;
  let ramal = req.body.ramal;



  try {
    let qry = `
      update meso_operadores set ramal = '${ramal}' where pin = '${pin}' 
                    `;
    console.log('UPDATE RAMAL DO OPERADOR', qry)
    let res47 = await executaQry(qry);
    res.json(res47);


  } catch (e) {
    console.log(e);
  }

});

router.post("/deslogaestado",  async (req, res) => {

  let pin = req.body.pin;
  



  try {
    let qry = `
                             update meso_operadores set estado = 'deslogado' where pin = '${pin}'
                           `;
    console.log('MUDA ESTADO PARA DESLOGADO', qry)
    let res47 = await executaQry(qry);
    res.json(res47);


  } catch (e) {
    console.log(e);
  }

});

router.post("/deslogaestadort",  async (req, res) => {

  let pin = req.body.pin;

  let ramal = req.body.ramal;


  try {
    let qry = `
                             update meso_operadores set estado = 'deslogado' where pin = '${pin}' and ramal = '${ramal}'`;
    console.log('MUDA ESTADO PARA DESLOGADO', qry)
    let res47 = await executaQry(qry);
    res.json(res47);


  } catch (e) {
    console.log(e);
  }

});

router.post("/pausarestado",  async (req, res) => {

  let pin = req.body.pin;

  try {
    let qry = `update meso_operadores set estado = 'pausado' where pin = '${pin}'`;
    console.log('MUDA ESTADO PARA PAUSADO', qry)
    let res47 = await executaQry(qry);
    res.json(res47);


  } catch (e) {
    console.log(e);
  }

});

router.get("/deslogarpainel/:ramal/:pin/:fila", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.params.ramal;
  
  let pin = req.params.pin;
  let fila = req.params.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      action: "QueueRemove",
      actionid: "1245",
      Queue: fila,
      Interface: ramal

    })
  try {
    let qry = `
                      delete from meso_logado where pin ='${pin}'
                    `;
    console.log('desloga painel',qry)

    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});
router.post("/logsdeslogar/", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.body.ramal;
  let pin = req.body.pin;
  let fila = req.body.fila;

  try {
    let qry = `
                            insert into logs(user, ramal, fila, motivo, datahora)
                            values ('${pin}','${ramal}', '${fila}','logout', now())
                          `;
    let res47 = await executaQry(qry);
    res.json(res47);
    console.log(qry)
  } catch (e) {
    console.log(e);
  }

});

router.post("/logarpainelop", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.body.ramal;
  let pin = req.body.pin;
  let fila = req.body.fila;

  try {
    let qry = `
                      insert into meso_relatorio_logado_total(ramal ,pin, fila, dhlogin)
                      values ('${ramal}','${pin}', '${fila}', now())
                    `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.post("/logslogin", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.body.ramal;
  let pin = req.body.pin;
  let fila = req.body.fila;

  try {
    let qry = `
                            insert into logs(user, ramal, fila, motivo, datahora)
                            values ('${pin}','${ramal}', '${fila}','login', now())
                          `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});
router.post("/deslogarpainel", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.body.ramal;
  let pin = req.body.pin;
  let fila = req.body.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      action: "QueueRemove",
      actionid: "123",
      Queue: fila,
      Interface: ramal

    })
  try {
    let qry = `
                      delete from meso_logado where pin = '${pin}'
                    `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.get("/pausarpainel/:ramal/:pin/:fila", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.params.ramal;
  let ramalsempin = req.params.ramal;

  let pin = req.params.pin;
  let fila = req.params.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      Action: "QueuePause",
      Actionid: "1234",
      Queue: fila,
      Interface: ramal,
      Paused: true,
      Reason: 'teste razao'

    })
  try {
    let qry = `
                      insert into meso_pausado(ramal, pin, fila)
                      values ('${ramalsempin}','${pin}', '${fila}')
                    `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.post("/pausarpainelrt", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.body.ramal;
  let ramalsempin = req.body.ramal;

  let pin = req.body.pin;
  let fila = req.body.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      Action: "QueuePause",
      Actionid: "1234",
      Queue: fila,
      Interface: ramal,
      Paused: true,
      Reason: 'teste razao'

    })
  try {
    let qry = `
                      insert into meso_pausado(ramal, pin, fila)
                      values ('${ramalsempin}','${pin}', '${fila}')
                    `;

    console.log('INSERT NO MESO_PAUSADO\n',qry)
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.get("/despausarpainel/:ramal/:pin/:fila", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = 'SIP/' + req.params.ramal;
  let pin = req.params.pin;
  let fila = req.params.fila;


  var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
  // In case of any connectiviy problems we got you coverd.
  ami.keepConnected();

  ami.action(
    {
      Action: "QueuePause",
      Actionid: "12348",
      Queue: fila,
      Interface: ramal,
      Paused: false,
      Reason: 'teste razao'

    })
  try {
    let qry = `
                            delete from meso_pausado where pin ='${pin}'
                          `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.get("/logspausar/:ramal/:pin/:fila", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.params.ramal;
  let pin = req.params.pin;
  let fila = req.params.fila;

  try {
    let qry = `
                            insert into logs(user, ramal, fila, motivo, datahora)
                            values ('${pin}','${ramal}', '${fila}','pausain', now())
                          `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.post("/logspausarrt/", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.params.ramal;
  let pin = req.params.pin;
  let fila = req.params.fila;

  try {
    let qry = `
                            insert into logs(user, ramal, fila, motivo, datahora)
                            values ('${pin}','${ramal}', '${fila}','pausain', now())
                          `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.get("/logsdespausar/:ramal/:pin/:fila", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.params.ramal;
  let pin = req.params.pin;
  let fila = req.params.fila;

  try {
    let qry = `
                                  insert into logs(user, ramal, fila, motivo, datahora)
                                  values ('${pin}','${ramal}', '${fila}','pausaout', now())
                                `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.post("/logsdespausarrt", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.body.ramal;
  let pin = req.body.pin;
  let fila = req.body.fila;

  try {
    let qry = `
                                  insert into logs(user, ramal, fila, motivo, datahora)
                                  values ('${pin}','${ramal}', '${fila}','pausaout', now())
                                `;
    let res47 = await executaQry(qry);
    res.json(res47);
  } catch (e) {
    console.log(e);
  }

});

router.get("/pinpausar/:pin/", verificaToken, async (req, res, next) => {
  let pin = req.params.pin;


  let qry = `select * from meso_logado where pin='${pin}'`;

  let res44 = await executaQry(qry);
  res.json(res44);
  console.log(res44);
});

router.get("/pindeslogar/:pin/:ramal/", verificaToken, async (req, res, next) => {
  let pin = req.params.pin;
  let ramal = 'SIP/' + req.params.ramal

  let qry = `select * from meso_logado where pin='${pin}' and ramal = '${ramal}' `;
  console.log(qry)
  let res44 = await executaQry(qry);
  res.json(res44);
  console.log(res44);
});

router.get("/graficohora/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from ligacaoHora where data >= '${data1}' and data <= '${data2}' `;

  //let d1 = req.params.d1;
  //let d2 = req.params.d2;
  //let qry = `select * from logs where datahora between '${d1}'  and '${d2}'`;
  let res34 = await executaQry(qry);
  res.json(res34);
  console.log(res34);

});






router.get("/operadores/:d1/:d2", verificaToken, async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from logs where datahora > '${data1}' and datahora < '${data2}' `;

  //let d1 = req.params.d1;
  //let d2 = req.params.d2;
  //let qry = `select * from logs where datahora between '${d1}'  and '${d2}'`;
  let res11 = await executaQry(qry);
  res.json(res11);
  console.log(res11);

});



/** 
router.get("/graficohora/:d1/:d2", verificaToken, async (req, res, next) =>{
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from ligacaoHora where data >= '${data1}' and data <= '${data2}' `;
  
  //let d1 = req.params.d1;
  //let d2 = req.params.d2;
  //let qry = `select * from logs where datahora between '${d1}'  and '${d2}'`;
  let res34 = await executaQry(qry);
  res.json(res34);
  console.log(res34);

});
router.get("/pausa", verificaToken, async (req, res) => {
  try {
    let qry = `
    select distinct operadores.usuario as usuario, logado.ramal as ramal, logado.pin as pin, dataPausa, PausaFila.hora, despausado, TIMEDIFF(despausado, PausaFila.hora) as duracaoPausa FROM PausaFila, operadores, logado where logado.pin = operadores.pin and logado.ramal = right (membername, 3)
        `;
    let res1 = await executaQry(qry);
    res.json(res1);
  } catch (e) {
    console.log(e);
  }
});


router.get("/fluxohora", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select * from ligacaoHora
    `;
    let res2 = await executaQry(qry);
    res.json(res2);
  } catch (e) {
    console.log(e);
  }
});


router.get("/tme", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select AgentComplete.fila as fila, sec_to_time(sum(agentConnect.holdtime)) as tempoEspera, sec_to_time(AVG(agentConnect.holdtime)) as MedTempoEspera, (select (sec_to_time(MAX(agentConnect.holdtime)))) as MaxTempo , count(Ligacoes.channelstatedesc) as TotalLigacoes from agentConnect, Ligacoes, AgentComplete where Ligacoes.uniqueid = AgentComplete.uniqueid and agentConnect.uniqueid = AgentComplete.uniqueid
    `;
    let res3 = await executaQry(qry);
    res.json(res3);
  } catch (e) {
    console.log(e);
  }
});

router.get("/datalhesligacoes", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select distinct operadores.usuario as usuário, logado.ramal as ramal, logado.pin as pin, Bridge.DataChamada as dataInicio, Bridge.InicioChamada as IncioChamada, Bridge.terminoChamada as DataDeTermino, TIMEDIFF(Bridge.terminoChamada, Bridge.InicioChamada) as duracao, timediff(MusicOnHold.dataTermino, MusicOnHold.hora) as tempoDeEspera, entrar.fila, Bridge.callerid1 as numero from LoginFila, Bridge, Desliga, entrar, MusicOnHold, logado, operadores where Bridge.uniqueid1 = MusicOnHold.uniqueid and logado.ramal = Bridge.callerid2 and logado.pin = operadores.pin
    `;
    let res4 = await executaQry(qry);
    res.json(res4);
  } catch (e) {
    console.log(e);
  }
});


router.get("/tma", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select AgentComplete.membername as NomeNumAgente,(select count(Ligacoes.channelstatedesc) from Ligacoes) as TotalLigacoes, AgentComplete.fila as fila, (select count(AgentComplete.evento) from AgentComplete) as LigacoesAtendidas, (select SEC_TO_TIME(sum(talktime)) from AgentComplete) as duracao, (select sec_to_time(AVG(talktime)) from AgentComplete) as tempoMedio, MAX(sec_to_time(talktime)) as tempoMAX from AgentComplete, Ligacoes
    `;
    let res5 = await executaQry(qry);
    res.json(res5);
  } catch (e) {
    console.log(e);
  }
});


router.get("/service", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select AgentComplete.membername, agentConnect.datahora as DataInit, AgentComplete.dataHora as DataTermino, TIMEDIFF(time(AgentComplete.datahora), time(AgentLogin.datahora)) as TotalLogin, sec_to_time(sum(AgentComplete.talktime)) as TempoDeChamada, round(sum(((AgentComplete.talktime) / time_to_sec(agentConnect.dataHora))/100*100)) as serviço  from AgentComplete, agentConnect, AgentLogin  where AgentComplete.uniqueid = agentConnect.uniqueid
    `;
    let res6 = await executaQry(qry);
    res.json(res6);
  } catch (e) {
    console.log(e);
  }
});

*/



/*
router.get("/listarfila", verificaToken, async (req, res) => {
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select descr from queues_config
    `;
    let res10 = await executaQry(qry);
    res.json(res10);
  } catch (e) {
    console.log(e);
  }
});
*/

//inicio relaório de tronco

router.get("/listartronco", async (req, res, next) => {

  let qry = `select * from trunks `;

  let res38 = await executaQry2(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/troncoabandonadas/:tronco/:d1/:d2", async (req, res, next) => {
  let tronco = req.params.tronco
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(*) as abandon from meso_abandon, meso_entrar where  meso_entrar.uniqueid = meso_abandon.uniqueid and meso_abandon.datahora > '${data1}' and meso_abandon.datahora < '${data2}' and meso_entrar.channel like '%${tronco}%'`;


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});

router.get("/troncoentrar/:tronco/:d1/:d2", async (req, res, next) => {
  let tronco = req.params.tronco
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(*) as entrada from meso_entrar where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});

router.get("/troncocomplete/:tronco/:d1/:d2", async (req, res, next) => {
  let tronco = req.params.tronco
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(*) as complete from meso_agent_complete, meso_entrar where  meso_entrar.uniqueid = meso_agent_complete.uniqueid and meso_agent_complete.datahora > '${data1}' and meso_agent_complete.datahora < '${data2}' and meso_entrar.channel like '%${tronco}%'`;


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});

router.get("/troncoentrarrt/:tronco/:d1/:d2", async (req, res, next) => {
  let tronco = req.params.tronco
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(*) as entradart from meso_join_rt where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});

router.get("/operadorpin/:pin", verificaToken, async (req, res) => {
  let pin = req.params.pin
  // let datafim = req.params.d2;
  try {
    let qry = `
    select usuario from meso_operadores where pin = '${pin}'
    `;
    let res9 = await executaQry(qry);
    res.json(res9);
  } catch (e) {
    console.log(e);
  }
});

router.get("/discagem", verificaToken, async (req, res) => {

  try {
    let qry = `
   select * from meso_discagem;
    `;
    let res9 = await executaQry(qry);
    res.json(res9);
  } catch (e) {
    console.log(e);
  }
});

router.get("/tiradiscagem/:id", verificaToken, async (req, res, next) => {
  let id = req.params.id;
  console.log(id)
  try {
    let qry = `
          delete from meso_discagem where id = ${id}
        `;
        console.log(qry)
    let res28 = await executaQry(qry);
    res.json(res28);
  } catch (e) {
    console.log(e);
  }
});

router.post("/discagemaltera", verificaToken, async (req, res, next) => {
  console.log(req.body)
  let mostra = req.body;
  let {id, exten, nome } = mostra;
  console.log(id, exten, nome);

  try {
    let qry = `
          update meso_discagem set exten='${exten}',  nome='${nome}' where id = ${id}
        `;
        console.log(qry)

    let res14 = await executaQry(qry);
    res.json(res14);
  } catch (e) {
    res.json({ message: e.message })
  }
});

router.post("/inserediscagem", verificaToken, async (req, res, next) => {
    let mostra = req.body;
  let { exten, nome } = mostra;
  console.log(exten, nome);
  try {
    let qry = `
          insert into meso_discagem(exten, nome)
          values ('${exten}', '${nome}')
        `;
        console.log(qry)

    let res26 = await executaQry(qry);
    res.json(res26);
  } catch (e) {
    console.log(e);
  }
});

router.get("/callrec/:d1/:d2/:canal", verificaToken, async (req, res) => {
  
  let data1 = req.params.d1
  let data2 = req.params.d2
  let canal = 'SIP/'+req.params.canal
 // let datafim = req.params.d2;
  try {
    let qry = `
    select * from meso_consulta where datahora >= '${data1}' and datahora <= '${data2}' and solicitante ='${canal}'
    `;

    console.log('\n callrec\n',qry )
    let res9 = await executaQry(qry);
    res.json(res9);
  } catch (e) {
    console.log(e);
  }

});

router.post("/gravaconsulta", async (req, res, next) => {
  console.log(req.body)
  let mostra = req.body;
  let { caminho } = mostra;

  res.download(caminho)
  


});


//------------------------------------------------------------------------------------------------------------------------------------------------
//--------------------------------------------GOMG------------------------------------------------------------------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------------------------------------------------------------------
//CONTADOR DE URA comg------------------------------------------------------------------------------------------------------------------------------------------------

router.get("/ura/:opcao/:d1/:d2", verificaToken, async (req, res) => {
  let opcao = req.params.opcao
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
 // let datafim = req.params.d2;
  try {
    let qry = `
    select opcao, count(*) as qtd from meso_ura where opcao ='${opcao}' and datahora > '${data1}' and datahora < '${data2}';
    `;
    let res9 = await executaQry(qry);
    res.json(res9);
  } catch (e) {
    console.log(e);
  }
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------

//INFO COM CPF DO PAINEL DO AGENTE DA COMG--------------------------------------------------------------------------------------------------------------------------------------------------------------------

router.get("/cpfcomginfo/:ramal/:fila/", verificaToken, async (req, res) => {
  ramal= req.params.ramal
  fila= req.params.fila
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select distinct meso_operadores_em_ligacao.*, meso_cpf.cpf as cpf, meso_agent_connect.uniqueid from meso_operadores_em_ligacao, meso_cpf, meso_agent_connect where meso_agent_connect.uniqueid = '${fila}' and meso_operadores_em_ligacao.callerid1 = '${ramal}' or meso_operadores_em_ligacao.callerid2 = '${ramal}' and meso_operadores_em_ligacao.uniqueid1 = meso_agent_connect.fila or meso_operadores_em_ligacao.uniqueid2 = meso_agent_connect.fila and meso_cpf.uniqueid = meso_operadores_em_ligacao.uniqueid1 or meso_cpf.uniqueid = meso_operadores_em_ligacao.uniqueid2;
    `;
    console.log(qry)
    let res51 = await executaQry(qry);
    res.json(res51);
  } catch (e) {
    console.log(e);
  }
});

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------
//relatório de service da COMG--------------------------------------------------------------------------------------------------------------------------------------------------------------------


router.get("/entroucomg/:d1/:d2/", verificaToken, async (req, res) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select distinct calleridnum as entrou from meso_entrar where DataHora > '${data1}' and DataHora < '${data2}';;
    `;
    console.log(qry)
    let res51 = await executaQry(qry);
    res.json(res51);
  } catch (e) {
    console.log(e);
  }
});

router.get("/abandoncomg/:d1/:d2/", verificaToken, async (req, res) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select distinct meso_entrar.calleridnum as abandon  from meso_entrar, meso_abandon where meso_entrar.uniqueid = meso_abandon.uniqueid and meso_entrar.DataHora > '${data1}' and meso_entrar.DataHora < '${data2}';
    `;
    console.log(qry)
    let res51 = await executaQry(qry);
    res.json(res51);
  } catch (e) {
    console.log(e);
  }
});


router.get("/completecomg/:d1/:d2/", verificaToken, async (req, res) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  //let dataini = req.params.d1;
 // let datafim = req.params.d2;
  try {
    let qry = `
    select distinct meso_entrar.calleridnum as complete  from meso_entrar, meso_agent_complete where meso_entrar.uniqueid = meso_agent_complete.uniqueid and meso_entrar.DataHora > '${data1}' and meso_entrar.DataHora < '${data2}';
    `;
    console.log(qry)
    let res51 = await executaQry(qry);
    res.json(res51);
  } catch (e) {
    console.log(e);
  }
});



module.exports = router;



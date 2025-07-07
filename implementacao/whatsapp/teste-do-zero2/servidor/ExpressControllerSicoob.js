const express = require("express");
const router = express.Router();
const { executaQry } = require("../banco/bd");
const { executaQry2 } = require("../banco/db2");
const { geraToken } = require("./jwt/jwt");
const { send, sendImage, sendVideo, sendAudio, sendDocument, sendTemplate, download } = require('/whatsapp/webhook/methods.js');

const { executaQryServer } = require('../banco/dbServer')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const e = require("express");
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
var proxy = require('express-http-proxy');
const { exec } = require("child_process");



class ExpressController {
  constructor(expressAppWrapper, porta) {
    this.expressAppWrapper = expressAppWrapper;
    this.porta = porta
  }

  initializeRoutes() {
    this.expressAppWrapper.use(require('cors')());
    this.expressAppWrapper.use(require('helmet')());
    this.expressAppWrapper.use(require('express').json());
    this.expressAppWrapper.use(require('express').urlencoded({ extended: true }));

    this.expressAppWrapper.get('/', (req, res) => {
      res.send('***!');
    });

    this.expressAppWrapper.app.use('/whatsapp', proxy('https://meso.plugphone.cloud:3993/'));

    this.expressAppWrapper.get('/api/data', (req, res) => {
      res.json({ message: 'This is some data' });
    });

    this.expressAppWrapper.post('/api/data', (req, res) => {
      res.status(201).json({ message: 'Data saved' });
    });

    this.expressAppWrapper.get("/", (req, res) => {
      res.json({
        funcionou: false,
        msg: "PP2",
        dados: [],
      });
    });

    //Pesquisa de satisfação

    this.expressAppWrapper.get("/pesquisa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}' `;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);

    });

    this.expressAppWrapper.get("/buscarcontatos/:tipo", async (req, res, next) => {
      let qry
      
      let tipo = req.params.tipo

      
        qry = `select * from meso_contatos where setor = '${tipo}'`
      

      console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.get("/filtrocontatos/:usuario/:tipo/:estado", async (req, res, next) => {
      let qry
      let usuario = req.params.usuario
      let tipo = req.params.tipo
      let estado = req.params.estado

      if (tipo === 'Analista') {
        qry = `select distinct m.credor as nome, m.Telefone, m.processo,o.estado from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where idAgente = (select id from meso_usuariologin where usuario = '${usuario}') and o.estado = '${estado}' `
      } else if (tipo === 'Especialista') {
        qry = `select distinct m.credor as nome, m.Telefone, m.processo,o.estado from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where o.estado = '${estado}';`
      }

      console.log('contato', qry)
      let res20 = await executaQry(qry)
      res.json(res20)
      console.log('contatos resposta', res20)

    })

    this.expressAppWrapper.get("/mediapesquisa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select avg(nota) as medianota from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}' AND gostaria like '%SIM%' `;
      console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      console.log(res2);

    });

    //teste MedPesq1---------------------------------------------------------------------------------------------------------------------------------------------------
    this.expressAppWrapper.get("/mediapesquisa1/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sum(pergunta1 + pergunta2) as medianota from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}'`;
      console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      console.log(res2);

    });

    this.expressAppWrapper.post("/reciveMsg", async (req, res, next) => {

      let telefone = req.body.telefone
      let telFormatado = telefone

      if (telefone.length == 13) {
        telFormatado = telefone.substring(0, 4) + telefone.substring(5)
      }

      let qry = ` select * from meso_mensagens_solicitante where telefone like "${telFormatado}"`;

      console.log('qry:', qry)
      let res3 = await executaQry(qry);
      res.json(res3);
      console.log(res3);

    });

    this.expressAppWrapper.get("/mediapesquisaconta/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(pergunta1)as contapesq from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}'`;
      console.log(qry);
      let res2 = await executaQry(qry);
      res.json(res2);
      console.log(res2);

    });

    this.expressAppWrapper.get("/listaanalista", async (req, res, next) => {
      let qry = `select * from meso_usuariologin where tipo = 'Analista'`;

      let res27 = await executaQry(qry);

      console.log('socaminha', res27)
      res.json(res27);

    });

    this.expressAppWrapper.get("/listaespecialista", async (req, res, next) => {
      let qry = `select * from meso_usuariologin where tipo = 'Especialista'`;

      let res27 = await executaQry(qry);

      console.log('socaminha', res27)
      res.json(res27);

    });

    //Campanha fila

    //Segunda bolinha do painel de filas - Chamadas em fila//
    this.expressAppWrapper.get("/listajoin/:fila", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let qry = `select * from meso_join_rt where fila = '${filacompleta}'`;
      console.log(qry);

      let res30 = await executaQry(qry);
      res.json(res30);
      console.log(res30);

    });
    //Primeira bolinha do painel das filas

    this.expressAppWrapper.get("/listajointotal/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_entrar where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      console.log(qry);

      let res31 = await executaQry(qry);
      res.json(res31);
      console.log(res31);

    });

    //Terceira bolinha de chamadas conectadas na fila, isto é, aquelas chamadas que estão em curso

    this.expressAppWrapper.get("/filaconectada/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;

      let qry = `select * from meso_call_connected_rt where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'`;
      console.log(qry);

      console.log(qry)

      let res32 = await executaQry(qry);
      res.json(res32);
      console.log(res32);

    });
    //Quarta bolinha de chamadas da fila - Abandonadas do dia

    this.expressAppWrapper.get("/filasabandonadas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      console.log(res33);

    });
    //Sexta bolinha tma

    this.expressAppWrapper.get("/tmafilas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'


      let qry = `select avg(talktime) as mediaANNA from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      console.log(res99);

    });

    this.expressAppWrapper.get("/mediatmasainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select time_format(sec_to_time(avg(billsec)), '%H:%i:%s') as mediaTma from cdr where calldate >= '${data1}' and calldate <= '${data2}' and cnum = '${ramal}' and disposition = 'ANSWERED' and lastapp = 'Dial'`;
      console.log(qry)

      let res1 = await executaQry(qry);
      res.json(res1)
      console.log(res1);
    })

    //Setima bolinha TME Atendidas

    this.expressAppWrapper.get("/tmefilas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      console.log(qry);

      let res35 = await executaQry(qry);
      res.json(res35);
      console.log(res35);

    });

    this.expressAppWrapper.get("/tmesainte/:d1/:d2/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' where cnum = '${ramal}'`;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);
    })

    //Oitava bolinha TME do abandono

    this.expressAppWrapper.get("/tmefilasabandonadas/:fila/:d1/:d2", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaesperaabandonada from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
      console.log(qry);

      let res35 = await executaQry(qry);
      res.json(res35);
      console.log(res35);

    });

    this.expressAppWrapper.get("tmeabandonadassainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' where cnum = '${ramal}'`;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);
    });
    //Fim da campanha fila
    //Listar filas
    this.expressAppWrapper.get("/listafilastotais", async (req, res, next) => {

      let qry = `select extension, descr from queues_config `;
      console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      console.log(res38);

    });

    //FIM de Listar filas
    //Listar ramais
    this.expressAppWrapper.get("/listaramais", async (req, res, next) => {

      let qry = `select extension, name from users `;
      console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      console.log(res38);

    });
    //FIM listar ramais
    this.expressAppWrapper.get("/realramal", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from meso_operadores_rt`;
      console.log(qry);

      let res36 = await executaQry(qry);
      res.json(res36);
      console.log(res36);

    });

    this.expressAppWrapper.get("/detalhesligacoes/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select distinct * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid and table1.datahora > '${data1}' and table1.datahora < '${data2};' `;
      console.log(qry);

      console.log(qry)
      let res20 = await executaQry(qry);
      res.json(res20);
      console.log(res20);


    });

    //Listar operadores
    this.expressAppWrapper.get("/listaoperadores", async (req, res, next) => {

      let qry = `select * from meso_operadores `;
      console.log(qry);
      /*select *  from meso_logado msl
      left join meso_operadores mso on msl.pin = mso.pin
      where mso.id is not null
      */

      let res4 = await executaQry(qry);
      res.json(res4);
      console.log(res4);

    });
    //Ligações de entrada
    this.expressAppWrapper.get("/recebidafila/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_entrar where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      console.log(res20);

    });

    this.expressAppWrapper.get("/recebidasucesso/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_agent_complete where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      console.log(res20);

    });

    this.expressAppWrapper.get("/recebidaabandon/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_abandon where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      console.log(res20);

    });
    this.expressAppWrapper.get("/recebidajoin/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select * from meso_entrar where fila = '${filacompleta}' and datahora > '${data1}' and datahora < '${data2}'; `

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      console.log(qry);

      let res20 = await executaQry(qry);
      res.json(res20);
      console.log(res20);

    });
    this.expressAppWrapper.get("/recebidaespera/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select sec_to_time(sum(meso_abandon.holdtime))as espera from meso_abandon  where meso_abandon.fila= '${filacompleta}' and meso_abandon.datahora > '${data1}' and meso_abandon.datahora < '${data2}';`

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      console.log(qry);
      console.log(qry)
      let res20 = await executaQry(qry);
      res.json(res20);
      console.log(res20);

    });
    this.expressAppWrapper.get("/recebidaesperaatende/:fila/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let filacompleta = req.params.fila;
      let qry = `select sec_to_time(sum(meso_agent_complete.holdtime))as esperaAtende from meso_agent_complete  where meso_agent_complete.fila= '${filacompleta}' and meso_agent_complete.datahora > '${data1}' and meso_agent_complete.datahora < '${data2}';`

      //let qry = `select * from meso_agent_complete AS table1 inner join meso_bridge as table2 on table1.uniqueid = table2.uniqueid1 inner join cdr as table3 on table3.uniqueid = table1.uniqueid and datahora > '${data1}' and datahora < '${data2} limit 1;' `;
      console.log(qry);
      let res20 = await executaQry(qry);
      res.json(res20);
      console.log(res20);

    });
    //FIM DE ligações de entrada

    //FLUXO DE LIGAÇÃO POR HORA
    this.expressAppWrapper.get("/dashpizza/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_entrar where datahora > '${data1}' and datahora < '${data2}'`;
      console.log(qry);


      let res24 = await executaQry(qry);
      res.json(res24);
      console.log(res24);

    });

    //FIM DO FLUXO DE CHAMADA

    //PAUSA
    this.expressAppWrapper.get("/pausa/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1
      let data2 = req.params.d2

      // let data2 = req.params.d2 + ' 23:59:59'

      let qry = ` select *, timediff(meso_pausa_fila.despausado, meso_pausa_fila.datahora) as duracao from meso_pausa_fila, logs where meso_pausa_fila.despausado != '0000-00-00 00:00:00' and  meso_pausa_fila.datahora = logs.datahora or logs.datahora = meso_pausa_fila.datahora -1 and logs.datahora = meso_pausa_fila.datahora and meso_pausa_fila.datahora > '${data1}'  and meso_pausa_fila.datahora < '${data2}';
      `;
      console.log(qry);

      let res17 = await executaQry(qry);
      res.json(res17);
      console.log(res17);

    });

    //DASHBOARD

    this.expressAppWrapper.get("/filaabandono/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_abandon where datahora > '${data1}' and datahora < '${data2}' `;
      console.log(qry);

      let res25 = await executaQry(qry);
      res.json(res25);
      console.log(res25);

    });

    //Circulo do painel principal Em Ligação cor Azul [como fazer o calculo?]
    //Na verdade o que eu fiz foi atendidas e não realtime do em ligação.... ;(
    this.expressAppWrapper.get("/dashligacao", async (req, res, next) => {

      let qry = `select distinct uniqueid1 from meso_operadores_em_ligacao `;
      console.log(qry);


      let res5 = await executaQry(qry);
      res.json(res5);
      console.log(res5);

    });

    //Circulo do painel principal Logados cor Verde

    this.expressAppWrapper.get("/dashlogados", async (req, res, next) => {

      let qry = `select distinct pin from meso_logado `;
      console.log(qry);


      let res2 = await executaQry(qry);
      res.json(res2);
      console.log(res2);

    });

    //Circulo do painel principal Pausados cor Amarela

    this.expressAppWrapper.get("/dashpausados", async (req, res, next) => {

      let qry = `select * from meso_pausado `;
      console.log(qry);


      let res3 = await executaQry(qry);
      res.json(res3);
      console.log(res3);

    });

    this.expressAppWrapper.get("/dashdeslogados", async (req, res, next) => {

      let qry = `select * from users `;
      console.log(qry);
      /*select *  from meso_logado msl
      left join meso_operadores mso on msl.pin = mso.pin
      where mso.id is not null
      */

      let res4 = await executaQry2(qry);
      res.json(res4);
      console.log(res4);

    });

    this.expressAppWrapper.get("/fluxohora/:d1", async (req, res, next) => {
      let data1 = req.params.d1

      let qry = `select * from meso_fluxo_ligacao where datahora = '${data1}' `;
      console.log(qry);

      let res23 = await executaQry(qry);
      res.json(res23);
      console.log(res23);

    });


    this.expressAppWrapper.get("/estoque/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1
      let data2 = req.params.d2
      let qry = `select * from meso_estoque where diaatual >= '${data1}' and diaatual <= '${data2}' `;
      console.log(qry);

      let res32 = await executaQry(qry);
      res.json(res32);
      console.log(res32);

    });

    this.expressAppWrapper.get("/gravacao/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select src, dst, duration, recordingfile from cdr where calldate > '${data1}' and calldate < '${data2}' `;
      console.log(qry);

      let res199 = await executaQry(qry);
      res.json(res199);
      console.log(res199);

    });


    //novo fluxo para finalizar o testeligahora

    this.expressAppWrapper.get("/fluxoteste/:d1", async (req, res, next) => {

      let data1 = req.params.d1

      let qry = `select * from meso_entrar where datahora like '${data1}%'  order by 'datahora';`;
      console.log('teste qualquer coisa', qry);

      console.log('aaaaaaaaaaaaaaaaaaaaaaa', qry)
      let res6 = await executaQry(qry);
      res.json(res6);
      console.log(res6);

    });



    //Login-------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/loginconfere", async (req, res) => {
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
        console.log(qry);

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

    let uploadArquivo = function () {
      const uploadPath = path.join(__dirname, 'documentos')
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      const storage = multer.diskStorage({
        destination: function (req, file, cb) {
          cb(null, uploadPath)
        },
        filename: function (req, file, cb) {
          cb(null, file.originalname)

        }
      })
      return multer({ storage: storage })
    }
    let lerCsv = async function (fileName) {
      const filePath = path.join(__dirname, 'documentos', fileName);
      const results = [];

      return new Promise((resolve, reject) => {
        fs.createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            resolve(results);
          })
          .on('error', (error) => {
            reject(error);
          });
      });
    };


    let terminou = false;

    const upload = uploadArquivo();
    let inserirCsv = async (resultadoCsv, usuario) => {
      for (const e of resultadoCsv) {
        // Primeira query para inserir em meso_mealing
        console.log(e.Telefone)
        let qry = `INSERT INTO meso_mealing VALUES (0, '${e.Ano}', '${e.Orgao}', '${e.Processo}', '${e.Liquidacao}', '${e.Valorface}', '${e.Credor}', '${e.Documento}', '${e.Idade}', '${e.Renda}', '${e.Tipo}', '${e.Telefone}', (SELECT id FROM meso_usuariologin WHERE usuario = '${usuario}'), NOW())`;

        console.log('eu sou inserir csv', qry);
        await executaQry(qry);

        // Adicionando um delay de 1 segundo

        // Segunda query para inserir em meso_oportunidade
        /*let qry1 = `INSERT INTO meso_oportunidade (telefone, idAgente, idMealing) 
                    VALUES ('${e.Telefone}', 
                    (SELECT id FROM meso_usuariologin WHERE usuario = '${usuario}'), 
                    (SELECT idMealing FROM meso_mealing WHERE processo = '${e.Processo}' ORDER BY idMealing DESC LIMIT 1))`;
        
        await executaQry(qry1);*/
      }
    }



    /*
    idMealing INT(11) NOT NULL AUTO_INCREMENT,
    ano
    orgao
    processo
    liquidacao
    valor_da_face
    credor
    documento
    idade
    renda
    tipo
    telefone
    idAgente
    
    */

    this.expressAppWrapper.app.post('/upload', upload.single('file'), async (req, res) => {
      let usuario = req.body.usuario
      console.log('Olha o usuario aqui gente', usuario)
      //console.log('Arquivo recebido');
      const file = req.file;
      if (!file) {
        return res.status(400).send('Nenhum arquivo enviado');
      }
      try {
        const dadosCsv = await lerCsv(file.originalname);
        await inserirCsv(dadosCsv, usuario,

        );
        res.send('Arquivo recebido e salvo com sucesso');
      } catch (error) {
        console.error('Erro ao processar o arquivo:', error);
        res.status(500).send('Erro ao processar o arquivo');
      }
    });

    this.expressAppWrapper.get('/oportunidade/:processo/:plataforma', async (req, res, next) => {

      let processo = req.params.processo
      let plataforma = req.params.plataforma
      let ids


      let qry1 = `select idMealing,idAgente from meso_mealing where processo = '${processo}' order by idMealing limit 1 `
      ids = await executaQry(qry1)

      let qry3 = `select idPlatarforma from meso_plataforma where platarforma = '${plataforma}' order by idPlatarforma limit 1`
      console.log('casca de bala', qry3)
      let idPlataforma = await executaQry(qry3);
      console.log('chupeta de baleia', idPlataforma.dados[0])

      let qry4 = `select idMealing from meso_oportunidade where idMealing = ${ids.dados[0].idMealing}`
      let isCadastrado = await executaQry(qry4)
      console.log('estou cadastrado?', isCadastrado.dados.length)

      if (isCadastrado.dados.length == 0) {
        let qry = `insert into meso_oportunidade (idMealing, idAnalista, idPlataforma,dataInicio,estado) values (${ids.dados[0].idMealing}, ${ids.dados[0].idAgente}, ${idPlataforma.dados[0].idPlatarforma},now(),'em andamento') `
        let res29 = await executaQry(qry);
        console.log('sou qry', qry)
        res.json(res29);
      }
    })

    this.expressAppWrapper.get('/oportunidadeespecialista/:processo/:plataforma/:usuario', async (req, res, next) => {
      let processo = req.params.processo
      let plataforma = req.params.plataforma
      let usuario = req.params.usuario
      let ids

      let qry1 = `select o.idMealing,o.idOportunidade from meso_mealing as m inner join meso_oportunidade as o on (m.idMealing = o.idMealing) where m.processo = '${processo}'`
      console.log('cadelo', qry1)
      ids = await executaQry(qry1)
      console.log('Xoxota aqui', ids)

      let qry3 = `select idPlatarforma from meso_plataforma where platarforma = '${plataforma}' order by idPlatarforma limit 1`
      let idPlataforma = await executaQry(qry3);
      console.log('chupeta de baleia', idPlataforma.dados[0])

      let qry5 = `select idMealing from meso_finaliza where idMealing = ${ids.dados[0].idMealing}`
      let isCadastrado = await executaQry(qry5)
      console.log('estou cadastrado?', isCadastrado.dados.length)

      if (isCadastrado.dados.length == 0) {
        let qry = `insert into meso_finaliza (idMealing,idOportunidade,idPlataforma,idEspecialista,observacao,estado,dataInicio) values (${ids.dados[0].idMealing}, ${ids.dados[0].idOportunidade},${idPlataforma.dados[0].idPlatarforma},(select id from meso_usuariologin where usuario = '${usuario}'),(select observacao from meso_oportunidade where idMealing = ${ids.dados[0].idMealing}),'em atendimento especialista',now())`
        let res29 = await executaQry(qry);
        console.log('sou qry', qry)
        res.json(res29);
      }
    })

    this.expressAppWrapper.get('/finaliza/:processo/:estado', async (req, res, next) => {
      let processo = req.params.processo
      let estado = req.params.estado
      let qry = `update meso_finaliza set dataFim = now(), estado = '${estado}' where idMealing = (select idMealing from meso_mealing where processo = '${processo}')`
      let res2 = await executaQry(qry)
      res.json(res2)
    })

    this.expressAppWrapper.get('/atendimentogeral/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      console.log('chapisco')
      let data2 = req.params.d2 + " 23:59:59"
      let qry1 = `select u.usuario,count(o.idPlataforma) as quantPlataforma,sum(case when o.atendeu = 1 then 1 else 0 end) as atendeu,p.platarforma from meso_oportunidade as o inner join meso_usuariologin as u on (o.idAnalista = u.id) inner join meso_plataforma as p on (o.idPlataforma = p.idPlatarforma) where idPlataforma IN (1, 2) and  o.dataInicio >= '${data1}' and o.dataInicio <= '${data2}' group by u.usuario, p.platarforma;`
      let res1 = await executaQry(qry1)
      console.log(qry1)

      res.json(res1)
    })

    this.expressAppWrapper.get('/atendimentogeralespecialista/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      console.log('chapisco')
      let data2 = req.params.d2 + " 23:59:59"
      let qry1 = `select u.usuario,count(f.idPlataforma) as quantPlataforma,sum(case when f.estado = 'aprovado' then 1 else 0 end) as atendeu,p.platarforma from meso_finaliza as f inner join meso_usuariologin as u on (f.idEspecialista = u.id) inner join meso_plataforma as p on (f.idPlataforma = p.idPlatarforma) where idPlataforma IN (1, 2) and  f.dataInicio >= '${data1}' and f.dataInicio <= '${data2}' group by u.usuario, p.platarforma;`
      let res1 = await executaQry(qry1)
      console.log(qry1)

      res.json(res1)
    })

    this.expressAppWrapper.get('/tmazap/:analista/:d1/:d2', async (req, res, next) => {
      let analista = req.params.analista
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"

      let qry1 = `select u.usuario as nome,p.platarforma as plataforma,count(o.idOportunidade)as quantidade,sec_to_time(sum(time_to_sec(timediff(o.dataFim,o.dataInicio)))) as tempo  from meso_oportunidade as o inner join meso_plataforma as p on (o.idPlataforma = p.idPlatarforma) inner join meso_usuariologin as u on (o.idAnalista = u.id) where p.idPlatarforma = 1 and u.usuario = '${analista}' and dataInicio >= '${data1}' and dataInicio <= '${data2}';`
      let res1 = await executaQry(qry1)
      let qry2 = `select u.usuario as nome,p.platarforma as plataforma,count(o.idOportunidade)as quantidade,sec_to_time(sum(time_to_sec(timediff(o.dataFim,o.dataInicio)))) as tempo from meso_oportunidade as o inner join meso_plataforma as p on (o.idPlataforma = p.idPlatarforma) inner join meso_usuariologin as u on (o.idAnalista = u.id) where p.idPlatarforma = 2 and u.usuario = '${analista}' and dataInicio >= '${data1}' and dataInicio <= '${data2}';`
      let res2 = await executaQry(qry2)
      let qry3 = `select avg(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as media,max(TIMESTAMPDIFF(SECOND, dataInicio, dataFim))  as maxDuracao  from meso_oportunidade where idAnalista = (select id from meso_usuariologin where usuario = '${analista}' and idPlataforma = 1);`
      let res3 = await executaQry(qry3)
      let qry4 = `select avg(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as media,max(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as maxDuracao from meso_oportunidade where idAnalista = (select id from meso_usuariologin where usuario = '${analista}' and idPlataforma = 2);`
      let res4 = await executaQry(qry4)

      console.log('qry1', qry1)
      console.log('qry2', qry2)

      let tudo = {
        whastzap: res1.dados[0], // Supondo que res1 retorne um array com um único objeto
        telefone: res2.dados[0],
        zap1: res3.dados[0],   // O mesmo para res2
        tel1: res4.dados[0],
      }

      let whastzap = { ...tudo.whastzap, ...tudo.zap1 }

      let telefone = { ...tudo.telefone, ...tudo.tel1 }


      let tudo1 = {
        whastzap,
        telefone
      }

      res.json(tudo1)

      console.log(tudo1)
    })

    this.expressAppWrapper.get('/tmazapespecialista/:especialista/:d1/:d2', async (req, res, next) => {
      let especialista = req.params.especialista
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"

      let qry1 = `select u.usuario as nome,p.platarforma as plataforma,count(f.idEspecialista)as quantidade,sec_to_time(sum(time_to_sec(timediff(f.dataFim,f.dataInicio)))) as tempo  from meso_finaliza as f inner join meso_plataforma as p on (f.idPlataforma = p.idPlatarforma) inner join meso_usuariologin as u on (f.idEspecialista = u.id) where p.idPlatarforma = 1 and u.usuario =  '${especialista}' and dataInicio >= '${data1}' and dataInicio <= '${data2}';`
      let res1 = await executaQry(qry1)
      let qry2 = `select u.usuario as nome,p.platarforma as plataforma,count(f.idFinaliza)as quantidade,sec_to_time(sum(time_to_sec(timediff(f.dataFim,f.dataInicio)))) as tempo from meso_finaliza as f inner join meso_plataforma as p on (f.idPlataforma = p.idPlatarforma) inner join meso_usuariologin as u on (f.idEspecialista = u.id) where p.idPlatarforma = 2 and u.usuario = '${especialista}' and dataInicio >= '${data1}' and dataInicio <= '${data2}';`
      let res2 = await executaQry(qry2)
      let qry3 = `select avg(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as media,max(TIMESTAMPDIFF(SECOND, dataInicio, dataFim))  as maxDuracao  from meso_finaliza  where idEspecialista = (select id from meso_usuariologin where usuario = '${especialista}' and idPlataforma = 1);`
      let res3 = await executaQry(qry3)
      let qry4 = `select avg(TIMESTAMPDIFF(SECOND, dataInicio, dataFim)) as media,max(TIMESTAMPDIFF(SECOND, dataInicio, dataFim))  as maxDuracao  from meso_finaliza  where idEspecialista = (select id from meso_usuariologin where usuario = '${especialista}' and idPlataforma = 2);`
      let res4 = await executaQry(qry4)

      console.log('qry1', qry1)
      console.log('qry2', qry2)

      let tudo = {
        whastzap: res1.dados[0], // Supondo que res1 retorne um array com um único objeto
        telefone: res2.dados[0],
        zap1: res3.dados[0],   // O mesmo para res2
        tel1: res4.dados[0],
      }

      let whastzap = { ...tudo.whastzap, ...tudo.zap1 }

      let telefone = { ...tudo.telefone, ...tudo.tel1 }


      let tudo1 = {
        whastzap,
        telefone
      }

      res.json(tudo1)

      console.log(tudo1)
    })

    this.expressAppWrapper.get('/detalhezap/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"
      let qry = `select u.usuario, m.credor,m.processo,o.estado,date_format(o.dataInicio,'%d-%m-%Y %H:%i:%S') as dataInicio,date_format(o.dataFim,'%d-%m-%Y %H:%i:%S') as dataFim,p.Platarforma from meso_usuariologin as u inner join meso_mealing as m on (u.id = m.idAgente) inner join meso_oportunidade as o on (o.idMealing = m.idMealing) inner join meso_plataforma as p on (p.idPlatarforma = o.idPlataforma) where o.dataInicio >= '${data1}' and o.dataFim <= '${data2}'`
      console.log(qry)
      let res1 = await executaQry(qry)
      res.json(res1)
      console.log(res1)
    })

    this.expressAppWrapper.get('/detalhezapespecialista/:d1/:d2', async (req, res, next) => {
      let data1 = req.params.d1 + " 00:00:00"
      let data2 = req.params.d2 + " 23:59:59"
      let qry = `select u.usuario, m.credor,m.processo,f.estado,date_format(f.dataInicio,'%d-%m-%Y %H:%i:%S') as dataInicio,date_format(f.dataFim,'%d-%m-%Y %H:%i:%S') as dataFim,p.Platarforma from meso_usuariologin as u inner join meso_finaliza as f on (u.id = f.idEspecialista) inner join meso_mealing as m on (m.idMealing = f.idMealing)  inner join meso_plataforma as p on (p.idPlatarforma = f.idPlataforma) where f.dataInicio >= '${data1}' and f.dataFim <= '${data2}'`
      console.log(qry)
      let res1 = await executaQry(qry)
      res.json(res1)
      console.log(res1)
    })

    this.expressAppWrapper.get('/buscarcsv', async (req, res, next) => {
      if (terminou) {
        let qry = `select * from meso_mealing`
        console.log(qry)
        let res1 = await executaQry(qry)
        res.json(res1)
        console.log('to aqui')
        terminou = false;
      }
    })

    //fim de login--------------------------------------------------------------------------

    //TMA ----------------------------------------------------------------------------------
    this.expressAppWrapper.get("/tma/:d1/:d2/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'


      let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${fila}'  and connectedlinenum = '${ramal}'`;
      console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      console.log(res99);

    });



    this.expressAppWrapper.get("/nomeramal/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;



      let qry = `select distinct connectedlinename as usuario from meso_agent_complete where fila = '${fila}'  and connectedlinenum = '${ramal}'`;
      console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      console.log(res99);

    });

    this.expressAppWrapper.get("/nomeramalsainte/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let qry = `select distinct cnam as usuario from cdr where cnum = '${ramal}'`;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);

    });

    this.expressAppWrapper.get("/ramaltma/:fila/:ramal", async (req, res, next) => {
      let fila = req.params.fila;
      let ramal = req.params.ramal;



      let qry = `select distinct connectedlinenum as ramal from meso_agent_complete where fila = '${fila}'  and connectedlinenum = '${ramal}'`;
      console.log(qry);

      let res99 = await executaQry(qry);
      res.json(res99);
      console.log(res99);

    });

    this.expressAppWrapper.get("/ramaltmasainte/:ramal", async (req, res, next) => {
      let ramal = req.params.ramal;
      let qry = `select distinct cnum as ramal from cdr where cnum = '${ramal}'`
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);
    })

    this.expressAppWrapper.get("/mediatma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select avg(talktime) as mediatma from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and connectedlinenum = '${ramal}' `;
      console.log(qry);

      let res39 = await executaQry(qry);
      res.json(res39);
      console.log(res39);

    });

    this.expressAppWrapper.get("/totalchamadastma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and connectedlinenum = '${ramal}' `;
      console.log(qry);

      let res40 = await executaQry(qry);
      res.json(res40);
      console.log(res40);

    });

    this.expressAppWrapper.get("/totalchamadastmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d1 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select * from cdr where calldate >= '${data1}' and calldate <= '${data2}' and cnum = '${ramal}' and disposition = 'ANSWERED' and lastapp = 'Dial'`;
      console.log('xereco', qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      //console.log(res1)
    })

    this.expressAppWrapper.get("/totalduracaotma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select sum(talktime) as duracaototal from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and connectedlinenum = '${ramal}' `;
      console.log(qry);

      let res41 = await executaQry(qry);
      res.json(res41);
      console.log(res41);

    });

    this.expressAppWrapper.get("/totalduracaotmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select sum(billsec) as duracaototal from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`
      console.log(qry)

      let res1 = await executaQry(qry)
      res.json(res1)
      console.log(res1)
    })

    this.expressAppWrapper.get("/maximaduracaotma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select max(talktime) as duracaomaxima from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'
      and connectedlinenum = '${ramal}' `;
      console.log(qry);

      let res42 = await executaQry(qry);
      res.json(res42);
      console.log(res42);

    });

    this.expressAppWrapper.get("/maximaduracaotmasainte/:d1/:d2/:ramal", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let ramal = req.params.ramal
      let qry = `select max(billsec) as duracaomaxima from cdr where calldate  > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1)
    })
    //Iinicio conexões---------------------------------------------------------------------------------
    this.expressAppWrapper.get("/listnum/:agent", async (req, res, next) => {

      let agent = req.params.agent
      let qry = `select extension from users where name = '${agent}'`;
      console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/primeiracon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select min(datahora) as mindata from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/primeiraconsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select min(datahora) as mindata from meso_login_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log('#ReginaldoCompraUmArCondicionadoParaGente', qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/ultimacon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select max(datahora) as maxdata from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });



    this.expressAppWrapper.get("/ultimaconsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select max(datahora) as maxdata from meso_login_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/numcount/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as numcon from meso_login_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/numchamada/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as ligacoes from meso_agent_connect where connectedlinenum = '${ramal}' and uniqueid = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/numcall/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as acalled from meso_agent_called where connectedlinenum = '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/durpausa/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct SEC_TO_TIME(sum(time_to_sec(TIMEDIFF(despausado, datahora)))) as durpause from meso_pausa_fila where membername = '${ramal}' and datahora >= '${data1}' and datahora <= '${data2};
      '
      `;
      console.log(qry);




      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/talktime/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct SEC_TO_TIME(sum(talktime)) as talktime from meso_agent_complete where connectedlinenum = '${ramal}' or calleridnum= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2};
      '
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1
      let data2 = req.params.d2
      let qry = `select sec_to_time(sum(time_to_sec(timediff(terminoligacao,inicioligacao)))) as talktime from meso_detalhe_sainte where solicitante = '${ramal}' `
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/duracon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(desloga, datahora)))) as durcon from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });



    this.expressAppWrapper.get("/duracomsainte/:ramal/:d1/:d2", async (req, res, next) => {
      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(desloga, datahora)))) as durcon from meso_login_fila where membername = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      console.log('wof wof wof, só as cachorras', qry)

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1)
    })

    this.expressAppWrapper.get("/numpausa/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select count(evento) as pausas from meso_pausa_fila where membername = '${ramal}' and fila = '${fila}' and datahora >= '${data1}' and datahora <= '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });



    //Fim conexões--------------------------------------------------------------------------------------------------------------

    //Inicio service-----------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/duraconsec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(time_to_sec(TIMEDIFF(desloga, datahora))) as durconsec from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/duraconsecsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(time_to_sec(TIMEDIFF(desloga, datahora))) as durconsec from meso_login_fila where membername = '${ramal}'  and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/verificadur/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(TIMEDIFF(desloga, datahora)) as verificadur from meso_login_fila where membername = '${ramal}' and fila ='${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/verificadursainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select SUM(TIMEDIFF(desloga, datahora)) as verificadur from meso_login_fila where membername = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      console.log(qry);


      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let fila = req.params.fila
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select distinct sum(talktime) as talktimesec from meso_agent_complete where connectedlinenum = '${ramal}' or calleridnum= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2};
      '
      `;
      console.log(qry);
      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/talktimesecsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select sum(time_to_sec(timediff(terminoligacao,inicioligacao))) as talktimesec from meso_detalhe_sainte where solicitante = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
      console.log('salve', qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/ultimologoff/:ramal/:fila/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let fila = req.params.fila
      let qry = `select MAX(datahora) as maxlogoff from meso_desloga_fila where membername= '${ramal}' and fila = '${fila}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/ultimologoffsainte/:ramal/:d1/:d2", async (req, res, next) => {

      let ramal = 'SIP/' + req.params.ramal
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select MAX(datahora) as maxlogoff from meso_desloga_fila where membername= '${ramal}' and datahora > '${data1}' and datahora < '${data2}'
      `;
      console.log(qry);

      let res38 = await executaQry(qry);
      res.json(res38);
      console.log(res38);

    });

    //Fim service----------------------------------------------------------------------------------------------------------------------------------------------
    //Inicio tme-----------------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/somaespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(holdtime) as somaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      console.log(qry);

      let res43 = await executaQry(qry);
      res.json(res43);
      console.log(res43);

    });

    this.expressAppWrapper.get("/somasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as somasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      console.log('eu sou a melodia', qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);
    })

    this.expressAppWrapper.get("/mediaespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      console.log(qry);

      let res44 = await executaQry(qry);
      res.json(res44);
      console.log(res44);

    });

    this.expressAppWrapper.get("/mediaesperasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);
    })

    this.expressAppWrapper.get("/minimoespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select min(holdtime) as minimaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      console.log(qry);

      let res45 = await executaQry(qry);
      res.json(res45);
      console.log(res45);

    });

    this.expressAppWrapper.get("/minimoesperasainte/:ramal/:d1/:d2/", async (req, res, netx) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select min(billsec) as minimaesperasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);
    })

    this.expressAppWrapper.get("/maximoespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select max(holdtime) as maximaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      console.log(qry);

      let res45 = await executaQry(qry);
      res.json(res45);
      console.log(res45);

    });

    this.expressAppWrapper.get("/maximoesperasainte/:ramal/:d1/:d2/", async (req, res, netx) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select max(billsec) as maximoesperasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);
    })


    this.expressAppWrapper.get("/totalchamadasespera/:fila/:d1/:d2/", async (req, res, next) => {
      let filacompleta = req.params.fila;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
      console.log(qry);

      let res46 = await executaQry(qry);
      res.json(res46);
      console.log(res46);

    });

    this.expressAppWrapper.get("/totalchamadasesperasainte/:ramal/:d1/:d2/", async (req, res, next) => {
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
      console.log(qry);

      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);
    })

    //FIM TME----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

    //inicio relaório de tronco

    this.expressAppWrapper.get("/listartronco", async (req, res, next) => {

      let qry = `select * from trunks `;
      console.log(qry);

      let res38 = await executaQry2(qry);
      res.json(res38);
      console.log(res38);

    });

    this.expressAppWrapper.get("/troncoabandonadas/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as abandon from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      console.log(res33);

    });

    this.expressAppWrapper.get("/troncoentrar/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as entrada from meso_entrar where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      console.log(res33);

    });

    this.expressAppWrapper.get("/troncocomplete/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as complete from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      console.log(res33);

    });

    this.expressAppWrapper.get("/troncoentrarrt/:tronco/:d1/:d2", async (req, res, next) => {
      let tronco = req.params.tronco
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select count(*) as entradart from meso_join_rt where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
      console.log(qry);


      let res33 = await executaQry(qry);
      res.json(res33);
      console.log(res33);

    });


    this.expressAppWrapper.get("/ligar/:ramal/:telefone", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let telefone = req.params.telefone;
      let ramal = 'SIP/' + req.params.ramal;
      let ramal2 = req.params.ramal;

      console.log('teoricamente eu sou o telefone', telefone)
      console.log('talvez eu seja o ramal', ramal)



      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          action: "Originate",
          actionid: "321",
          Channel: ramal,
          Exten: telefone,
          priority: 1,
          Context: "from-internal",

        })
      res.status(200).send('ok')

    })



    //------------------------------------------------------------------------------------------------------------------------------------------------------------

    //Inicio meso estoque--------------------------------------------------------------------------------------------
    this.expressAppWrapper.get("/acciolyliga/:ramal/:telefone", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let ramal = req.params.ramal;
      let telefone = 'SIP/' + req.params.telefone;
      let telefone2 = req.params.telefone;

      let qry = ` update meso_estoque set situacao = 'Concluído' where ramalvendedor = '${telefone2}' and cliente = '${ramal}' `;
      console.log(qry);
      console.log(qry);
      let res132 = await executaQry(qry);
      res.json(res132);
      console.log(res132);


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          action: "Originate",
          actionid: "321",
          Channel: telefone,
          Exten: ramal,
          priority: 1,
          Context: "from-internal",

        })

    })

    this.expressAppWrapper.post("/acciolyaltera/", async (req, res, next) => {
      let id = req.body.id;
      let pedido = req.body.pedido;
      let situacao = req.body.situacao;
      let ramal = req.body.ramalvendedor;
      let telefone = req.body.cliente
      let d1 = req.body.diaatual
      let d2 = req.body.diaatual


      let qry = `update meso_estoque set pedido = '${pedido}', situacao = '${situacao}' where ramalvendedor ='${ramal}' and cliente='${telefone}' and diaatual >= '${d1}' and diaatual <= '${d2}'`;
      console.log(qry);


      console.log(qry)
      let res99 = await executaQry(qry);

      res.json(res99);
      console.log(res99);

    });


    //Operadores realtime--------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/realoperadorrt", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from meso_operadores_realtime`;
      console.log(qry);

      let res36 = await executaQry2(qry);
      res.json(res36);
      console.log(res36);

    });

    this.expressAppWrapper.get("/ajustaEstado", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      //let data1 = req.params.d1 + ' 00:00:00'
      //let data2 = req.params.d2 + ' 23:59:59'

      let qry = `update users set estado = 'deslogado' where fila = 0 and estado = 'logado';`;
      console.log(qry);

      let res36 = await executaQry2(qry);
      res.json(res36);
      console.log(res36);



    });

    //REAL OPERADOR------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/logarpainel", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          action: "QueueAdd",
          actionid: "123",
          Queue: fila,
          Interface: extension

        })
      try {
        let qry = `
                    insert into meso_logado(ramal ,pin, fila)
                    values ('${extensionsempin}','${extensionsempin}', '${fila}')
                  `;
        console.log(qry);

        console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperador", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'logado' where extension = '${extension}'
                        `;
        console.log(qry);
        console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperadorfila", async (req, res) => {
      let extension = req.body.extension;

      let fila = req.body.fila;



      try {
        let qry = `
                          update users set fila = '${fila}' where extension = '${extension}'
                        `;
        console.log(qry);
        console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });

    this.expressAppWrapper.post("/logslogin", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = req.body.extension;
      let fila = req.body.fila;

      try {
        let qry = `
                                insert into logs(user, ramal, fila, motivo, datahora)
                                values ('${extension}','${extension}', '${fila}','login', now())
                              `;
        console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        console.log(e);
      }

    });




    //-------------------------------------------------------------------------------------------------------------------------


    this.expressAppWrapper.get("/realoperadorlogados2/:ramal/:d1/:d2/", async (req, res, next) => {
      // let filacompleta = req.params.fila;
      let ramal = req.params.ramal;
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'

      let qry = `select * from logs where ramal like '%${ramal}%' and datahora >= '${data1}' and datahora <= '${data2}' order by '${data1}' `;
      console.log(`Les't go boys real opereador`, qry)

      let res37 = await executaQry(qry);
      res.json(res37);
      ////////console.log(res37);

    });


    this.expressAppWrapper.post("/deslogarpainel", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          action: "QueueRemove",
          actionid: "123",
          Queue: fila,
          Interface: extension

        })
      try {
        let qry = `                      delete from meso_logado where pin = '${extensionsempin}'
    
                  `;
        console.log(qry);

        console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });

    this.expressAppWrapper.post("/estadoperadordesloga", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'deslogado' where extension = '${extension}'
                        `;
        console.log(qry);
        console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });

    this.expressAppWrapper.post("/deslogaestadorfila", async (req, res) => {
      let extension = req.body.extension;

      let fila = req.body.fila;



      try {
        let qry = `
                          update users set fila = '0' where extension = '${extension}'
                        `;
        console.log(qry);
        console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });

    this.expressAppWrapper.post("/logsdeslogar", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = req.body.extension;
      let fila = req.body.fila;

      try {
        let qry = `
                                insert into logs(user, ramal, fila, motivo, datahora)
                                values ('${extension}','${extension}', '${fila}','logout', now())
                              `;
        console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        console.log(e);
      }

    });

    //-------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/pausarpainelrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          Action: "QueuePause",
          Actionid: "1234",
          Queue: fila,
          Interface: extension,
          Paused: true,
          Reason: 'teste razao'

        })
      try {
        let qry = `                      
        insert into meso_pausado(ramal ,pin, fila)
        values ('${extensionsempin}','${extensionsempin}', '${fila}')
                  `;
        console.log(qry);

        console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });

    this.expressAppWrapper.post("/pausarestado", async (req, res) => {

      let extension = req.body.extension;



      try {
        let qry = `
                          update users set estado = 'pausado' where extension = '${extension}'
                        `;
        console.log(qry);
        console.log('MUDA ESTADO PARA LOGADO', qry)
        let res47 = await executaQry2(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });


    this.expressAppWrapper.post("/logspausarrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = req.body.extension;
      let fila = req.body.fila;

      try {
        let qry = `
                                insert into logs(user, ramal, fila, motivo, datahora)
                                values ('${extension}','${extension}', '${fila}','pausain', now())
                              `;
        console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        console.log(e);
      }

    });


    //------------------------------------------------------------------------------------------------------------------------------------------

    this.expressAppWrapper.post("/despausarpainelrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = 'SIP/' + req.body.extension;
      let extensionsempin = req.body.extension;

      let fila = req.body.fila;


      var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'Mtes0206', true);
      // In case of any connectiviy problems we got you coverd.
      ami.keepConnected();

      ami.action(
        {
          Action: "QueuePause",
          Actionid: "1234",
          Queue: fila,
          Interface: extension,
          Paused: false,
          Reason: 'teste razao'

        })
      try {
        let qry = `                      
        delete from meso_pausado where pin =
        '${extensionsempin}'
                  `;
        console.log(qry);

        console.log(qry)
        let res47 = await executaQry(qry);
        res.json(res47);


      } catch (e) {
        console.log(e);
      }

    });




    this.expressAppWrapper.post("/logsdespausarrt", async (req, res) => {
      //let dataini = req.params.d1;
      // let datafim = req.params.d2;
      let extension = req.body.extension;
      let fila = req.body.fila;

      try {
        let qry = `
                                insert into logs(user, ramal, fila, motivo, datahora)
                                values ('${extension}','${extension}', '${fila}','pausaout', now())
                              `;
        console.log(qry);
        let res47 = await executaQry(qry);
        res.json(res47);
      } catch (e) {
        console.log(e);
      }

    });



    //Cadastro de usuário ----------------------------------------------------------------------------------


    this.expressAppWrapper.get("/listausuario", async (req, res) => {
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

    this.expressAppWrapper.post("/insereusuario", async (req, res, next) => {
      let usuario = req.body.usuario +'-Meso';
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


    this.expressAppWrapper.get("/usuariotira/:id", async (req, res, next) => {
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


    this.expressAppWrapper.post("/usuarioaltera", async (req, res, next) => {
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

    //FIM Cadastro de usuário ----------------------------------------------------------------------------------

    //MESO DETALHES --------------------------------------------------------------------------------------------

    this.expressAppWrapper.get("/detalhes/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select * from meso_detalhe where datahora > '${data1}' and datahora < '${data2}' `;
      console.log(qry);


      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);

    });



    this.expressAppWrapper.get("/detalhessainte/:d1/:d2", async (req, res, next) => {
      let data1 = req.params.d1 + ' 00:00:00'
      let data2 = req.params.d2 + ' 23:59:59'
      let qry = `select *,timediff(terminoligacao,inicioligacao) as duracao,timediff(dialend,datahora) as holdtime from meso_detalhe_sainte where datahora > '${data1}' and datahora < '${data2}' `;
      console.log(qry);


      let res1 = await executaQry(qry);
      res.json(res1);
      console.log(res1);

    })

    this.expressAppWrapper.post("/send", async (req, res) => {

      let to = req.body.to
      let body = req.body.body
      let nome = req.body.nome
      send(to, body, nome, res)
    })

    this.expressAppWrapper.post("/sendimage", async (req, res) => {



      let to = req.body.to
      let id = req.body.id
      let link = req.body.link
      console.log(to, id, link, res)
      console.log('oque vem sem link', link)
      sendImage(to, id, link, res)
    })


    this.expressAppWrapper.post("/sendvideo", async (req, res) => {

      let to = req.body.to
      let id = req.body.id

      let link = req.body.link

      sendVideo(to, id, link, res)
    })

    this.expressAppWrapper.post("/sendaudio", async (req, res) => {

      let to = req.body.to
      let id = req.body.id
      let link = req.body.link

      sendAudio(to, id, link)
    })


    this.expressAppWrapper.post("/sendtemplate", async (req, res) => {

      let to = req.body.to
      let name = req.body.name
      let usuario = req.body.usuario

      sendTemplate(to, name, usuario, res)
    })

    this.expressAppWrapper.post("/senddocument", async (req, res) => {

      let to = req.body.to
      let id = req.body.id
      let link = req.body.link
      let filename = req.body.filename

      sendDocument(to, id, filename, res)
    })

    this.expressAppWrapper.get('/buscarmealing/:telefone', async (req, res, next) => {
      let telefone = req.params.telefone
      let qry = `select * from meso_mealing where telefone = '${telefone}'`
      console.log('sou qry mealing', qry)
      let res1 = await executaQry(qry)
      res.json(res1)
    })

    this.expressAppWrapper.get("/estadoMealing/:processo/:atendeu/:reagendar/:interesse/:negociar/:observacao", async (req, res, next) => {
      console.log('entrei aqui')
      let processo = req.params.processo
      let atendeu = req.params.atendeu
      let reagendar = req.params.reagendar
      let interesse = req.params.interesse
      let negociar = req.params.negociar
      let observacao = req.params.observacao

      console.log(processo,
        atendeu,
        reagendar,
        interesse,
        negociar,
        observacao,
      )
      let intatendeu = 0
      let intreagendar = 0
      let intinteresse = 0
      let intnegociar = 0

      if (atendeu == 'sim') {
        intatendeu = 1
      }

      if (reagendar == 'sim') {
        intreagendar = 1
      }

      if (interesse == 'sim') {
        intinteresse = 1
      }

      if (negociar == 'sim') {
        intnegociar = 1
      }

      if (observacao == 'undefined' || observacao == 'NULL') {
        observacao = ''
      }

      console.log(processo, atendeu, reagendar, interesse, negociar)
      if (atendeu == 'sim') {

        if (interesse == 'sim' || negociar == 'sim') {
          let qry = `update meso_oportunidade set estado = 'aprovado', atendeu ='${intatendeu}', reagenda='${intreagendar}', interesse='${intinteresse}', negociar = '${intnegociar}', observacao = '${observacao}',dataFim = now() where idMealing= (select idMealing from meso_mealing where processo ="${processo}" order by idMealing limit 1 )`
          console.log('query', qry)
          let res1 = await executaQry(qry)
          res.json(res1)
        } else {
          let qry = `update meso_oportunidade set estado = 'reprovado',dataFim = now(), observacao = '${observacao}' where idMealing= (select idMealing from meso_mealing where processo ="${processo}") `
          console.log('query', qry)
          let res1 = await executaQry(qry)
          res.json(res1)
        }
      } else if (reagendar == 'sim') {
        let qry = `update meso_oportunidade set estado = 'reagendar', atendeu ='${intatendeu}', reagenda='${intreagendar}', interesse='${intinteresse}', negociar = '${intnegociar}', observacao = '${observacao}',dataFim = now() where idMealing= (select idMealing from meso_mealing where processo ="${processo}" order by idMealing limit 1 )`
        console.log('query', qry)

        let res1 = await executaQry(qry)
        res.json(res1)
      } else {
        let qry = `update meso_oportunidade set estado = 'reprovado',dataFim = now(), observacao = '${observacao}' where idMealing = (select idMealing from meso_mealing where processo = '${processo}')`
        let res1 = await executaQry(qry)
        res.json(res1)
      }

    });

    this.expressAppWrapper.listen(this.porta, () => console.log('perereca' + this.porta))
  }
}

module.exports = ExpressController;
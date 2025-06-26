const express = require("express");
const router = express.Router();
const { executaQry } = require("../db");
const { executaQry2 } = require("../db2");
const { geraToken } = require("../jwt/jwt");
const { executaQryServer } = require('../dbServer')
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const e = require("express");
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


router.get("/", (req, res) => {
  res.json({
    funcionou: false,
    msg: "PP2",
    dados: [],
  });
});

//Pesquisa de satisfação

router.get("/pesquisa/:d1/:d2", async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}' `;
  console.log(qry);

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);

});


router.post("/reciveMsg", async (req, res, next) => {

  let telefone = req.body.telefone
  let telFormatado = telefone

  if (telefone.length == 13){
    telFormatado = telefone.substring(0,4) + telefone.substring(5)
  }

  let qry = ` select * from meso_mensagens_solicitante where telefone like "${telFormatado}"`;

  console.log('qry:', qry)
  let res3 = await executaQryLocal(qry);
  res.json(res3);
  //console.log(res3);

});



router.get("/buscarcontatos/:usuario", async (req, res, next) => {
  let usuario = req.params.usuario
  let qry = `select distinct credor as nome, Telefone, processo from meso_mealing where idAgente = (select id from meso_usuariologin where usuario = '${usuario}')`
  console.log('contato', qry)
  let res20 = await executaQry(qry)
  res.json(res20)
  console.log('contatos resposta', res20)
})

router.get("/mediapesquisa/:d1/:d2", async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select avg(nota) as medianota from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}' AND gostaria like '%SIM%' `;
  console.log(qry);
  let res2 = await executaQry(qry);
  res.json(res2);
  console.log(res2);

});

//teste MedPesq1---------------------------------------------------------------------------------------------------------------------------------------------------
router.get("/mediapesquisa1/:d1/:d2", async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select sum(pergunta1 + pergunta2) as medianota from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}'`;
  console.log(qry);
  let res2 = await executaQry(qry);
  res.json(res2);
  console.log(res2);

});

router.get("/mediapesquisaconta/:d1/:d2", async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(pergunta1)as contapesq from meso_pesquisa where datahora > '${data1}' and datahora < '${data2}'`;
  console.log(qry);
  let res2 = await executaQry(qry);
  res.json(res2);
  console.log(res2);

});

router.get("/listaanalista", async (req, res,next) => {
  qry = `select * from meso_usuariologin where tipo = 'Analista'`;
  
  let res27 = await executaQry(qry);
  
  console.log('socaminha',res27)
  res.json(res27);
 
  });

//Campanha fila

//Segunda bolinha do painel de filas - Chamadas em fila//
router.get("/listajoin/:fila", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let qry = `select * from meso_join_rt where fila = '${filacompleta}'`;
  console.log(qry);

  let res30 = await executaQry(qry);
  res.json(res30);
  console.log(res30);

});
//Primeira bolinha do painel das filas

router.get("/listajointotal/:fila/:d1/:d2", async (req, res, next) => {
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

router.get("/filaconectada/:fila/:d1/:d2", async (req, res, next) => {
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

router.get("/filasabandonadas/:fila/:d1/:d2", async (req, res, next) => {
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

router.get("/tmafilas/:fila/:d1/:d2", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'


  let qry = `select avg(talktime) as mediaANNA from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
  console.log(qry);

  let res99 = await executaQry(qry);
  res.json(res99);
  console.log(res99);

});

router.get("/mediatmasainte/:ramal/:d1/:d2", async (req, res, next) => {
  let ramal = req.params.ramal;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select avg(billsec) as mediatma from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
  console.log(qry)

  let res1 = await executaQry(qry);
  res.json(res1)
  console.log(res1);
})

//Setima bolinha TME Atendidas

router.get("/tmefilas/:fila/:d1/:d2", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
  console.log(qry);

  let res35 = await executaQry(qry);
  res.json(res35);
  console.log(res35);

});

router.get("/tmesainte/:d1/:d2/:ramal", async (req, res, next) => {
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

router.get("/tmefilasabandonadas/:fila/:d1/:d2", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select avg(holdtime) as mediaesperaabandonada from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}'`;
  console.log(qry);

  let res35 = await executaQry(qry);
  res.json(res35);
  console.log(res35);

});

router.get("tmeabandonadassainte/:ramal/:d1/:d2", async (req, res, next) => {
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
router.get("/listafilastotais", async (req, res, next) => {

  let qry = `select extension, descr from queues_config `;
  console.log(qry);

  let res38 = await executaQry2(qry);
  res.json(res38);
  console.log(res38);

});

//FIM de Listar filas
//Listar ramais
router.get("/listaramais", async (req, res, next) => {

  let qry = `select extension, name from users `;
  console.log(qry);

  let res38 = await executaQry2(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/listaramais", async (req, res, next) => {

  let qry = `select extension, name from users `;
  console.log(qry);

  let res38 = await executaQry2(qry);
  res.json(res38);
  console.log(res38);

});
//FIM listar ramais
router.get("/realramal", async (req, res, next) => {
  // let filacompleta = req.params.fila;
  //let data1 = req.params.d1 + ' 00:00:00'
  //let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select * from meso_operadores_rt`;
  console.log(qry);

  let res36 = await executaQry(qry);
  res.json(res36);
  console.log(res36);

});

router.get("/detalhesligacoes/:d1/:d2", async (req, res, next) => {
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
router.get("/listaoperadores", async (req, res, next) => {

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
router.get("/recebidafila/:fila/:d1/:d2", async (req, res, next) => {
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

router.get("/recebidasucesso/:fila/:d1/:d2", async (req, res, next) => {
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

router.get("/recebidaabandon/:fila/:d1/:d2", async (req, res, next) => {
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
router.get("/recebidajoin/:fila/:d1/:d2", async (req, res, next) => {
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
router.get("/recebidaespera/:fila/:d1/:d2", async (req, res, next) => {
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
router.get("/recebidaesperaatende/:fila/:d1/:d2", async (req, res, next) => {
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
router.get("/dashpizza/:d1/:d2", async (req, res, next) => {
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
router.get("/pausa/:d1/:d2", async (req, res, next) => {
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

router.get("/filaabandono/:d1/:d2", async (req, res, next) => {
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
router.get("/dashligacao", async (req, res, next) => {

  let qry = `select distinct uniqueid1 from meso_operadores_em_ligacao `;
  console.log(qry);


  let res5 = await executaQry(qry);
  res.json(res5);
  console.log(res5);

});

//Circulo do painel principal Logados cor Verde

router.get("/dashlogados", async (req, res, next) => {

  let qry = `select distinct pin from meso_logado `;
  console.log(qry);


  let res2 = await executaQry(qry);
  res.json(res2);
  console.log(res2);

});

//Circulo do painel principal Pausados cor Amarela

router.get("/dashpausados", async (req, res, next) => {

  let qry = `select * from meso_pausado `;
  console.log(qry);


  let res3 = await executaQry(qry);
  res.json(res3);
  console.log(res3);

});

router.get("/dashdeslogados", async (req, res, next) => {

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

router.get("/fluxohora/:d1", async (req, res, next) => {
  let data1 = req.params.d1

  let qry = `select * from meso_fluxo_ligacao where datahora = '${data1}' `;
  console.log(qry);

  let res23 = await executaQry(qry);
  res.json(res23);
  console.log(res23);

});


router.get("/estoque/:d1/:d2", async (req, res, next) => {
  let data1 = req.params.d1
  let data2 = req.params.d2
  let qry = `select * from meso_estoque where diaatual >= '${data1}' and diaatual <= '${data2}' `;
  console.log(qry);

  let res32 = await executaQry(qry);
  res.json(res32);
  console.log(res32);

});

router.get("/gravacao/:d1/:d2", async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select src, dst, duration, recordingfile from cdr where calldate > '${data1}' and calldate < '${data2}' `;
  console.log(qry);

  let res199 = await executaQry(qry);
  res.json(res199);
  console.log(res199);

});


//novo fluxo para finalizar o testeligahora

router.get("/fluxoteste/:d1", async (req, res, next) => {

  let data1 = req.params.d1

  let qry = `select * from meso_entrar where datahora like '${data1}%'  order by 'datahora';`;
  console.log('teste qualquer coisa', qry);

  console.log('aaaaaaaaaaaaaaaaaaaaaaa', qry)
  let res6 = await executaQry(qry);
  res.json(res6);
  console.log(res6);

});



//Login-------------------------------------------------------------------------------------

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

router.post('/upload', upload.single('file'), async (req, res) => {
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

router.get('/oportunidade/:processo/:plataforma', async (req, res, next) => {

  let processo = req.params.processo
  let plataforma = req.params.plataforma
  let ids


  let qry1 = `select idMealing,idAgente from meso_mealing where processo = '${processo}' order by idMealing limit 1 `
  ids = await executaQry(qry1)

  let qry3 = `select idPlataforma from meso_plataforma where plataforma = '${plataforma}' order by idPlataforma limit 1`
  let idPlataforma = await executaQry(qry3);

  console.log(idPlataforma.dados[0].idPlataforma)

  let qry = `insert into meso_oportunidade (idMealing, idAnalista, idPlataforma) values (${ids.dados[0].idMealing}, ${ids.dados[0].idAgente}, ${idPlataforma.dados[0].idPlataforma}) `
  let res29 = await executaQry(qry);

  res.json(res29);


})
router.get('/buscarcsv', async (req, res, next) => {
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
router.get("/tma/:d1/:d2/:fila/:ramal", async (req, res, next) => {
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

router.get("/nomeramal/:fila/:ramal", async (req, res, next) => {
  let fila = req.params.fila;
  let ramal = req.params.ramal;



  let qry = `select distinct connectedlinename as usuario from meso_agent_complete where fila = '${fila}'  and connectedlinenum = '${ramal}'`;
  console.log(qry);

  let res99 = await executaQry(qry);
  res.json(res99);
  console.log(res99);

});

router.get("/nomeramalsainte/:ramal", async (req, res, next) => {
  let ramal = req.params.ramal;
  let qry = `select distinct cnam as usuario from cdr where cnum = '${ramal}'`;
  console.log(qry);

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);

});

router.get("/ramaltma/:fila/:ramal", async (req, res, next) => {
  let fila = req.params.fila;
  let ramal = req.params.ramal;



  let qry = `select distinct connectedlinenum as ramal from meso_agent_complete where fila = '${fila}'  and connectedlinenum = '${ramal}'`;
  console.log(qry);

  let res99 = await executaQry(qry);
  res.json(res99);
  console.log(res99);

});

router.get("/ramaltmasainte/:ramal", async (req, res, next) => {
  let ramal = req.params.ramal;
  let qry = `select distinct cnum as ramal from cdr where cnum = '${ramal}'`
  console.log(qry);

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);
})

router.get("/mediatma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
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

router.get("/totalchamadastma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
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

router.get("/totalchamadastmasainte/:d1/:d2/:ramal", async (req, res, next) => {
  let data1 = req.params.d1 + '00:00:00'
  let data2 = req.params.d1 + '23:59:59'
  let ramal = req.params.ramal
  let qry = `select * from cdr where calldate > '${data1}' and calldate > '${data2}' and cnum = '${ramal}'`;
  console.log(qry);

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1)
})

router.get("/totalduracaotma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
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

router.get("/totalduracaotmasainte/:d1/:d2/:ramal", async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let ramal = req.params.ramal
  let qry = `select sum(billsec) as duracaototal from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`
  console.log(qry)

  let res1 = await executaQry(qry)
  res.json(res1)
  console.log(res1)
})

router.get("/maximaduracaotma/:fila/:d1/:d2/:ramal", async (req, res, next) => {
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

router.get("/maximaduracaotmasainte/:d1/:d2/:ramal", async (req, res, next) => {
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
router.get("/listnum/:agent", async (req, res, next) => {

  let agent = req.params.agent
  let qry = `select extension from users where name = '${agent}'`;
  console.log(qry);

  let res38 = await executaQry2(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/primeiracon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/primeiraconsainte/:ramal/:d1/:d2", async (req, res, next) => {

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

router.get("/ultimacon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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



router.get("/ultimaconsainte/:ramal/:d1/:d2", async (req, res, next) => {

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

router.get("/numcount/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/numchamada/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/numcall/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/durpausa/:ramal/:d1/:d2", async (req, res, next) => {

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

router.get("/talktime/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/talktimesainte/:ramal/:d1/:d2", async (req, res, next) => {

  let ramal = req.params.ramal
  let data1 = req.params.d1
  let data2 = req.params.d2
  let qry = `select sec_to_time(sum(time_to_sec(timediff(terminoligacao,inicioligacao)))) as talktime from meso_detalhe_sainte where solicitante = '${ramal}' `
  console.log(qry);

  let res38 = await executaQry(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/duracon/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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



router.get("/duracomsainte/:ramal/:d1/:d2", async (req, res, next) => {
  let ramal = 'SIP/' + req.params.ramal
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select sec_to_time(SUM(time_to_sec(TIMEDIFF(desloga, datahora)))) as durcon from meso_login_fila where membername = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
  console.log('wof wof wof, só as cachorras', qry)

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1)
})

router.get("/numpausa/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/duraconsec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/duraconsecsainte/:ramal/:d1/:d2", async (req, res, next) => {

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

router.get("/verificadur/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/verificadursainte/:ramal/:d1/:d2", async (req, res, next) => {

  let ramal = 'SIP/' + req.params.ramal
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select SUM(TIMEDIFF(desloga, datahora)) as verificadur from meso_login_fila where membername = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
  console.log(qry);


  let res38 = await executaQry(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/talktimesec/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/talktimesecsainte/:ramal/:d1/:d2", async (req, res, next) => {

  let ramal = req.params.ramal
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select sum(time_to_sec(timediff(terminoligacao,inicioligacao))) as talktimesec from meso_detalhe_sainte where solicitante = '${ramal}' and datahora > '${data1}' and datahora < '${data2}'`;
  console.log('salve', qry);

  let res38 = await executaQry(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/ultimologoff/:ramal/:fila/:d1/:d2", async (req, res, next) => {

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

router.get("/ultimologoffsainte/:ramal/:d1/:d2", async (req, res, next) => {

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

router.get("/somaespera/:fila/:d1/:d2/", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select sum(holdtime) as somaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
  console.log(qry);

  let res43 = await executaQry(qry);
  res.json(res43);
  console.log(res43);

});

router.get("/somasainte/:ramal/:d1/:d2/", async (req, res, next) => {
  let ramal = req.params.ramal;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select sum(duration - billsec) as somasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
  console.log('eu sou a melodia', qry);

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);
})

router.get("/mediaespera/:fila/:d1/:d2/", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select avg(holdtime) as mediaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
  console.log(qry);

  let res44 = await executaQry(qry);
  res.json(res44);
  console.log(res44);

});

router.get("/mediaesperasainte/:ramal/:d1/:d2/", async (req, res, next) => {
  let ramal = req.params.ramal;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select sum(duration - billsec) as duracao, count(*) as contduracao from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
  console.log(qry);

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);
})

router.get("/minimoespera/:fila/:d1/:d2/", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select min(holdtime) as minimaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
  console.log(qry);

  let res45 = await executaQry(qry);
  res.json(res45);
  console.log(res45);

});

router.get("/minimoesperasainte/:ramal/:d1/:d2/", async (req, res, netx) => {
  let ramal = req.params.ramal;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select min(billsec) as minimaesperasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
  console.log(qry);

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);
})

router.get("/maximoespera/:fila/:d1/:d2/", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select max(holdtime) as maximaespera from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
  console.log(qry);

  let res45 = await executaQry(qry);
  res.json(res45);
  console.log(res45);

});

router.get("/maximoesperasainte/:ramal/:d1/:d2/", async (req, res, netx) => {
  let ramal = req.params.ramal;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select max(billsec) as maximoesperasainte from cdr where calldate > '${data1}' and calldate < '${data2}' and cnum = '${ramal}'`;
  console.log(qry);

  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);
})


router.get("/totalchamadasespera/:fila/:d1/:d2/", async (req, res, next) => {
  let filacompleta = req.params.fila;
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'

  let qry = `select * from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and fila = '${filacompleta}' `;
  console.log(qry);

  let res46 = await executaQry(qry);
  res.json(res46);
  console.log(res46);

});

router.get("/totalchamadasesperasainte/:ramal/:d1/:d2/", async (req, res, next) => {
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

router.get("/listartronco", async (req, res, next) => {

  let qry = `select * from trunks `;
  console.log(qry);

  let res38 = await executaQry2(qry);
  res.json(res38);
  console.log(res38);

});

router.get("/troncoabandonadas/:tronco/:d1/:d2", async (req, res, next) => {
  let tronco = req.params.tronco
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(*) as abandon from meso_abandon where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
  console.log(qry);


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});

router.get("/troncoentrar/:tronco/:d1/:d2", async (req, res, next) => {
  let tronco = req.params.tronco
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(*) as entrada from meso_entrar where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
  console.log(qry);


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});

router.get("/troncocomplete/:tronco/:d1/:d2", async (req, res, next) => {
  let tronco = req.params.tronco
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(*) as complete from meso_agent_complete where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
  console.log(qry);


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});

router.get("/troncoentrarrt/:tronco/:d1/:d2", async (req, res, next) => {
  let tronco = req.params.tronco
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select count(*) as entradart from meso_join_rt where datahora > '${data1}' and datahora < '${data2}' and channel like '%${tronco}%'`;
  console.log(qry);


  let res33 = await executaQry(qry);
  res.json(res33);
  console.log(res33);

});


router.get("/ligar/:ramal/:telefone", async (req, res) => {
  //let dataini = req.params.d1;
  // let datafim = req.params.d2;
  let ramal = req.params.ramal;
  let telefone = 'SIP/' + req.params.telefone;
  let telefone2 = req.params.telefone;

  console.log(ramal)
  console.log(telefone)



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
  res.status(200).send('ok')

})



//------------------------------------------------------------------------------------------------------------------------------------------------------------

//Inicio meso estoque--------------------------------------------------------------------------------------------
router.get("/acciolyliga/:ramal/:telefone", async (req, res) => {
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

router.post("/acciolyaltera/", async (req, res, next) => {
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

router.get("/realoperadorrt", async (req, res, next) => {
  // let filacompleta = req.params.fila;
  //let data1 = req.params.d1 + ' 00:00:00'
  //let data2 = req.params.d2 + ' 23:59:59'

  let qry = `SELECT * FROM users ORDER BY FIELD(estado, 'em ligação', 'logado', 'pausado', 'deslogado');`;
  console.log(qry);

  let res36 = await executaQry2(qry);
  res.json(res36);
  console.log(res36);

});

router.get("/ajustaEstado", async (req, res, next) => {
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

router.post("/logarpainel", async (req, res) => {
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

router.post("/estadoperador", async (req, res) => {

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

router.post("/estadoperadorfila", async (req, res) => {
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

router.post("/logslogin", async (req, res) => {
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

router.post("/deslogarpainel", async (req, res) => {
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

router.post("/estadoperadordesloga", async (req, res) => {

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

router.post("/deslogaestadorfila", async (req, res) => {
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

router.post("/logsdeslogar", async (req, res) => {
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

router.post("/pausarpainelrt", async (req, res) => {
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

router.post("/pausarestado", async (req, res) => {

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


router.post("/logspausarrt", async (req, res) => {
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

router.post("/despausarpainelrt", async (req, res) => {
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




router.post("/logsdespausarrt", async (req, res) => {
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


router.get("/listausuario", async (req, res) => {
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

router.post("/insereusuario", async (req, res, next) => {
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


router.get("/usuariotira/:id", async (req, res, next) => {
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


router.post("/usuarioaltera", async (req, res, next) => {
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

router.get("/detalhes/:d1/:d2", async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select * from meso_detalhe where datahora > '${data1}' and datahora < '${data2}' `;
  console.log(qry);


  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);

});

router.get("/detalhessainte/:d1/:d2", async (req, res, next) => {
  let data1 = req.params.d1 + ' 00:00:00'
  let data2 = req.params.d2 + ' 23:59:59'
  let qry = `select *,timediff(terminoligacao,inicioligacao) as duracao,timediff(dialend,datahora) as holdtime from meso_detalhe_sainte where datahora > '${data1}' and datahora < '${data2}' `;
  console.log(qry);


  let res1 = await executaQry(qry);
  res.json(res1);
  console.log(res1);

})

router.get("/estadoMealing/:processo/:atendeu/:reagendar/:interesse/:negociar/:observacao", async (req, res, next) => {
  console.log('entrei aqui')
  let processo = req.params.processo
  let atendeu = req.params.atendeu
  let reagendar = req.params.reagendar
  let interesse = req.params.interesse
  let negociar = req.params.negociar
  let observacao = req.params.observacao

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

  console.log(processo, atendeu, reagendar, interesse, negociar)
  if (atendeu == 'sim' || reagendar == 'sim') {

    if (interesse == 'sim' || negociar == 'sim') {
      let qry = `update meso_oportunidade set estado = 'aprovado', atendeu ='${intatendeu}', reagenda='${intreagendar}', interesse='${intinteresse}', negociar = '${intnegociar}', observacao = '${observacao}' where idMealing= (select idMealing from meso_mealing where processo ="${processo}" order by idMealing limit 1 )`
      console.log('query', qry)
      let res1 = await executaQry(qry)
      res.json(res1)
    } else {
      let qry = `update meso_oportunidade set estado = 'reprovado' where idMealing= (select idMealing from meso_mealing where processo ="${processo}") `
      console.log('query', qry)
      let res1 = await executaQry(qry)
      res.json(res1)
    }
  } else {
    let qry = `update meso_oportunidade set estado = 'reprovado' where telefone ="${telefone}"`
    let res1 = await executaQry(qry)
    res.json(res1)
  }

});



module.exports = router;
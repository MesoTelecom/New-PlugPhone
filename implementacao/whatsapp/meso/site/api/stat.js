const { executaQry } = require("./db");
//const { executaQry2 } = require("../db2");
//const { executaQry3 } = require("../db3");

async function trataAbandon(abandon){
    let ligacao = abandon

    //console.log(ligacao)
    
    let qry3 =`select * from meso_entrar where uniqueid = '${ligacao.uniqueid}'`
    let result = await executaQry(qry3)

    console.log(result.dados[0], ligacao)
    
    //com os dados de abandon vamos pegar os restos dos dados na tabela de join
    let qry2=`update meso_abandon set stat = 2 where id = ${ligacao.id}`
    console.log(qry2)
    await executaQry(qry2)
}


async function getAbandon(){
    let qry =`select * from meso_abandon where stat = 0 limit 1`
    
    let res = await executaQry(qry)

    if(res.dados && res.dados.length >0){
        let qry2=`update meso_abandon set stat = 1 where id = ${res.dados[0].id}`
        console.log(qry2)
        await executaQry(qry2)
        await trataAbandon(res.dados[0])

    }
    



}
setInterval(()=>getAbandon(),5000)
const express = require("express");
const router = express.Router();
const { executaQry } = require("./db/db");
var ami = new require('asterisk-manager')('5038','localhost','admin','kjfhpao748KJHREI5', true);
ami.keepConnected();

router.get("/", (req, res) => {
    res.json({
        dados: [],
      msg: "Teste",
     
    });
});

router.post('ligar',async (req,res)=>{
    let {ramal, num}= req.body
    console.log('dad',ramal,num)
    
   let resp;
    ami.action({
        'action':'originate',
        'channel':`SIP/${ramal}`,
        'exten':`${num}`,
        'context': 'from-internal',
        'priority': '1',
        'async': true
        
      }, function(err, res) {
        console.log('discar',err, res)
        if(err){
          resp = err
        }else{
          resp = res
        }

    });
    console.log(resp)
    res.json(resp)
})
//-------------------------------------------------
router.get('/tab',async (req,res)=>{
    let qry = `select * from tabulacao`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})
router.get('/tab/:id',async (req,res)=>{
    let id = req.params.id
    let qry = `select * from tabulacao where id = ${id}`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})

router.delete('/tab/:id',async (req,res)=>{
    let id = req.params.id
    let qry = `delete from tabulacao where id = ${id}`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})

router.post('/tab/criar',async (req,res)=>{
    console.log(req.body)
    let {tab,desctab} = req.body
    let qry = `insert into tabulacao(tab,desctab) values('${tab}','${desctab}')
     `;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})

router.post('/tab/edit',async (req,res)=>{
    let {id,tab,desctab} = req.body
    let qry = `update tabulacao set tab='${tab}' ,desctab = '${desctab}'
     where id = ${id}`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})
//-------------------------------------------------
router.get('/users',async (req,res)=>{
    let qry = `select * from users`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})

router.get('/users/:id',async (req,res)=>{
    let id = req.params.id
    let qry = `select * from users where id = ${id}`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})

router.delete('/users/:id',async (req,res)=>{
    let id = req.params.id
    let qry = `delete from users where id = ${id}`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})

router.post('/users/criar',async (req,res)=>{
    console.log(req.body)
    let {login,nome,senha,tipo} = req.body
    let qry = `insert into users(login,nome,senha,tipo) values('${login}','${nome}',MD5('${senha}'),tipo='${tipo}')
     `;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})

router.post('/users/edit',async (req,res)=>{
    let {id,login,nome,senha,tipo} = req.body
    let qry = `update users set nome='${nome}' ,login = '${login}',senha=MD5('${senha}'),tipo='${tipo}'
     where id = ${id}`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})
//----------------------------------------------------------------------
router.post('/login',async (req,res)=>{

    let {login,senha}= req.body;
    let qry = `select * from users where login = '${login}' and senha = MD5('${senha}')`;
   // console.log(qry)
    let resposta = await executaQry(qry)
    res.json(resposta)

})





module.exports = router;
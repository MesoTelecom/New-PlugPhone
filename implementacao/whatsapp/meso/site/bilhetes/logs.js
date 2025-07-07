var ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'mTES0206', true);

// In case of any connectiviy problems we got you coverd.
ami.keepConnected();

let { executaQry } = require('./db')

let pinBonito
let fila
let ramal

ami.on('newexten', async function(evt){
    if (evt.appdata === 'adicionafila,s,1' && evt.context ==='loginplugphone'){
        pinBonito = evt.extension
        if(pinBonito != 's' ){
            console.log(pinBonito)
    }
        }

});


ami.on('join', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando no banco logs')
        let qry = `INSERT INTO logs (user, ramal, fila, motivo) values('${pinBonito}','${evt.calleridnum}','${evt.queue}','entrante')`
        console.log('1 dado gravado ou atualizado, logs')

        await executaQry(qry)
    }
});

ami.on('newexten', async function(evt){
    if (evt.appdata === 'adicionapausa,s,1' && evt.context ==='entrapausa'){
        pinBonito = evt.extension
        if(pinBonito != 's' ){
            console.log(pinBonito)
            ramal = evt.channel
    }
        }

});

ami.on('queuememberpaused', async function (evt) {
    if (evt.paused >='1') {
        fila = evt.queue
        console.log('entrando no banco logs PausaIn')
        let qry = `INSERT INTO logs (user, ramal, fila, motivo) values('${pinBonito}','${ramal}','${fila}','Pausain')`
        console.log('1 dado gravado ou atualizado, logs PausaIn')
        await executaQry(qry)
    }
    else if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando no banco logs')
        let qry = `INSERT INTO logs (user, ramal, fila, motivo) values('${pinBonito}','${ramal}','${fila}','PausaOut')`
        console.log('1 dado gravado ou atualizado, logs')

        await executaQry(qry)
    }
    else if (evt.paused === '0') {

        console.log('entrando no banco logs')
        let qry = `INSERT INTO logs (user, ramal, fila, motivo) values('${pinBonito}','${evt.calleridnum}','${evt.queue}','Pausaout')`
        console.log('1 dado gravado ou atualizado, logs')
        
        await executaQry(qry)

    }
});

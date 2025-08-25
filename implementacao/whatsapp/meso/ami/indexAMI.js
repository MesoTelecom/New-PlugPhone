var ami = new require('asterisk-manager')('5038', '127.0.0.1', 'admin', 'Mtes0206', true);
console.log("PlugPhone API")
// In case of any connectiviy problems we got you coverd.
ami.keepConnected();

let { executaQry } = require('./db')
let { executaQry1 } = require('./db1')

ami.on('queuememberadded', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando em loginfila')
        let qry = `insert into meso_login_fila(evento, privilege, fila, localizacao, membername, stateinterface, membership, penalty, callstaken, lastcall, estado, pausado ) values('${evt.event}','${evt.privilege}','${evt.queue}','${evt.location}','${evt.membername}','${evt.stateinterface}','${evt.membership}','${evt.penalty}','${evt.callstaken}','${evt.lastcall}','${evt.status}','${evt.paused}')`

        console.log('dado inserido em loginfila', qry)
        await executaQry(qry)
    }

});

ami.on('queuememberremoved', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando em deslogafila')
        let qry = `update meso_login_fila set desloga = now() where desloga = '0000-00-00 00:00:00' and membername ='${evt.membername}'`

        await executaQry(qry)
    }


});


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


ami.on('queuecallerjoin', async function (evt) {

    console.log('entrando no banco meso_detalhe')
    let qry = `INSERT INTO meso_detalhe(datahora, uniqueid, solicitante, tronco) VALUES (now(), '${evt.uniqueid}','${evt.calleridnum}','${evt.channel}');`
    console.log('1 dado gravado ou atualizado, entrar')
    await executaQry(qry)

});

ami.on('dialbegin', async function (evt) {
    console.log("entrando no meso_detelhe_sainte")
    let qry = `insert into meso_detalhe_sainte(datahora, uniqueid, solicitante, tronco) values (now(), '${evt.uniqueid}', '${evt.calleridnum}', '${evt.channel}');`
    console.log('Provalmente um dado foi inserido no meso_detalhe_sainte')
    await executaQry(qry)
})

ami.on('dialend', async function (evt) {
    if (evt.dialstatus == 'ANSWER') {
        console.log('entrando no banco Meso_detalhe')
        let qry = `update meso_detalhe_sainte set estado = 'atendida' where uniqueid = '${evt.uniqueid}';`
        console.log('1 dado gravado ou atualizado, complete')
        await executaQry(qry)
    }
});

ami.on('agentcomplete', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set estado = 'atendida' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('agentcomplete', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set razao = '${evt.reason}' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

/*
ami.on('softhanguprequest', async function (evt) {
    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe_sainte set razao = 'caller' where uniqueid = '${evt.uniqueid}' and solicitante = ${evt.calleridnum};`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)
});

ami.on('softhanguprequest', async function (evt) {
    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe_sainte set razao = 'agent' where uniqueid = '${evt.uniqueid}' and solicitante = ${evt.calleridnum};`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)
});
*/

ami.on('agentcomplete', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set teleatendente = '${evt.interface}' where uniqueid = '${evt.uniqueid}';`
    console.log(qry)
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('dialend', async function (evt) {
    console.log('entrando no banco Meso_detalhe')
    if (evt.dialstatus == "ANSWER") {
        let qry = `update meso_detalhe_sainte set teleatendente = '${evt.connectedlinenum}' where uniqueid = '${evt.uniqueid}';`
        console.log(qry)
        console.log('1 dado gravado ou atualizado, complete')
        await executaQry(qry)
    }
});

ami.on('bridgeenter', async function (evt) {
    console.log("entrando meso sainte")
    let qry = `update meso_detalhe_sainte set inicioligacao = now() where uniqueid = '${evt.uniqueid}';`
    console.log(qry)
    console.log('Eu acho que foi atualizado algum dado na tabela meso_detelhe_sainte')
    await executaQry(qry)
})

ami.on('agentcomplete', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set fila = '${evt.queue}' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('bridgeleave', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe_sainte set terminoligacao = now() where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, sainte')
    await executaQry(qry)

});

ami.on('agentcomplete', async function (evt) {

    console.log('entrando no banco meso_detalhe')
    let qry = `update meso_detalhe set duracao = '${evt.talktime}' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('agentcomplete', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set holdtime = '${evt.holdtime}' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('dialend', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe_sainte set dialend = now() where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('agentcomplete', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set tronco = '${evt.channel}' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('queuecallerabandon', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set estado = 'abandonado' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('dialend', async function (evt) {

    if (evt.dialstatus != 'ANSWER') {

        console.log('entrando no banco Meso_detalhe')
        let qry = `update meso_detalhe_sainte set estado = 'abandonado' where uniqueid = '${evt.uniqueid}';`
        console.log('1 dado gravado ou atualizado, complete')
        await executaQry(qry)
    }
});

ami.on('queuecallerabandon', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set fila = '${evt.queue}' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});

ami.on('queuecallerabandon', async function (evt) {

    console.log('entrando no banco Meso_detalhe')
    let qry = `update meso_detalhe set holdtime = '${evt.holdtime}' where uniqueid = '${evt.uniqueid}';`
    console.log('1 dado gravado ou atualizado, complete')
    await executaQry(qry)

});




//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


ami.on('queuememberpause', async function (evt) {
    if (evt.paused >= '1') {
        if (
            evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
            console.log('entrando em pausafila')
            let qry = `insert into meso_pausa_fila (evento, privilege, fila, localizacao, membername, pausado, datahora) values('${evt.event}','${evt.privilege}','${evt.queue}','${evt.location}','${evt.membername}','${evt.paused}', now())`

            console.log('1 dado gravado ou atualizado, pausafila')

            await executaQry(qry)


        }
    }

    else if (evt.paused === '0') {
        if (
            evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
            let qry = `update meso_pausa_fila set despausado = now() where despausado = ('00:00:00') and membername= '${evt.membername}'`
            console.log('1 dado gravado ou atualizado, despausado em pausafila')

            await executaQry(qry)
        }

    }
})

ami.on('queuememberremoved', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando em deslogafila')
        let qry = `insert into meso_desloga_fila(evento, fila, localizacao, membername) values('${evt.event}','${evt.queue}','${evt.location}','${evt.membername}')`

        await executaQry(qry)
    }


});

ami.on('queuecallerjoin', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando no banco entrar')
        let qry = `insert into meso_entrar(evento, privilege, channel, calleridnum, calleridname, connectedlinenum, connectedlinename, fila, position, conta, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.queue}',' ${evt.position}','${evt.count}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, entrar')

        await executaQry(qry)
    }

});

ami.on('queuecallerjoin', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando no banco entrar realtime')
        let qry = `insert into meso_join_rt(evento, privilege, channel, calleridnum, calleridname, connectedlinenum, connectedlinename, fila, position, conta, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.queue}',' ${evt.position}','${evt.count}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, entrar')

        await executaQry(qry)
    }

});
ami.on('queuecallerleave', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando no banco entrar realtime')
        let qry = `delete from meso_join_rt where uniqueid = '${evt.uniqueid}';`

        console.log('1 dado removido de, meso_join_rt')


        await executaQry(qry)

    }

});

ami.on('queuecallerabandon', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('entrando em abandon')
        let qry = `delete from meso_join_rt where uniqueid = '${evt.uniqueid}'`

        console.log('1 dado removido de meso_join_rt')

        await executaQry(qry)
    }

});


/*
ami.on('queuecallerjoin', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando no banco entrar')
        let qry = `insert into logs (user, ramal, fila, motivo, pausa) values('4848','${evt.calleridnum}','${evt.queue})`

        console.log('1 dado gravado ou atualizado, entrar')

        await executaQry(qry)
    }

});
*/

ami.on('dialbegin', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando em  evento dial')
        let qry = `insert into meso_dial(evento, privilege, channel, channelstate, channelstatedesc, calleridnum, calleridname, connectedlinenum, connectedlinename, linguagem, accountcode, context, exten, prioridade, uniqueid, linkedid, destchannel, destchannelstate, destchannelstatedesc, destcalleridnum, destcalleridname, destlanguage, destaccountcode, destcontext, destexten, destpriority, destuniqueid, destlinkedid, dialstring,iniciochamada) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.channelstate}','${evt.channelstatedesc}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.language}','${evt.accountcode}','${evt.context}','${evt.exten}','${evt.priority}','${evt.uniqueid}','${evt.linkedid}','${evt.destchannel}','${evt.destchannelstate}','${evt.destchannelstatedesc}','${evt.destcalleridnum}','${evt.destcalleridname}','${evt.destlanguage}','${evt.destaccountcode}','${evt.destcontext}','${evt.destexten}','${evt.destpriority}','${evt.destuniqueid}','${evt.destlinkedid}','${evt.dialstring}',now());`
        console.log('dado inserido em dial')
        await executaQry(qry)
    }

});

ami.on('dialend', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let qry = `update meso_dial set terminochamada = now(), dialstatus = '${evt.dialstatus}' where uniqueid= '${evt.uniqueid}'`
        console.log('dado atualizado em dial')
        await executaQry(qry)

    }

});

ami.on('dial', async function (evt) {
    if (evt.subevent === 'begin') {
        uniqueid = evt.uniqueid
        if (
            evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

            console.log('entrando em  evento dial')
            let qry = `insert into meso_dial(evento, privilege, subevent, channel, destination, calleridnum, calleridname, connectedlinenum, connectedlinename, uniqueid, datauniqueid, dialstring, iniciochamada) values ('${evt.event}','${evt.privilege}','${evt.subevent}','${evt.channel}','${evt.destination}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.uniqueid}','${evt.destuniqueid}','${evt.dialstring}',now());`
            console.log('dado inserido em dial')
            await executaQry(qry)
        }
    } else if (evt.subevent === 'end') {
        let qry = `update meso_dial set terminochamada = now(), dialstatus = '${evt.dialstatus}' where uniqueid= '${evt.uniqueid}'`
        console.log('dado atualizado em dial')
        await executaQry(qry)

    }
});

ami.on('musiconholdstart', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando no banco musiconhold')
        let qry = `insert into meso_music_on_hold(evento, privilege, estado, channel, uniqueid, class, datainicio, hora) values ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

        console.log('1 dado gravado ou atualizado, musiconhold')

        await executaQry(qry)
    }
})

ami.on('musiconholdstart', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('saindo no banco musiconhold')
        let qry = `update meso_music_on_hold set datatermino = now() where uniqueid = '${evt.uniqueid}';`

        console.log('1 dado removido ou atualizado, musiconhold')

        await executaQry(qry)
    }
})

ami.on('musiconhold', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        if (evt.state === 'start') {

            console.log('entrando no banco musiconhold')
            let qry = `insert into meso_music_on_hold(evento, privilege, estado, channel, uniqueid, class, datainicio, hora) values ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

            console.log('1 dado gravado ou atualizado, musiconhold')

            await executaQry(qry)
        } else if (evt.state === 'stop') {
            console.log('saindo no banco musiconhold')
            let qry = `update meso_music_on_hold set datatermino = now() where uniqueid = '${evt.uniqueid}';`

            console.log('1 dado removido ou atualizado, musiconhold')

            await executaQry(qry)

        }

    }
});

ami.on('musiconholdstart', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {


        console.log('entrando no banco musiconhold realtime')
        let qry = `insert into meso_music_on_hold_rt(evento, privilege, estado, channel, uniqueid, class, datainicio, hora) values ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

        console.log('1 dado gravado de musiconhold realtime')

        await executaQry(qry)
    }
})



ami.on('musiconholdstop', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {


        console.log('saindo no banco musiconhold realtime')
        let qry = `delete from meso_music_on_hold_rt  where uniqueid = '${evt.uniqueid}';`

        console.log('1 dado removido de musiconhold realtime')

        await executaQry(qry)
    }
})
ami.on('musiconhold', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        if (evt.state === 'start') {

            console.log('entrando no banco musiconhold realtime')
            let qry = `insert into meso_music_on_hold_rt(evento, privilege, estado, channel, uniqueid, class, datainicio, hora) values ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

            console.log('1 dado gravado de musiconhold realtime')

            await executaQry(qry)
        } else if (evt.state === 'stop') {
            console.log('saindo no banco musiconhold realtime')
            let qry = `delete from meso_music_on_hold_rt  where uniqueid = '${evt.uniqueid}';`

            console.log('1 dado removido de musiconhold realtime')

            await executaQry(qry)

        }

    }
});

ami.on('queuecallerleave', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('entrando em sair')
        let qry = `insert into meso_sair(evento, privilege, channel, fila, conta, position, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.queue}','${evt.count}','${evt.uniqueid}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, sai')

        await executaQry(qry)
    }

});

ami.on('queuecallerabandon', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('entrando em abandon')
        let qry = `insert into meso_abandon(evento, privilege, channel,fila, uniqueid, position, originalposition, holdtime) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.queue}','${evt.uniqueid}','${evt.position}','${evt.originalposition}','${evt.holdtime}');`

        console.log('1 dado gravado ou atualizado, abandon')

        await executaQry(qry)
    }

});


ami.on('bridgeenter', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let qry = `insert into meso_bridge(evento, privilege,  bridgeuniqueid, bridgetype, bridgetechnology, bridgecreator, bridgename, bridgenumchannels, bridgevideosourcemode, channel, channelstate, channelstatedesc, calleridnum, calleridname, connectedlinenum, connectedlinename, linguagem, accountcode, context, exten, prioridade, uniqueid, linkedid, datachamada, iniciochamada) values ('${evt.event}','${evt.privilege}','${evt.bridgeuniqueid}','${evt.bridgetype}','${evt.bridgetechnology}','${evt.bridgecreator}','${evt.bridgename}','${evt.bridgenumchannels}','${evt.bridgevideosourcemode}','${evt.channel}','${evt.channelstate}','${evt.channelstatedesc}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.language}','${evt.accountcode}','${evt.context}','${evt.exten}','${evt.priority}','${evt.uniqueid}','${evt.linkedid}',now(), now());`

        console.log('1 dado gravado ou atualizado, bridge')

        await executaQry(qry)
    }
});

ami.on('agentconnect', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('Entrando em MESO_OPERADORES_RT')
        let qry = `UPDATE users set estado = 'em ligacao', totaliga = totaliga+ 1 where extension = ${evt.calleridnum} or extension = ${evt.connectedlinenum}`

        console.log('1 dado gravado ou atualizado, Bridge')

        await executaQry1(qry)
    }
});


ami.on('agentconnect', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('entrando em meso_Estoque')
        let qry = `insert into meso_estoque(diaatual, tempoatual, ramalvendedor, nomevendedor, cliente, situacao) value(now(), now(), '${evt.connectedlinenum}','${evt.connectedlinename}','${evt.calleridnum}','novo')`

        console.log('1 dado gravado ou atualizado, meso_Estoque')

        await executaQry(qry)
    }
});



ami.on('bridgeleave', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('Entrando em atualizar Operadores_rt')

        let qry = `UPDATE meso_operadores_rt set estado = 'logado' where ramal = ${evt.calleridnum} or ramal = ${evt.connectedlinenum}`

        console.log('1 dado gravado ou atualizado, meso_operadores_rt')

        await executaQry(qry)
    }

});

ami.on('bridgeleave', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('Entrando em meso_operadores_rt')

        let qry = `UPDATE users set estado = 'logado' where extension = ${evt.calleridnum} or extension = ${evt.connectedlinenum}`

        console.log('1 dado gravado ou atualizado, Operadores_rt')

        await executaQry1(qry)
    }
});

ami.on('queuememberremoved', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        //console.log('Entrando em DESLOGA FILA REALTIME AMI')
        let ramal = evt.membername
        let ramalnum = ramal.replace(/[^\d]+/g, "");
        let qry = `UPDATE users set estado = 'deslogado', totaliga = 0 where extension = ${ramalnum}`

        console.log('1 dado gravado ou atualizado, Bridge')

        await executaQry1(qry)
    }




});

ami.on('queuememberremoved', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        //console.log('Entrando em DESLOGA FILA REALTIME AMI2')
        let ramal = evt.membername
        let ramalnum = ramal.replace(/[^\d]+/g, "");
        let qry = `UPDATE users set fila = 0 where extension = ${ramalnum}`

        console.log('1 dado gravado ou atualizado, Bridge')

        await executaQry1(qry)
    }

});

ami.on('bridgeleave', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let qry = `update meso_bridge set terminochamada = now() where uniqueid = '${evt.uniqueid}';`

        console.log('1 dado gravado ou atualizado, desligabridge')

        await executaQry(qry)
    }

});


ami.on('bridgecreate', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let qry = `insert into meso_operadores_em_ligacao(bridgestate, canal1, canal2, uniqueid1, uniqueid2, callerid1, callerid2) values ('${evt.bridgestate}','${evt.channel1}','${evt.channel2}','${evt.bridgeuniqueid}','${evt.linkedid}','${evt.callerid1}','${evt.callerid2}');`

        console.log('1 dado gravado ou atualizado, bridge')

        await executaQry(qry)


    }
});

ami.on('bridgeleave', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let qry = `delete from meso_operadores_em_ligacao where uniqueid1 = '${evt.bridgeuniqueid}' or uniqueid1 = '${evt.bridgeuniqueid}'`

        console.log('1 dado gravado ou atualizado, bridge')

        await executaQry(qry)

    }
});


ami.on('bridge', async function (evt) {
    if (evt.bridgestate === 'link') {
        uniqueid = evt.uniqueid
        if (
            evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

            let qry = `insert into meso_bridge(evento, privilege,  bridgestate, bridgetype, canal1, canal2, uniqueid1, uniqueid2, callerid1, callerid2, datachamada, iniciochamada) values ('${evt.event}','${evt.privilege}','${evt.bridgestate}','${evt.bridgetype}','${evt.channel1}','${evt.channel2}','${evt.uniqueid1}','${evt.uniqueid2}','${evt.callerid1}','${evt.callerid2}', now(), now());`

            console.log('1 dado gravado ou atualizado, bridge')

            await executaQry(qry)
        }
    } else if (evt.bridgestate === 'unlink') {
        if (
            evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

            let qry = `update meso_bridge set terminochamada = now() where terminochamada = '00:00:00';`

            console.log('1 dado gravado ou atualizado, desligabridge')

            await executaQry(qry)
        }
    }
});

ami.on('hangup', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando em  evento hangup')
        let qry = `insert into meso_desliga (evento, privilege, channel, uniqueid, calleridnum, calleridname, connectedlinenum, connectedlinename, accountcode, causa, causatxt) values('${evt.event}','${evt.privilege}','${evt.channel}','${evt.uniqueid}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.accountcode}','${evt.cause}','${evt.causetxt}')`
        console.log('dado inserido em desliga')
        await executaQry(qry)
    }

});

//----------------------------------------------agentes eventos-----------------------------------------------

ami.on('agentlogin', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        let qry = `insert into meso_agentelogin(privilege, agent, canal, uniqueid) values ('${evt.privilege}','${evt.agent}','${evt.channel}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, agentelogin')

        await executaQry(qry)
    }

});

ami.on('agentlogoff', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        let qry = `insert into meso_agentelogoff(privilege, agent, tempologin, uniqueid) values ('${evt.privilege}','${evt.agent}','${evt.longtime}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, agentelogoff')

        await executaQry(qry)
    }

});

ami.on('agentcalled', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        let qry = `insert into meso_agent_called(evento, privilege, fila, agentcalled, agentname, channelcalling, destinationchannel, calleridnum, calleridname, connectedlinenum, connectedlinename, context, extension, prioridade, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.agentcalled}','${evt.agentname}','${evt.channelcalling}','${evt.destinationchannel}','${evt.calleridnum}','${evt.calleridname}','${evt.destcalleridnum}','${evt.destcalleridname}','${evt.context}','${evt.extension}','${evt.priority}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, agentcalled')

        await executaQry(qry)
    }
});

ami.on('agentcalled', async function (evt) {
    uniqueid = evt.uniqueid
    if (

        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando em meso_ligacoes');
        let qry = `insert into meso_ligacoes(fila, uniqueid, channelcalling, calleridnum, calleridname) values ('${evt.queue}','${evt.uniqueid}','${evt.channelcalling}','${evt.calleridnum}','${evt.calleridname}');`

        console.log('1 dado gravado ou atualizado, meso_ligacoes')

        await executaQry(qry)

    }
});

ami.on('agentcomplete', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('entrando no banco agentcomplete')
        let qry = `insert into meso_agent_complete(evento, privilege, fila, uniqueid, channel, membername, calleridnum, calleridname, connectedlinenum, connectedlinename, holdtime, talktime, reason) values ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.uniqueid}','${evt.channel}','${evt.membername}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.holdtime}','${evt.talktime}','${evt.reason}');`

        console.log('1 dado gravado ou atualizado, complete')

        await executaQry(qry)
    }

});
//------------------------------------agent_called_realtime--------------------------------------------------------------------------------    
ami.on('agentcalled', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('entrando em agen_tcalled_realtime')
        let qry = `insert into meso_agent_called_rt(evento, privilege, fila, agentcalled, agentname, channelcalling, destinationchannel, calleridnum, calleridname, connectedlinenum, connectedlinename, context, extension, prioridade, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.agentcalled}','${evt.agentname}','${evt.channelcalling}','${evt.destinationchannel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.context}','${evt.extension}','${evt.priority}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, agentcalled')

        await executaQry(qry)
    }
});

ami.on('agentconnect', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('um dado')
        let qry = `delete from meso_agent_called_rt where uniqueid = ('${evt.uniqueid}')`

        console.log('1 dado gravado removido, agentcalled realtime')

        await executaQry(qry)
    }

});

ami.on('agentconnect', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('um dado inserido em meso_call_connected_RT')
        let qry = `insert into meso_call_connected_rt(evento, privilege, fila, uniqueid, canal, member, menbronome, tempoespera, bridgedchannel, ringtime) values ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.uniqueid}','${evt.channel}','${evt.member}','${evt.membername}','${evt.holdtime}','${evt.bridgedchannel}','${evt.ringtime}');`

        console.log('1 dado gravado removido, agentcalled realtime')
        console.log(qry)
        await executaQry(qry)
    }

});

ami.on('bridgeleave', async function (evt) {

    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let qry = `delete from meso_call_connected_rt where uniqueid = '${evt.uniqueid}' or uniqueid = '${evt.linkedid}';`

        console.log('1 dado gravado ou atualizado, desligabridge')

        await executaQry(qry)
    }

});
ami.on('agentcomplete', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        console.log('um dado Removido de MESO_CALL_CONNECTED_RT')

        let qry = `delete from meso_call_connected_rt where uniqueid = '${evt.uniqueid}'`

        console.log('1 dado gravado ou atualizado, complete')
        console.log(qry)

        await executaQry(qry)
    }
});

ami.on('queuecallerabandon', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        console.log('entrando em abandon')
        let qry = `delete from meso_agent_called_rt where uniqueid = ('${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, abandon')

        await executaQry(qry)
    }

});

//--------------------------------------------------------------------------------------------------------------------

ami.on('agentconnect', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        let qry = `insert into meso_agent_connect(evento, privilege, fila, uniqueid, canal, member, menbronome, tempoespera, bridgedchannel, ringtime, connectedlinename, connectedlinenum, calleridname, calleridnum) values ('${evt.event}','${evt.privilege}','${evt.uniqueid}','${evt.queue}','${evt.channel}','${evt.member}','${evt.membername}','${evt.holdtime}','${evt.bridgedchannel}','${evt.ringtime}','${evt.connectedlinename}','${evt.connectedlinenum}','${evt.calleridnum}','${evt.calleridname}');`

        console.log('1 dado gravado ou atualizado, agentconnect')

        await executaQry(qry)
    }

});

ami.on('blindtransfer', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {


        console.log('entrando no banco TRANSFERENCIA DIRETA!!')
        let qry = `insert into meso_blindtransfer(evento, privilege, result, transfererchannel, transfererchannelstate, transferercalleridnum, transferercalleridname, transfererconnectedlinenum, transfererconnectedlinename, transfererlanguage, transfereraccountcode, transferercontext, transfererexten, transfererpriority, transfereruniqueid, transfererlinkedid, transfereechannel, transfereechannelstate, transfereechannelstatedesc, transfereecalleridnum, transfereecalleridname, transfereeconnectedlinenum, transfereeconnectedlinename, transfereelanguage, transfereeaccountcode, transfereecontext, transfereeexten, transfereepriority, transfereeuniqueid, transfereelinkedid, bridgeuniqueid, bridgetype, bridgetechnology, bridgecreator, bridgename, bridgenumchannels, bridgevideosourcemode, isexternal, context, extension)VALUES('${evt.event}', '${evt.privilege}', 'Transeferid','${evt.transfererchannel}', '${evt.transfererchannelstate}', '${evt.transferercalleridnum}', '${evt.transferercalleridname}', '${evt.transfererconnectedlinenum}', '${evt.transfererconnectedlinename}', '${evt.transfererlanguage}', '${evt.transfereraccountcode}', '${evt.transferercontext}', '${evt.transfererexten}', '${evt.transfererpriority}', '${evt.transfereruniqueid}', '${evt.transfererlinkedid}', '${evt.transfereechannel}', '${evt.transfereechannelstate}', '${evt.transfereechannelstatedesc}', '${evt.transfereecalleridnum}', '${evt.transfereecalleridname}', '${evt.transfereeconnectedlinenum}', '${evt.transfereeconnectedlinename}', '${evt.transfereelanguage}', '${evt.transfereeaccountcode}','${evt.transfereecontext}', '${evt.transfereeexten}', '${evt.transfereepriority}', '${evt.transfereeuniqueid}', '${evt.transfereelinkedid}', '${evt.bridgeuniqueid}', '${evt.bridgetype}', '${evt.bridgetechnology}', '${evt.bridgecreator}', '${evt.bridgename}', '${evt.bridgenumchannels}', '${evt.bridgevideosourcemode}', '${evt.isexternal}', '${evt.context}', '${evt.extension}')`

        console.log('1 dado gravado de TRANSFERENCIA COM DIRETA')

        await executaQry(qry)
    }
});

/* ami.on('attendedtransfer', async function (evt) {
     uniqueid = evt.uniqueid
     if (
         evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
         
 
             console.log('entrando no banco musiconhold realtime')
             let qry = `insert into meso_attended_transfer(evento, privilege, result, origtransfererchannel, origtransfererchannelstate, origtransfererchannelstatedesc, origtransferercalleridnum, origtransferercalleridname, origtransfererconnectedlinenum, origtransfererconnectedlinename, origtransfererlanguage, origtransfereraccountcode, origtransferercontext, origtransfererexten, origtransfererpriority, origtransfereruniqueid, origtransfererlinkedid, origbridgeuniqueid, origbridgetype, origbridgetechnology, origbridgecreator, origbridgename, origbridgenumchannels, origbridgevideosourcemode, secondtransfererchannel, secondtransfererchannelstate, secondtransfererchannelstatedesc, secondtransferercalleridnum, secondtransferercalleridname, secondtransfererconnectedlinenum, secondtransfererconnectedlinename, secondtransfererlanguage, secondtransfereraccountcode, secondtransferercontext, secondtransfererexten, secondtransfererpriority, secondtransfereruniqueid, secondtransfererlinkedid, secondbridgeuniqueid, secondbridgetype, secondbridgetechnology, secondbridgecreator, secondbridgename, secondbridgenumchannels, secondbridgevideosourcemode, transfereechannel, transfereechannelstate, transfereechannelstatedesc, transfereecalleridnum, transfereecalleridname, transfereeconnectedlinenum, transfereeconnectedlinename, transfereelanguage, transfereeaccountcode, transfereecontext, transfereeexten, transfereepriority, transfereeuniqueid, transfereelinkedid, transfertargetchannel, transfertargetchannelstate, transfertargetchannelstatedesc, transfertargetcalleridnum, transfertargetcalleridname, transfertargetconnectedlinenum, transfertargetconnectedlinename, transfertargetlanguage, transfertargetaccountcode, transfertargetcontext, transfertargetexten, transfertargetpriority, transfertargetuniqueid, transfertargetlinkedid, isexternal, desttype, destbridgeuniqueid) VALUES `
 
             console.log('1 dado gravado de musiconhold realtime')
 
             await executaQry(qry)
         }
     }) ;
*/

ami.on('attendedtransfer', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {


        console.log('entrando no banco TRANSFERENCIA COM CONSULTA')
        let qry = `insert into meso_transf_consult(evento, privilege, result, transfererchannel, transfererchannelstate, transferercalleridnum, transferercalleridname, transfererconnectedlinenum, transfererconnectedlinename, transfererlanguage, transfereraccountcode, transferercontext, transfererexten, transfererpriority, transfereruniqueid, transfererlinkedid, transfereechannel, transfereechannelstate, transfereechannelstatedesc, transfereecalleridnum, transfereecalleridname, transfereeconnectedlinenum, transfereeconnectedlinename, transfereelanguage, transfereeaccountcode, transfereecontext, transfereeexten, transfereepriority, transfereeuniqueid, transfereelinkedid, bridgeuniqueid, bridgetype, bridgetechnology, bridgecreator, bridgename, bridgenumchannels, bridgevideosourcemode, isexternal, context, extension)VALUES('${evt.event}', '${evt.privilege}', '${evt.result}','${evt.transfererchannel}', '${evt.transfererchannelstate}', '${evt.transferercalleridnum}', '${evt.transferercalleridname}', '${evt.transfererconnectedlinenum}', '${evt.transfererconnectedlinename}', '${evt.transfererlanguage}', '${evt.transfereraccountcode}', '${evt.transferercontext}', '${evt.transfererexten}', '${evt.transfererpriority}', '${evt.transfereruniqueid}', '${evt.transfererlinkedid}', '${evt.transfereechannel}', '${evt.transfereechannelstate}', '${evt.transfereechannelstatedesc}', '${evt.transfereecalleridnum}', '${evt.transfereecalleridname}', '${evt.transfereeconnectedlinenum}', '${evt.transfereeconnectedlinename}', '${evt.transfereelanguage}', '${evt.transfereeaccountcode}','${evt.transfereecontext}', '${evt.transfereeexten}', '${evt.transfereepriority}', '${evt.transfereeuniqueid}', '${evt.transfereelinkedid}', '${evt.origbridgeuniqueid}', '${evt.bridgetype}', '${evt.bridgetechnology}', '${evt.bridgecreator}', '${evt.bridgename}', '${evt.bridgenumchannels}', '${evt.bridgevideosourcemode}', '${evt.isexternal}', 'transferido com consulta', '${evt.extension}')`

        console.log('1 dado gravado de TRANSFERENCIA COM CONSULTA')

        await executaQry(qry)
    }

});



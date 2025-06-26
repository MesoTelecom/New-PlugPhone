var ami = new require('asterisk-manager')('5038', 'localhost', 'user-meso', 'Erdfg567HBNMi890Kujhgf##3gfdc', true);
console.log("Ola Mundo")
// In case of any connectiviy problems we got you coverd.
ami.keepConnected();

let { executaQry } = require('./db')
var CronJob = require('cron').CronJob;
var job = new CronJob(
	'0 1 0 * * *',
	async function() {
		let query = `UPDATE meso_operadores SET totaliga = 0`;
        await executaQry(query)

	},
	null,
	true,
	'America/Sao_Paulo'
);

ami.on('queuememberadded', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando em LoginFila')
        let qry = `INSERT INTO meso_login_fila(evento, privilege, fila, localizacao, membername, stateinterface, membership, penalty, callstaken, lastcall, estado, pausado ) VALUES('${evt.event}','${evt.privilege}','${evt.queue}','${evt.location}','${evt.membername}','${evt.stateinterface}','${evt.membership}','${evt.penalty}','${evt.callstaken}','${evt.lastcall}','${evt.status}','${evt.paused}')`

        console.log('dado inserido em LoginFila')
        await executaQry(qry)
    }

});

ami.on('newexten', async function (evt) {
    if(evt.appdata =='PEGA_CPF'){
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando em LoginFila')
        let qry = `INSERT INTO meso_cpf(cpf, channel, uniqueid) VALUES('${evt.extension}','${evt.channel}','${evt.uniqueid}')`

        console.log('dado inserido em LoginFila')
        await executaQry(qry)
    }
}

});

ami.on('queuememberremoved', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando em DeslogaFila')
        let qry = `update meso_login_fila set desloga = now() where localizacao = '${evt.location}'and fila ='${evt.queue}' and desloga ='0000-00-00 00:00:00';`

        await executaQry(qry)
    }


});

ami.on('queuememberpaused', async function (evt) {
    if (evt.paused >= '1') {
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
            console.log('entrando em PausaFila')
            let qry = `INSERT INTO meso_pausa_fila (evento, privilege, fila, localizacao, membername, pausado, dataPausa, hora) values('${evt.event}','${evt.privilege}','${evt.queue}','${evt.location}','${evt.membername}','${evt.paused}', now(), now())`

            console.log('1 dado gravado ou atualizado, PausaFila')

            await executaQry(qry)


        }
    }

    else if (evt.paused === '0') {
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
            let qry = `UPDATE meso_pausa_fila SET despausado = now() where despausado = ('00:00:00');`
            console.log('1 dado gravado ou atualizado, despausado em PausaFila')

            await executaQry(qry)
        }

    }
})

ami.on('queuememberpaused', async function (evt) {
    if (evt.paused >= '1' && evt.reason == 'em pausa') {
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
            console.log('entrando em PausaFila')
            let ramalnumsip = evt.location
            let ramalnum = ramalnumsip.replace(/[^\d]+/g, "");

            let qry = `UPDATE meso_operadores set estado = 'pausado' where  ramal ='${ramalnum}';`

            console.log('1 dado gravado ou atualizado, PausaFila')

            await executaQry(qry)


        }
    }

    else if (evt.paused === '0' && evt.reason == 'em pausa') {
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
                let ramalnumsip = evt.location
                let ramalnum = ramalnumsip.replace(/[^\d]+/g, "");

                let qry = `UPDATE meso_operadores set estado = 'logado' where  ramal = '${ramalnum}';`
                console.log('1 dado gravado ou atualizado, despausado em PausaFila')

            await executaQry(qry)
        }

    }
})

ami.on('queuememberremoved', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando em DeslogaFila')
        let ramalnumsip = evt.location
        let ramalnum = ramalnumsip.replace(/[^\d]+/g, "");
        let qry = `UPDATE meso_operadores set estado = 'deslogado' where  ramal = '${ramalnum}';`

        await executaQry(qry)
    }


});

ami.on('queuememberremoved', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando em DeslogaFila')
        let qry = `INSERT INTO meso_desloga_fila(evento, fila, localizacao, membername) VALUES('${evt.event}','${evt.queue}','${evt.location}','${evt.membername}')`

        await executaQry(qry)
    }


});

ami.on('join', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando no banco entrar')
        let qry = `INSERT INTO meso_entrar(evento, privilege, channel, calleridnum, calleridname, connectedlinenum, connectedlinename, fila, position, conta, uniqueid) VALUES ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.queue}',' ${evt.position}','${evt.count}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, entrar')

        await executaQry(qry)
    }

});

ami.on('join', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando no banco entrar realtime')
        let qry = `INSERT INTO meso_join_rt(evento, privilege, channel, calleridnum, calleridname, connectedlinenum, connectedlinename, fila, position, conta, uniqueid) VALUES ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.queue}',' ${evt.position}','${evt.count}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, entrar')

        await executaQry(qry)
    }

});
ami.on('leave', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando no banco entrar realtime')
        let qry = `delete from meso_join_rt where uniqueid = '${evt.uniqueid}';`

        console.log('1 dado removido de, meso_join_rt')


        await executaQry(qry)
        console.log(qry)
    }

});


/*
ami.on('join', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando no banco entrar')
        let qry = `INSERT INTO logs (user, ramal, fila, motivo, pausa) values('4848','${evt.calleridnum}','${evt.queue})`

        console.log('1 dado gravado ou atualizado, entrar')

        await executaQry(qry)
    }

});
*/
ami.on('dial', async function (evt) {
    if (evt.subevent === 'Begin') {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

            console.log('entrando em  evento dial')
            let qry = `INSERT INTO meso_dial(evento, privilege, subevent, channel, destination, calleridnum, calleridname, connectedlinenum, connectedlinename, uniqueid, datauniqueid, dialstring, InicioChamada) VALUES ('${evt.event}','${evt.privilege}','${evt.subevent}','${evt.channel}','${evt.destination}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.uniqueid}','${evt.destuniqueid}','${evt.dialstring}',now());`
            console.log('dado inserido em dial')
            await executaQry(qry)
        }
    } else if (evt.subevent === 'End') {
        let qry = `update meso_dial set terminoChamada = now(), dialstatus = '${evt.dialstatus}' where uniqueid= '${evt.uniqueid}'` 
        console.log('dado atualizado em dial')
        await executaQry(qry)

    }
});

ami.on('musiconhold', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        if (evt.state === 'Start') {

            console.log('entrando no banco MusicOnHold')
            let qry = `INSERT INTO meso_music_on_hold(evento, privilege, estado, channel, uniqueid, class, dataInicio, hora) VALUES ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

            console.log('1 dado gravado ou atualizado, musiconhold')

            await executaQry(qry)
        } else if (evt.state === 'Stop') {
            console.log('saindo no banco MusicOnHold')
            let qry = `update meso_music_on_hold set dataTermino = now() where uniqueid = '${evt.uniqueid}';`

            console.log('1 dado removido ou atualizado, MusicOnHold')

            await executaQry(qry)

        }

    }
});

ami.on('musiconhold', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        if (evt.state === 'Start') {

            console.log('entrando no banco MusicOnHold REALTIME')
            let qry = `INSERT INTO meso_music_on_hold_rt(evento, privilege, estado, channel, uniqueid, class, dataInicio, hora) VALUES ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

            console.log('1 dado gravado de musiconhold REALTIME')

            await executaQry(qry)
        } else if (evt.state === 'Stop') {
            console.log('saindo no banco MusicOnHold REALTIME')
            let qry = `delete from meso_music_on_hold_rt  where uniqueid = '${evt.uniqueid}';`

            console.log('1 dado removido de MusicOnHold REALTIME')

            await executaQry(qry)

        }

    }
});

ami.on('leave', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        console.log('entrando em sair')
        let qry = `INSERT INTO meso_sair(evento, privilege, channel, fila, conta, position, uniqueid) VALUES ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.queue}','${evt.count}','${evt.uniqueid}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, sai')

        await executaQry(qry)
    }

});

ami.on('queuecallerabandon', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        console.log('entrando em abandon')
        let qry = `INSERT INTO meso_abandon(evento, privilege, fila, channel, uniqueid, position, originalposition, holdtime) VALUES ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.channel}','${evt.uniqueid}','${evt.position}','${evt.originalposition}','${evt.holdtime}');`

        console.log('1 dado gravado ou atualizado, abandon')

        await executaQry(qry)
    }

});




ami.on('bridge', async function (evt) {
    if (evt.bridgestate === 'Link') {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
                    
            let qry = `INSERT INTO meso_operadores_em_ligacao(bridgestate, canal1, canal2, uniqueid1, uniqueid2, callerid1, callerid2) VALUES ('${evt.bridgestate}','${evt.channel1}','${evt.channel2}','${evt.uniqueid1}','${evt.uniqueid2}','${evt.callerid1}','${evt.callerid2}');`

            console.log('1 dado gravado ou atualizado, Bridge')

            await executaQry(qry)
        }
    } else if (evt.bridgestate === 'Unlink') {
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

            let qry = `delete from meso_operadores_em_ligacao where uniqueid2 = '${evt.uniqueid2}'`

            console.log('1 dado gravado ou deletado de meso_operadores_em_ligacao')

            await executaQry(qry)
        }
    }
});

ami.on('hangup', async function (evt) {

        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
                    
            let qry = `delete from meso_cpf where uniqueid =  '${evt.uniqueid}'`

            console.log('1 dado gravado ou atualizado, Bridge')

            await executaQry(qry)
        
    }
});

ami.on('bridge', async function (evt) {
    if (evt.bridgestate === 'Link') {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
                
            console.log('Entrando em MESO_OPERADORES')
            let qry = `UPDATE meso_operadores set estado = 'em ligacao', totaliga = totaliga+ 1 where ramal = ${evt.callerid1} or ramal = ${evt.callerid2}`

            console.log('1 dado gravado ou atualizado, Bridge')

            await executaQry(qry)
        }
    } else if (evt.bridgestate === 'Unlink') {
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

            let qry = `UPDATE meso_operadores set estado = 'logado' where ramal = ${evt.callerid1} or ramal = ${evt.callerid2}`
            
            console.log('1 dado gravado ou deletado de meso_operadores')

            await executaQry(qry)
        }
    }
});

ami.on('bridge', async function (evt) {
    if (evt.bridgestate === 'Link') {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

            let qry = `INSERT INTO meso_bridge(evento, privilege,  bridgestate, bridgetype, canal1, canal2, uniqueid1, uniqueid2, callerid1, callerid2, DataChamada, InicioChamada) VALUES ('${evt.event}','${evt.privilege}','${evt.bridgestate}','${evt.bridgetype}','${evt.channel1}','${evt.channel2}','${evt.uniqueid1}','${evt.uniqueid2}','${evt.callerid1}','${evt.callerid2}', now(), now());`

            console.log('1 dado gravado ou atualizado, Bridge')

            await executaQry(qry)
        }
    } else if (evt.bridgestate === 'Unlink') {
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

            let qry = `UPDATE meso_bridge SET terminoChamada = now() where terminoChamada = '00:00:00';`

            console.log('1 dado gravado ou atualizado, DesligaBridge')

            await executaQry(qry)
        }
    }
});

ami.on('hangup', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {

        console.log('entrando em  evento Hangup')
        let qry = `INSERT INTO meso_desliga (evento, privilege, channel, uniqueid, calleridnum, calleridname, connectedlinenum, connectedlinename, accountcode, causa, causatxt) values('${evt.event}','${evt.privilege}','${evt.channel}','${evt.uniqueid}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.accountcode}','${evt.cause}','${evt.causetxt}')`
        console.log('dado inserido em Desliga')
        await executaQry(qry)
    }

});

//----------------------------------------------AGENTES EVENTOS-----------------------------------------------

ami.on('agentlogin', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        let qry = `INSERT INTO meso_AgenteLogin(privilege, agent, canal, uniqueid) VALUES ('${evt.privilege}','${evt.agent}','${evt.channel}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, AgenteLogin')

        await executaQry(qry)
    }

});

ami.on('agentlogoff', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        let qry = `INSERT INTO meso_AgenteLogoff(privilege, agent, tempologin, uniqueid) VALUES ('${evt.privilege}','${evt.agent}','${evt.longtime}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, AgenteLogoff')

        await executaQry(qry)
    }

});

ami.on('agentcalled', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        let qry = `INSERT INTO meso_agent_called(evento, privilege, fila, agentcalled, agentname, channelcalling, destinationchannel, calleridnum, calleridname, connectedlinenum, connectedlinename, context, extension, prioridade, uniqueid) VALUES ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.agentcalled}','${evt.agentname}','${evt.channelcalling}','${evt.destinationchannel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.context}','${evt.extension}','${evt.priority}','${evt.uniqueid}');`

        console.log('1 dado gravado ou atualizado, AgentCalled')

        await executaQry(qry)
    }
});

ami.on('agentcalled', async function (evt) {
    uniqueid = evt.uniqueid
    if (
        
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        
            console.log('entrando em meso_ligacoes');
        let qry = `INSERT INTO meso_ligacoes(fila, uniqueid, channelcalling, calleridnum, calleridname) VALUES ('${evt.queue}','${evt.uniqueid}','${evt.channelcalling}','${evt.calleridnum}','${evt.calleridname}');`

        console.log('1 dado gravado ou atualizado, meso_ligacoes')

        await executaQry(qry)
        console.log(qry)
    }
});

    ami.on('agentcomplete', async function (evt) {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
    
            console.log('entrando no banco AgentComplete')
            let qry = `INSERT INTO meso_agent_complete(evento, privilege, fila, uniqueid, channel, member, membername, holdtime, talktime, reason) VALUES ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.uniqueid}','${evt.channel}','${evt.member}','${evt.membername}','${evt.holdtime}','${evt.talktime}','${evt.reason}');`
    
            console.log('1 dado gravado ou atualizado, complete')
    
            await executaQry(qry)
        }
    
    });
//------------------------------------Agent_called_RealTime--------------------------------------------------------------------------------    
    ami.on('agentcalled', async function (evt) {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
                console.log('entrando em agen_tcalled_REALTIME')
            let qry = `INSERT INTO meso_agent_called_rt(evento, privilege, fila, agentcalled, agentname, channelcalling, destinationchannel, calleridnum, calleridname, connectedlinenum, connectedlinename, context, extension, prioridade, uniqueid) VALUES ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.agentcalled}','${evt.agentname}','${evt.channelcalling}','${evt.destinationchannel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.context}','${evt.extension}','${evt.priority}','${evt.uniqueid}');`
    
            console.log('1 dado gravado ou atualizado, AgentCalled')
    
            await executaQry(qry)
        }
    });
    
    ami.on('agentconnect', async function (evt) {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
                console.log('um dado')
            let qry = `delete from meso_agent_called_rt where uniqueid = ('${evt.uniqueid}')`
    
            console.log('1 dado gravado removido, Agentcalled REALTIME')
    
            await executaQry(qry)
        }
    
    });
    
    ami.on('queuecallerabandon', async function (evt) {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
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
        evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
        let qry = `INSERT INTO meso_agent_connect(evento, privilege, fila, uniqueid, canal, member, menbroNome, tempoEspera, bridgedchannel, ringtime) VALUES ('${evt.event}','${evt.privilege}','${evt.uniqueid}','${evt.queue}','${evt.channel}','${evt.member}','${evt.membername}','${evt.holdtime}','${evt.bridgedchannel}','${evt.ringtime}');`

        console.log('1 dado gravado ou atualizado, AgentConnect')

        await executaQry(qry)
    }

});    

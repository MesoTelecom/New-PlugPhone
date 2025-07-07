const { executaQry } = require('../banco/bd')
const { executaQry2 } = require('../banco/db2')

class SocketController {
  constructor(socketWrapper, asteriskController, db) {
    this.operadores = new Map()
    this.socketWrapper = socketWrapper;
    this.asteriskController = asteriskController;
    this.db = db
  }

  initializeSocketEvents() {

    this.asteriskController.on('hangup', async (evt) => {
      //console.log(evt)
      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        //console.log('entrando em  evento hangup')
        let qry = `insert into meso_desliga (evento, privilege, channel, uniqueid, calleridnum, calleridname, connectedlinenum, connectedlinename, accountcode, causa, causatxt) values('${evt.event}','${evt.privilege}','${evt.channel}','${evt.uniqueid}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.accountcode}','${evt.cause}','${evt.causetxt}')`
        //console.log('dado inserido em desliga')
        await executaQry(qry)
      }
    })

    this.asteriskController.on('queuememberadded', async (evt) => {
      //console.log(evt)
      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        //console.log('entrando em loginfila')
        let qry = `insert into meso_login_fila(evento, privilege, fila, localizacao, membername, stateinterface, membership, penalty, callstaken, lastcall, estado, pausado ) values('${evt.event}','${evt.privilege}','${evt.queue}','${evt.location}','${evt.membername}','${evt.stateinterface}','${evt.membership}','${evt.penalty}','${evt.callstaken}','${evt.lastcall}','${evt.status}','${evt.paused}')`

        //console.log('dado inserido em loginfila', qry)
        await executaQry(qry)



        //console.log('entrando em deslogafila')
        
        let ramal = evt.membername
        let ramalnum = ramal.replace(/[^\d]+/g, "");
        let qry2 = `UPDATE users set fila = '${evt.queue}' where extension = ${ramalnum}`

        //console.log('eu sou qry2 CARALHO',qry2)
        
        await executaQry2(qry2)

//        let qry3 = `UPDATE users set fila = 0 where extension = ${ramalnum}`

        //console.log('1 dado gravado ou atualizado, Bridge')

 //       await executaQry2(qry3)



      }
    })



    this.asteriskController.on('queuecallerjoin', async (evt) => {
      //console.log(evt)
      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {


        //console.log('entrando no banco meso_detalhe')
        let qry = `INSERT INTO meso_detalhe(datahora, uniqueid, solicitante, tronco) VALUES (now(), '${evt.uniqueid}','${evt.calleridnum}','${evt.channel}');`
        //console.log('1 dado gravado ou atualizado, entrar')
        await executaQry(qry)

        let qry1 = `insert into meso_entrar(evento, privilege, channel, calleridnum, calleridname, connectedlinenum, connectedlinename, fila, position, conta, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.queue}',' ${evt.position}','${evt.count}','${evt.uniqueid}');`

        //console.log('1 dado gravado ou atualizado, entrar')

        await executaQry(qry1)

        let qry2 = `insert into meso_join_rt(evento, privilege, channel, calleridnum, calleridname, connectedlinenum, connectedlinename, fila, position, conta, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.queue}',' ${evt.position}','${evt.count}','${evt.uniqueid}');`

        //console.log('1 dado gravado ou atualizado, entrar')

        await executaQry(qry2


        )
      }

    })

    this.asteriskController.on('dialbegin', async (evt) => {
      //console.log(evt)
      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        //console.log('entrando em  evento dial')
        let qry = `insert into meso_dial(evento, privilege, channel, channelstate, channelstatedesc, calleridnum, calleridname, connectedlinenum, connectedlinename, linguagem, accountcode, context, exten, prioridade, uniqueid, linkedid, destchannel, destchannelstate, destchannelstatedesc, destcalleridnum, destcalleridname, destlanguage, destaccountcode, destcontext, destexten, destpriority, destuniqueid, destlinkedid, dialstring,iniciochamada) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.channelstate}','${evt.channelstatedesc}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.language}','${evt.accountcode}','${evt.context}','${evt.exten}','${evt.priority}','${evt.uniqueid}','${evt.linkedid}','${evt.destchannel}','${evt.destchannelstate}','${evt.destchannelstatedesc}','${evt.destcalleridnum}','${evt.destcalleridname}','${evt.destlanguage}','${evt.destaccountcode}','${evt.destcontext}','${evt.destexten}','${evt.destpriority}','${evt.destuniqueid}','${evt.destlinkedid}','${evt.dialstring}',now());`
        //console.log('dado inserido em dial')
        await executaQry(qry)

        let qry1 = `insert into meso_detalhe_sainte(datahora, uniqueid, solicitante, tronco) values (now(), '${evt.uniqueid}', '${evt.calleridnum}', '${evt.channel}');`
        //console.log('Provalmente um dado foi inserido no meso_detalhe_sainte',qry1)
        await executaQry(qry1)
      }
    })

    this.asteriskController.on('dialend', async (evt) => {
      //console.log(evt)
      if (evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        if (evt.dialstatus == 'ANSWER') {
          //console.log('entrando no banco Meso_detalhe')
          let qry = `update meso_detalhe_sainte set estado = 'atendida' where uniqueid = '${evt.uniqueid}';`
          //console.log('1 dado gravado ou atualizado, complete',qry)
          await executaQry(qry)

          let qry1 = `update meso_detalhe_sainte set teleatendente = '${evt.connectedlinenum}' where uniqueid = '${evt.uniqueid}';`

          //console.log('1 dado gravado ou atualizado, complete',qry1)
          await executaQry(qry1)

          //console.log('entrando no banco Meso_detalhe')
          
        }else if (evt.dialstatus != 'ANSWER'){
          let qry2 = `update meso_detalhe_sainte set estado = 'abandonado' where uniqueid = '${evt.uniqueid}';`
          console.log('1 dado gravado ou atualizado, complete',qry2)
          await executaQry(qry2)
        }

        //console.log('entrando no banco Meso_detalhe')
        let qry = `update meso_detalhe_sainte set dialend = now() where uniqueid = '${evt.uniqueid}';`
        console.log('1 dado gravado ou atualizado, complete',qry)
        await executaQry(qry)

        let qry2 = `update meso_dial set terminochamada = now(), dialstatus = '${evt.dialstatus}' where uniqueid= '${evt.uniqueid}'`
        //console.log('dado atualizado em dial')
        await executaQry(qry2)
      }
    })


    this.asteriskController.on('musiconholdstart', async (evt) => {
      //console.log(evt)
      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        //console.log('entrando no banco musiconhold')
        let qry = `insert into meso_music_on_hold(evento, privilege, estado, channel, uniqueid, class, datainicio, hora) values ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

        //console.log('1 dado gravado ou atualizado, musiconhold')

        await executaQry(qry)

        let qry1 = `update meso_music_on_hold set datatermino = now() where uniqueid = '${evt.uniqueid}';`

        //console.log('1 dado removido ou atualizado, musiconhold')

        await executaQry(qry1)

        let qry2 = `insert into meso_music_on_hold_rt(evento, privilege, estado, channel, uniqueid, class, datainicio, hora) values ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

        //console.log('1 dado gravado de musiconhold realtime')

        await executaQry(qry2)
      }
    })


    this.asteriskController.on('musiconhold', async function (evt) {

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        if (evt.state === 'start') {

          //console.log('entrando no banco musiconhold')
          let qry = `insert into meso_music_on_hold(evento, privilege, estado, channel, uniqueid, class, datainicio, hora) values ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

          //console.log('1 dado gravado ou atualizado, musiconhold')

          await executaQry(qry)

          //console.log('entrando no banco musiconhold realtime')
          let qry1 = `insert into meso_music_on_hold_rt(evento, privilege, estado, channel, uniqueid, class, datainicio, hora) values ('${evt.event}','${evt.privilege}','${evt.state}','${evt.channel}','${evt.uniqueid}','${evt.class}',date(now()), time(now()));`

          //console.log('1 dado gravado de musiconhold realtime')

          await executaQry(qry1)
        } else if (evt.state === 'stop') {
          //console.log('saindo no banco musiconhold')
          let qry = `update meso_music_on_hold set datatermino = now() where uniqueid = '${evt.uniqueid}';`

          //console.log('1 dado removido ou atualizado, musiconhold')

          await executaQry(qry)

          let qry1 = `delete from meso_music_on_hold_rt  where uniqueid = '${evt.uniqueid}';`

          //console.log('1 dado removido de musiconhold realtime')

          await executaQry(qry1)

        }

      }
    });

    this.asteriskController.on('queuecallerleave', async function (evt) {

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        //console.log('entrando no banco entrar realtime')
        let qry = `delete from meso_join_rt where uniqueid = '${evt.uniqueid}';`

        //console.log('1 dado removido de, meso_join_rt')


        await executaQry(qry)

        qry = `insert into meso_sair(evento, privilege, channel, fila, conta, position, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.queue}','${evt.count}','${evt.uniqueid}','${evt.uniqueid}');`

        //console.log('1 dado gravado ou atualizado, sai')

        await executaQry(qry)


      }

    });

    this.asteriskController.on('musiconholdstop', async function (evt) {

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {


        //console.log('saindo no banco musiconhold realtime')
        let qry = `delete from meso_music_on_hold_rt  where uniqueid = '${evt.uniqueid}';`

        //console.log('1 dado removido de musiconhold realtime')

        await executaQry(qry)
      }
    })

    this.asteriskController.on('dial', async (evt) => {
      //console.log(evt)

      if (evt.subevent === 'begin') {

        if (
          evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

          //console.log('entrando em  evento dial')
          let qry = `insert into meso_dial(evento, privilege, subevent, channel, destination, calleridnum, calleridname, connectedlinenum, connectedlinename, uniqueid, datauniqueid, dialstring, iniciochamada) values ('${evt.event}','${evt.privilege}','${evt.subevent}','${evt.channel}','${evt.destination}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.uniqueid}','${evt.destuniqueid}','${evt.dialstring}',now());`
          //console.log('dado inserido em dial')
          await executaQry(qry)
        } else if (evt.subevent === 'end') {
          let qry = `update meso_dial set terminochamada = now(), dialstatus = '${evt.dialstatus}' where uniqueid= '${evt.uniqueid}'`
          //console.log('dado atualizado em dial')
          await executaQry(qry)

        }
      }

    })



    this.asteriskController.on('queuecallerabandon', async function (evt) {

      //console.log('entrando no banco Meso_detalhe')
      let qry = `update meso_detalhe set estado = 'abandonado' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)

      qry = `update meso_detalhe set fila = '${evt.queue}' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)

      qry = `update meso_detalhe set holdtime = '${evt.holdtime}' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)

      qry = `delete from meso_join_rt where uniqueid = '${evt.uniqueid}'`

      //console.log('1 dado removido de meso_join_rt')

      await executaQry(qry)

      qry = `insert into meso_abandon(evento, privilege, channel,fila, uniqueid, position, originalposition, holdtime) values ('${evt.event}','${evt.privilege}','${evt.channel}','${evt.queue}','${evt.uniqueid}','${evt.position}','${evt.originalposition}','${evt.holdtime}');`

      //console.log('1 dado gravado ou atualizado, abandon')

      await executaQry(qry)

      qry = `delete from meso_agent_called_rt where uniqueid = ('${evt.uniqueid}');`

      //console.log('1 dado gravado ou atualizado, abandon')

      await executaQry(qry)


    });


    this.asteriskController.on('dialend', async function (evt) {

      if (evt.dialstatus != 'ANSWER') {

        //console.log('entrando no banco Meso_detalhe')
        let qry = `update meso_detalhe_sainte set estado = 'abandonado' where uniqueid = '${evt.uniqueid}';`
        console.log('1 dado gravado ou atualizado, complete',qry)
        await executaQry(qry)

      }
      else if (evt.dialstatus == 'ANSWER') {
        //console.log('entrando no banco Meso_detalhe')
        let qry = `update meso_detalhe_sainte set estado = 'atendida' where uniqueid = '${evt.uniqueid}';`
        console.log('1 dado gravado ou atualizado, complete',qry)
        await executaQry(qry)
        let qry1 = `update meso_detalhe_sainte set teleatendente = '${evt.connectedlinenum}' where uniqueid = '${evt.uniqueid}';`
        //console.log(qry)
       // console.log('1 dado gravado ou atualizado, complete',qry1)
        await executaQry(qry1)
      }
      let qry = `update meso_detalhe_sainte set dialend = now() where uniqueid = '${evt.uniqueid}';`
      console.log('1 dado gravado ou atualizado, complete',qry)
      await executaQry(qry)

      qry = `update meso_dial set terminochamada = now(), dialstatus = '${evt.dialstatus}' where uniqueid= '${evt.uniqueid}'`
      //console.log('dado atualizado em dial')
      await executaQry(qry)
    });

    this.asteriskController.on('bridgeleave', async function (evt) {

      ////////////console.log('entrando no banco Meso_detalhe')
      let qry = `update meso_detalhe_sainte set terminoligacao = now() where uniqueid = '${evt.uniqueid}';`
      ////////////console.log('1 dado gravado ou atualizado, sainte')
      await executaQry(qry)

});

    this.asteriskController.on('agentcomplete', async function (evt) {

      //console.log('entrando no banco Meso_detalhe')
      let qry = `update meso_detalhe set estado = 'atendida' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)





      //console.log('entrando no banco Meso_detalhe')
      qry = `update meso_detalhe set razao = '${evt.reason}' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)





      //console.log('entrando no banco Meso_detalhe')
      qry = `update meso_detalhe set teleatendente = '${evt.interface}' where uniqueid = '${evt.uniqueid}';`
      //console.log(qry)
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)

      qry = `update meso_detalhe set fila = '${evt.queue}' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)

      qry = `update meso_detalhe set duracao = '${evt.talktime}' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)

      qry = `update meso_detalhe set holdtime = '${evt.holdtime}' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)

      qry = `update meso_detalhe set tronco = '${evt.channel}' where uniqueid = '${evt.uniqueid}';`
      //console.log('1 dado gravado ou atualizado, complete')
      await executaQry(qry)

      qry = `insert into meso_agent_complete(evento, privilege, fila, uniqueid, channel, membername, calleridnum, calleridname, connectedlinenum, connectedlinename, holdtime, talktime, reason) values ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.uniqueid}','${evt.channel}','${evt.membername}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.holdtime}','${evt.talktime}','${evt.reason}');`

      //console.log('1 dado gravado ou atualizado, complete')

      await executaQry(qry)

      qry = `delete from meso_call_connected_rt where uniqueid = '${evt.uniqueid}'`

      //console.log('1 dado gravado ou atualizado, complete')
      //console.log(qry)

      await executaQry(qry)

    });


    this.asteriskController.on('bridgeenter', async function (evt) {


      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let qry = `insert into meso_bridge(evento, privilege,  bridgeuniqueid, bridgetype, bridgetechnology, bridgecreator, bridgename, bridgenumchannels, bridgevideosourcemode, channel, channelstate, channelstatedesc, calleridnum, calleridname, connectedlinenum, connectedlinename, linguagem, accountcode, context, exten, prioridade, uniqueid, linkedid, datachamada, iniciochamada) values ('${evt.event}','${evt.privilege}','${evt.bridgeuniqueid}','${evt.bridgetype}','${evt.bridgetechnology}','${evt.bridgecreator}','${evt.bridgename}','${evt.bridgenumchannels}','${evt.bridgevideosourcemode}','${evt.channel}','${evt.channelstate}','${evt.channelstatedesc}','${evt.calleridnum}','${evt.calleridname}','${evt.connectedlinenum}','${evt.connectedlinename}','${evt.language}','${evt.accountcode}','${evt.context}','${evt.exten}','${evt.priority}','${evt.uniqueid}','${evt.linkedid}',now(), now());`

        //console.log('1 dado gravado ou atualizado, bridge')

        await executaQry(qry)
        let qry1 = `update meso_detalhe_sainte set inicioligacao = now() where uniqueid = '${evt.uniqueid}';`
        console.log('Olha aquik',qry1)
        //console.log('Eu acho que foi atualizado algum dado na tabela meso_detelhe_sainte')
        await executaQry(qry1)
      }
    });


    this.asteriskController.on('bridgeleave', async function (evt) {


      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        //console.log('Entrando em atualizar Operadores_rt')

        let qry = `UPDATE meso_operadores_rt set estado = 'logado' where ramal = ${evt.calleridnum} or ramal = ${evt.connectedlinenum}`

        //console.log('1 dado gravado ou atualizado, meso_operadores_rt')

        await executaQry(qry)
      }


      //console.log('Entrando em meso_operadores_rt')

      let qry = `UPDATE users set estado = 'logado' where extension = ${evt.calleridnum} or extension = ${evt.connectedlinenum}`

      //console.log('1 dado gravado ou atualizado, Operadores_rt')

      await executaQry2(qry)

      qry = `UPDATE users set estado = 'logado' where extension = ${evt.calleridnum} or extension = ${evt.connectedlinenum}`

      //console.log('1 dado gravado ou atualizado, Operadores_rt')

      await executaQry2(qry)

      qry = `update meso_bridge set terminochamada = now() where uniqueid = '${evt.uniqueid}';`

      //console.log('1 dado gravado ou atualizado, desligabridge')

      await executaQry(qry)

      qry = `delete from meso_operadores_em_ligacao where uniqueid1 = '${evt.bridgeuniqueid}' or uniqueid1 = '${evt.bridgeuniqueid}'`

      //console.log('1 dado gravado ou atualizado, bridge')

      await executaQry(qry)

      qry = `delete from meso_call_connected_rt where uniqueid = '${evt.uniqueid}' or uniqueid = '${evt.linkedid}';`

      //console.log('1 dado gravado ou atualizado, desligabridge')

      await executaQry(qry)
    });


    this.asteriskController.on('queuememberremoved', async function (evt) {

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let ramal = evt.membername
        let ramalnum = ramal.replace(/[^\d]+/g, "");

        //console.log('entrando em deslogafila')
        let qry = `update meso_login_fila set desloga = now() where desloga = '0000-00-00 00:00:00' and membername ='${evt.membername}'`

        await executaQry(qry)

        qry = `insert into meso_desloga_fila(evento, fila, localizacao, membername) values('${evt.event}','${evt.queue}','${evt.location}','${evt.membername}')`

        await executaQry(qry)

        qry = `UPDATE users set estado = 'deslogado', totaliga = 0 where extension = ${ramalnum}`

        //console.log('1 dado gravado ou atualizado, Bridge')

        await executaQry2(qry)

        qry = `UPDATE users set fila = 0 where extension = ${ramalnum}`

        //console.log('1 dado gravado ou atualizado, Bridge')

        await executaQry2(qry)
      }


    });


    this.asteriskController.on('queuememberpause', async function (evt) {
      if (evt.paused >= '1') {
        if (
          evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
          //console.log('entrando em pausafila')
          let qry = `insert into meso_pausa_fila (evento, privilege, fila, localizacao, membername, pausado, datahora) values('${evt.event}','${evt.privilege}','${evt.queue}','${evt.location}','${evt.membername}','${evt.paused}', now())`

          //console.log('1 dado gravado ou atualizado, pausafila')

          await executaQry(qry)


        }
      }

      else if (evt.paused === '0') {
        if (
          evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
          let qry = `update meso_pausa_fila set despausado = now() where despausado = ('00:00:00') and membername= '${evt.membername}'`
          console.log('chereco 1 dado gravado ou atualizado, despausado em pausafila')

          await executaQry(qry)
        }

      }
    })


    this.asteriskController.on('bridgecreate', async function (evt) {


      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {

        let qry = `insert into meso_operadores_em_ligacao(bridgestate, canal1, canal2, uniqueid1, uniqueid2, callerid1, callerid2) values ('${evt.bridgestate}','${evt.channel1}','${evt.channel2}','${evt.bridgeuniqueid}','${evt.linkedid}','${evt.callerid1}','${evt.callerid2}');`

        //console.log('1 dado gravado ou atualizado, bridge')

        await executaQry(qry)


      }
    });


    this.asteriskController.on('agentlogin', async function (evt) {

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        let qry = `insert into meso_agentelogin(privilege, agent, canal, uniqueid) values ('${evt.privilege}','${evt.agent}','${evt.channel}','${evt.uniqueid}');`

        //console.log('1 dado gravado ou atualizado, agentelogin')

        await executaQry(qry)
      }

    });


    this.asteriskController.on('agentlogoff', async function (evt) {

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        let qry = `insert into meso_agentelogoff(privilege, agent, tempologin, uniqueid) values ('${evt.privilege}','${evt.agent}','${evt.longtime}','${evt.uniqueid}');`

        //console.log('1 dado gravado ou atualizado, agentelogoff')

        await executaQry(qry)
      }

    });


    this.asteriskController.on('agentcalled', async function (evt) {

      //console.log('churrasquei ou churrascou', evt)

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        let qry = `insert into meso_agent_called(evento, privilege, fila, agentcalled, agentname, channelcalling, destinationchannel, calleridnum, calleridname, connectedlinenum, connectedlinename, context, extension, prioridade, uniqueid) values ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.agentcalled}','${evt.agentname}','${evt.channelcalling}','${evt.destinationchannel}','${evt.calleridnum}','${evt.calleridname}','${evt.destcalleridnum}','${evt.destcalleridname}','${evt.context}','${evt.extension}','${evt.priority}','${evt.uniqueid}');`

        //console.log('1 dado gravado ou atualizado, agentcalled')

        await executaQry(qry)


        //console.log('entrando em meso_ligacoes');
        qry = `insert into meso_ligacoes(fila, uniqueid, channelcalling, calleridnum, calleridname) values ('${evt.queue}','${evt.uniqueid}','${evt.channelcalling}','${evt.calleridnum}','${evt.calleridname}');`

        //console.log('1 dado gravado ou atualizado, meso_ligacoes')

        await executaQry(qry)

      }
    });


    this.asteriskController.on('agentconnect', async function (evt) {

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {
        //console.log('um dado')
        let qry = `delete from meso_agent_called_rt where uniqueid = ('${evt.uniqueid}')`

        //console.log('1 dado gravado removido, agentcalled realtime')

        await executaQry(qry)

        //console.log('Entrando em MESO_OPERADORES_RT')
        qry = `UPDATE users set estado = 'em ligacao', totaliga = totaliga+ 1 where extension = ${evt.calleridnum} or extension = ${evt.connectedlinenum}`

        //console.log('1 dado gravado ou atualizado, Bridge')

        await executaQry2(qry)
      
    }




      //console.log('um dado inserido em meso_call_connected_RT')
      let qry = `insert into meso_call_connected_rt(evento, privilege, fila, uniqueid, canal, member, menbronome, tempoespera, bridgedchannel, ringtime) values ('${evt.event}','${evt.privilege}','${evt.queue}','${evt.uniqueid}','${evt.channel}','${evt.member}','${evt.membername}','${evt.holdtime}','${evt.bridgedchannel}','${evt.ringtime}');`

      //console.log('1 dado gravado removido, agentcalled realtime')
      //console.log(qry)
      await executaQry(qry)


    });


    this.asteriskController.on('blindtransfer', async function (evt) {

      if (
        evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {


        //console.log('entrando no banco TRANSFERENCIA DIRETA!!')
        let qry = `insert into meso_blindtransfer(evento, privilege, result, transfererchannel, transfererchannelstate, transferercalleridnum, transferercalleridname, transfererconnectedlinenum, transfererconnectedlinename, transfererlanguage, transfereraccountcode, transferercontext, transfererexten, transfererpriority, transfereruniqueid, transfererlinkedid, transfereechannel, transfereechannelstate, transfereechannelstatedesc, transfereecalleridnum, transfereecalleridname, transfereeconnectedlinenum, transfereeconnectedlinename, transfereelanguage, transfereeaccountcode, transfereecontext, transfereeexten, transfereepriority, transfereeuniqueid, transfereelinkedid, bridgeuniqueid, bridgetype, bridgetechnology, bridgecreator, bridgename, bridgenumchannels, bridgevideosourcemode, isexternal, context, extension)VALUES('${evt.event}', '${evt.privilege}', 'Transeferid','${evt.transfererchannel}', '${evt.transfererchannelstate}', '${evt.transferercalleridnum}', '${evt.transferercalleridname}', '${evt.transfererconnectedlinenum}', '${evt.transfererconnectedlinename}', '${evt.transfererlanguage}', '${evt.transfereraccountcode}', '${evt.transferercontext}', '${evt.transfererexten}', '${evt.transfererpriority}', '${evt.transfereruniqueid}', '${evt.transfererlinkedid}', '${evt.transfereechannel}', '${evt.transfereechannelstate}', '${evt.transfereechannelstatedesc}', '${evt.transfereecalleridnum}', '${evt.transfereecalleridname}', '${evt.transfereeconnectedlinenum}', '${evt.transfereeconnectedlinename}', '${evt.transfereelanguage}', '${evt.transfereeaccountcode}','${evt.transfereecontext}', '${evt.transfereeexten}', '${evt.transfereepriority}', '${evt.transfereeuniqueid}', '${evt.transfereelinkedid}', '${evt.bridgeuniqueid}', '${evt.bridgetype}', '${evt.bridgetechnology}', '${evt.bridgecreator}', '${evt.bridgename}', '${evt.bridgenumchannels}', '${evt.bridgevideosourcemode}', '${evt.isexternal}', '${evt.context}', '${evt.extension}')`

        //console.log('1 dado gravado de TRANSFERENCIA COM DIRETA')

        await executaQry(qry)
      }
    });


this.asteriskController.on('attendedtransfer', async function (evt) {

  if (
    evt.event != "rtcpsent" && evt.event != "rtcpreceived" && evt.event != "varset") {


    //console.log('entrando no banco TRANSFERENCIA COM CONSULTA')
    let qry = `insert into meso_transf_consult(evento, privilege, result, transfererchannel, transfererchannelstate, transferercalleridnum, transferercalleridname, transfererconnectedlinenum, transfererconnectedlinename, transfererlanguage, transfereraccountcode, transferercontext, transfererexten, transfererpriority, transfereruniqueid, transfererlinkedid, transfereechannel, transfereechannelstate, transfereechannelstatedesc, transfereecalleridnum, transfereecalleridname, transfereeconnectedlinenum, transfereeconnectedlinename, transfereelanguage, transfereeaccountcode, transfereecontext, transfereeexten, transfereepriority, transfereeuniqueid, transfereelinkedid, bridgeuniqueid, bridgetype, bridgetechnology, bridgecreator, bridgename, bridgenumchannels, bridgevideosourcemode, isexternal, context, extension)VALUES('${evt.event}', '${evt.privilege}', '${evt.result}','${evt.transfererchannel}', '${evt.transfererchannelstate}', '${evt.transferercalleridnum}', '${evt.transferercalleridname}', '${evt.transfererconnectedlinenum}', '${evt.transfererconnectedlinename}', '${evt.transfererlanguage}', '${evt.transfereraccountcode}', '${evt.transferercontext}', '${evt.transfererexten}', '${evt.transfererpriority}', '${evt.transfereruniqueid}', '${evt.transfererlinkedid}', '${evt.transfereechannel}', '${evt.transfereechannelstate}', '${evt.transfereechannelstatedesc}', '${evt.transfereecalleridnum}', '${evt.transfereecalleridname}', '${evt.transfereeconnectedlinenum}', '${evt.transfereeconnectedlinename}', '${evt.transfereelanguage}', '${evt.transfereeaccountcode}','${evt.transfereecontext}', '${evt.transfereeexten}', '${evt.transfereepriority}', '${evt.transfereeuniqueid}', '${evt.transfereelinkedid}', '${evt.origbridgeuniqueid}', '${evt.bridgetype}', '${evt.bridgetechnology}', '${evt.bridgecreator}', '${evt.bridgename}', '${evt.bridgenumchannels}', '${evt.bridgevideosourcemode}', '${evt.isexternal}', 'transferido com consulta', '${evt.extension}')`

    //console.log('1 dado gravado de TRANSFERENCIA COM CONSULTA')

    await executaQry(qry)
  }

});

this.socketWrapper.on('connection', (socket) => {

  //console.log('New client connected:', socket.id);

  socket.on('message', (data) => {
    //console.log('Message received:', data);
  });

  socket.on('asteriskAction', (actionData) => {
    //console.log('Asterisk action requested:', actionData);
    this.asteriskController.performAsteriskAction(actionData);
  });



  this.socketWrapper.emitToClient(socket.id, 'welcome', { message: 'Welcome to the server!' });
});



setInterval(() => {
  this.socketWrapper.broadcast('serverMessage', { message: 'Hello to all clients!' });
}, 5000);
  }

  async printAgora(msg) {
  //console.log(msg)
  return msg
}

emitToClients(event, data) {
  this.socketWrapper.broadcast(event, data);
}
}

module.exports = SocketController;

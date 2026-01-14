const { handleEvent } = require('../eventHandler');

module.exports = (ami) => {

    ami.on('queuememberadded', (evt) =>
        handleEvent(evt, (e) => `
      INSERT INTO meso_login_fila(
        evento, privilege, fila, localizacao, membername, stateinterface,
        membership, penalty, callstaken, lastcall, estado, pausado
      ) VALUES (
        '${e.event}', '${e.privilege}', '${e.queue}', '${e.location}',
        '${e.membername}', '${e.stateinterface}', '${e.membership}',
        '${e.penalty}', '${e.callstaken}', '${e.lastcall}', '${e.status}', '${e.paused}'
      );
    `)
    )
    ami.on('queuememberremoved', (evt) =>
        handleEvent(evt, (e) => `
      UPDATE meso_login_fila
      SET desloga = NOW()
      WHERE desloga = '0000-00-00 00:00:00'
      AND membername = '${e.membername}';
    `)
    );

    ami.on('queuecallerjoin', (evt) =>
        handleEvent(evt, (e) => `
      INSERT INTO meso_entrar(
        evento, privilege, channel, calleridnum, calleridname,
        connectedlinenum, connectedlinename, fila, position, conta, uniqueid
      ) VALUES (
        '${e.event}', '${e.privilege}', '${e.channel}', '${e.calleridnum}', '${e.calleridname}',
        '${e.connectedlinenum}', '${e.connectedlinename}', '${e.queue}', '${e.position}', '${e.count}', '${e.uniqueid}'
      );
    `)
    );

    ami.on('queuecallerabandon', (evt) =>
        handleEvent(evt, (e) => `
      UPDATE meso_detalhe
      SET estado = 'abandonado'
      WHERE uniqueid = '${e.uniqueid}';
    `)
    );
    console.log('✅ Handlers de FILAS registrados com sucesso');

}
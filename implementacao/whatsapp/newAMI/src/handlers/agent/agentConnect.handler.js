const MesoRepository = require('../../repositories/meso.repository');

module.exports = async function agentConnectHandler(evt) {
    const {
        uniqueid,
        membername,
        connectedlinenum
    } = evt;

    // defesa mínima
    if (!uniqueid) {
        console.warn('⚠️ agentconnect ignorado (sem uniqueid)', evt);
        return;
    }

    // prioridade:
    // - membername (Agent/1000, PJSIP/2000, etc)
    // - fallback: connectedlinenum
    const teleatendente =
        membername ||
        connectedlinenum ||
        null;

    if (!teleatendente) {
        console.warn('⚠️ agentconnect sem teleatendente identificável', {
            uniqueid,
            evt
        });
        return;
    }

    await MesoRepository.marcarAtendida({
        uniqueid,
        teleatendente
    });

    console.log('☎️ Chamada atendida', {
        uniqueid,
        teleatendente
    });
};

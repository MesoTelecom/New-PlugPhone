const MesoRepository = require('../../repositories/meso.repository');

module.exports = async function agentCompleteHandler(evt) {
    const {
        uniqueid,
        talktime,
        holdtime,
        reason
    } = evt;

    if (!uniqueid) {
        console.warn('⚠️ agentcomplete ignorado (sem uniqueid)', evt);
        return;
    }

    await MesoRepository.finalizarAtendimento({
        uniqueid,
        duracao: Number(talktime) || 0,
        holdtime: Number(holdtime) || 0,
        reason: reason || null
    });

    console.log('🛑 Chamada finalizada', {
        uniqueid,
        duracao: talktime,
        holdtime,
        reason
    });
};

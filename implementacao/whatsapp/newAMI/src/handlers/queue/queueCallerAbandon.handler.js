const MesoRepository = require('../../repositories/meso.repository');

module.exports = async function queueCallerAbandonHandler(evt) {
    const {
        uniqueid,
        holdtime
    } = evt;

    if (!uniqueid) {
        console.warn('⚠️ queuecallerabandon ignorado (sem uniqueid)', evt);
        return;
    }

    await MesoRepository.marcarAbandono({
        uniqueid,
        holdtime: Number(holdtime) || 0
    });

    console.log('🚪 Chamada abandonada', {
        uniqueid,
        holdtime
    });
};

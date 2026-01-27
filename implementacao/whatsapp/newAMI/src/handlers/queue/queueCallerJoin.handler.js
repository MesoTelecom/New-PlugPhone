const MesoRepository = require('../../repositories/meso.repository');

module.exports = async function queueCallerJoinHandler(evt) {
    const {
        uniqueid,
        calleridnum,
        channel,
        queue
    } = evt;

    // defesa básica
    if (!uniqueid || !calleridnum || !queue) {
        console.warn('⚠️ queuecallerjoin ignorado (dados incompletos)', {
            uniqueid,
            calleridnum,
            queue
        });
        return;
    }

    await MesoRepository.criarEntradaFila({
        uniqueid,
        solicitante: calleridnum,
        tronco: channel,
        fila: queue
    });

    console.log('📥 Chamada entrou na fila', {
        uniqueid,
        fila: queue,
        solicitante: calleridnum
    });
};

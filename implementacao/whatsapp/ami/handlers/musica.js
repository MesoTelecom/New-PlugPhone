// Importa handler genérico que filtra eventos e executa SQL
const { handleEvent } = require('../eventHandler');

/**
 * Eventos relacionados à Música de Espera (Music On Hold)
 * - Quando a chamada entra em espera
 * - Quando volta do hold e atende
 */
module.exports = (ami) => {

  // ============================================================
  // EVENTO: musiconholdstart
  // Quando o cliente vai para musica de espera (hold)
  // ============================================================
  ami.on('musicstart', evt =>
    handleEvent(evt, (e) => `
      UPDATE meso_detalhe
      SET 
        holdtime_inicio = NOW()
      WHERE uniqueid = '${e.uniqueid}';
    `)
  );

  // ============================================================
  // EVENTO: musiconholdstop
  // Quando o cliente volta da música de espera (agente atendeu)
  // ============================================================
  ami.on('musicstop', evt =>
    handleEvent(evt, (e) => `
      UPDATE meso_detalhe
      SET 
        holdtime_fim = NOW(),
        holdtime = TIMESTAMPDIFF(SECOND, holdtime_inicio, NOW())
      WHERE uniqueid = '${e.uniqueid}';
    `)
  );

  console.log('✅ Handlers de MÚSICA registrados com sucesso');
};

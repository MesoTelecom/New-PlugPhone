// Importa o processador genérico de eventos AMI
const { handleEvent } = require('../eventHandler');

/**
 * Eventos relacionados aos agentes (operadores) do call center
 * - login
 * - logoff
 * - chamada atribuída ao agente
 * - agente atende
 * - agente finaliza atendimento
 */
module.exports = (ami) => {

  // ============================================================
  // Quando o agente loga no sistema de filas
  // ============================================================
  ami.on('agentlogin', evt =>
    handleEvent(evt, (e) => `
      INSERT INTO meso_log_agente (evento, agente, datahora, fila)
      VALUES ('${e.event}', '${e.agent}', NOW(), '${e.queue || ''}');
    `)
  );

  // ============================================================
  // Quando o agente desloga do sistema
  // ============================================================
  ami.on('agentlogoff', evt =>
    handleEvent(evt, (e) => `
      INSERT INTO meso_log_agente (evento, agente, datahora, fila)
      VALUES ('${e.event}', '${e.agent}', NOW(), '${e.queue || ''}');
    `)
  );

  // ============================================================
  // Quando o Asterisk tenta enviar uma chamada para o agente
  // ============================================================
  ami.on('agentcalled', evt =>
    handleEvent(evt, (e) => `
      UPDATE meso_detalhe
      SET teleatendente = '${e.interface || ''}',
          fila = '${e.queue || ''}'
      WHERE uniqueid = '${e.uniqueid}';
    `)
  );

  // ============================================================
  // Quando o agente ATENDE a ligação
  // ============================================================
  ami.on('agentconnect', evt =>
    handleEvent(evt, (e) => `
      UPDATE meso_detalhe
      SET teleatendente = '${e.interface || ''}',
          fila = '${e.queue || ''}',
          estado = 'em atendimento'
      WHERE uniqueid = '${e.uniqueid}';
    `)
  );

  // ============================================================
  // Quando o agente FINALIZA o atendimento
  // Aqui consolidamos tudo em UMA query só (como combinamos!)
  // ============================================================
  ami.on('agentcomplete', evt =>
    handleEvent(evt, (e) => `
      UPDATE meso_detalhe
      SET 
        fila = '${e.queue || ''}',
        teleatendente = '${e.interface || ''}',
        duracao = '${e.talktime || 0}',
        holdtime = '${e.holdtime || 0}',
        tronco = '${e.channel || ''}',
        reason = '${e.reason || ''}',
        estado = 'atendida'
      WHERE uniqueid = '${e.destuniqueid}';
    `)
  );

  console.log('✅ Handlers de AGENTES registrados com sucesso');
};

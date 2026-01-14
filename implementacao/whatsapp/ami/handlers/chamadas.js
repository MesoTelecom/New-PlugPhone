// Importa a função genérica que trata eventos e executa as queries no MySQL
const { handleEvent } = require('../eventHandler');

// Exporta uma função que recebe a conexão AMI (Asterisk Manager Interface)
// Assim, cada arquivo de handler registra só seus eventos
module.exports = (ami) => {

  // ==========================
  // EVENTO: dialbegin
  // Quando o Asterisk começa a discar para um número
  // (início do processo de chamada)
  // ==========================
  ami.on('dialbegin', (evt) =>
    handleEvent(evt, (e) => `
      INSERT INTO meso_detalhe_sainte(
        datahora, uniqueid, solicitante, tronco
      )
      VALUES (
        NOW(),                  -- timestamp atual
        '${e.uniqueid}',        -- ID único da chamada
        '${e.calleridnum}',     -- quem está ligando
        '${e.channel}'          -- canal/ramal origem (ex: SIP/101)
      );
    `)
  );

  // ==========================
  // EVENTO: dialend
  // Quando termina a tentativa de discagem (pode ter atendido ou não)
  // ==========================
  ami.on('dialend', (evt) =>
    handleEvent(evt, (e) => `
      UPDATE meso_detalhe_sainte
      SET 
        estado = '${e.dialstatus === 'ANSWER' ? 'atendida' : 'abandonada'}', -- resultado da chamada
        terminoligacao = NOW()  -- horário de fim da chamada
      WHERE uniqueid = '${e.destuniqueid}';  -- usa o ID do destino
    `)
  );

  // ==========================
  // EVENTO: bridgeenter
  // Quando o cliente e o agente realmente são conectados
  // (ou seja, ATENDIMENTO começou de verdade)
  // ==========================
  ami.on('bridgeenter', (evt) =>
    handleEvent(evt, (e) => `
      UPDATE meso_detalhe_sainte
      SET inicioligacao = NOW()  -- momento do começo da conversa
      WHERE uniqueid = '${e.uniqueid}';
    `)
  );

  // ==========================
  // EVENTO: bridgeleave
  // Quando a ligação entre operador e cliente é encerrada
  // ==========================
  ami.on('bridgeleave', (evt) =>
    handleEvent(evt, (e) => `
      UPDATE meso_detalhe_sainte
      SET terminoligacao = NOW()  -- horário do fim da ligação
      WHERE uniqueid = '${e.uniqueid}';
    `)
  );

  // ==========================
  // EVENTO: hangup
  // Quando o canal desliga
  // Pegamos motivo e causa (ex: busy, canceled, no answer...)
  // ==========================
  ami.on('hangup', (evt) =>
    handleEvent(evt, (e) => `
      INSERT INTO meso_desliga(
        evento, privilege, channel, uniqueid, calleridnum, causa, causatxt
      )
      VALUES (
        '${e.event || ''}',         -- nome do evento
        '${e.privilege || ''}',     -- prioridade/contexto do AMI
        '${e.channel || ''}',       -- canal envolvido
        '${e.uniqueid || ''}',      -- id da chamada
        '${e.calleridnum || ''}',   -- quem desligou
        '${e.cause || ''}',         -- código do motivo de desligamento
        '${e.causetxt || ''}'       -- texto do motivo (humano)
      );
    `)
  );

  // Log para saber que carregou certinho
  console.log('✅ Handlers de CHAMADAS registrados com sucesso');
};

const db = require('../database/mysql');

async function criarEntradaFila({ uniqueid, solicitante, tronco, fila }) {
    return db.query(`
    INSERT INTO meso_detalhe
      (uniqueid, solicitante, tronco, fila, estado)
    VALUES
      (?, ?, ?, ?, 'aguardando')
  `, [uniqueid, solicitante, tronco, fila]);
}

async function marcarAtendida({ uniqueid, teleatendente }) {
    return db.query(`
    UPDATE meso_detalhe
    SET
      teleatendente = ?,
      estado = 'atendida'
    WHERE uniqueid = ?
  `, [teleatendente, uniqueid]);
}

async function finalizarAtendimento({ uniqueid, duracao, holdtime, reason }) {
    return db.query(`
    UPDATE meso_detalhe
    SET
      duracao = ?,
      holdtime = ?,
      reason = ?
    WHERE uniqueid = ?
  `, [duracao, holdtime, reason, uniqueid]);
}

async function marcarAbandono({ uniqueid, holdtime }) {
    return db.query(`
    UPDATE meso_detalhe
    SET
      estado = 'abandonado',
      holdtime = ?
    WHERE uniqueid = ?
  `, [holdtime, uniqueid]);
}

module.exports = {
    criarEntradaFila,
    marcarAtendida,
    finalizarAtendimento,
    marcarAbandono
};

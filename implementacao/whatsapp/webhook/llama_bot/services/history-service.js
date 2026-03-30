const { executaQry } = require('/meso/whatsapp/webhook/db');

async function salvarMensagem(sessionId, content, role) {
  const qry = `
    INSERT INTO meso_chat_history (session_id, content, role)
    VALUES ('${sessionId}', '${content}', '${role}')
  `;
  return executaQry(qry);
}

async function buscarHistorico(sessionId, limite = 10) {
  const qry = `
    SELECT role, content
    FROM meso_chat_history
    WHERE session_id = '${sessionId}'
    ORDER BY id ASC
    LIMIT ${limite}
  `;
  const result = await executaQry(qry, [sessionId, limite]);
  return result?.dados || [];
}

module.exports = {
  salvarMensagem,
  buscarHistorico
};

// ===============================
// Conexão com o Asterisk AMI
// ===============================
const AsteriskManager = require('asterisk-manager');

// Conecta no AMI
// (porta, host, usuario, senha, eventos padrões habilitados)
const ami = new AsteriskManager(
  5038,              // porta do AMI
  '127.0.0.1',       // IP do Asterisk
  'admin',           // usuário AMI
  'Mtes0206',        // senha AMI
  true               // escutar todos os eventos
);

// Mantém conexão viva mesmo se cair
ami.keepConnected();

// Log inicial
console.log("☎️  Conectando ao Asterisk AMI...");
ami.on('ready', () => console.log("✅ AMI conectado e escutando eventos!"));
ami.on('error', err => console.error("❌ Erro no AMI:", err));

// ===============================
// Importa handlers modularizados
// ===============================

// ordem organizada por lógica de callcenter
require('./handlers/filas')(ami);
require('./handlers/agentes')(ami);
require('./handlers/chamadas')(ami);
require('./handlers/musica')(ami);
require('./handlers/transferencia')(ami);

// Se quiser, depois aqui entra o CDR handler
// require('./handlers/cdr')(ami);

// ===============================
// Exporta AMI caso outro módulo queira usar
// ===============================
module.exports = { ami };

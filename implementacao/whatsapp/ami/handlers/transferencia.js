const { handleEvent } = require('../eventHandler');

module.exports = (ami) => {

  // ============================================================
  // BLIND TRANSFER
  // ============================================================
  ami.on('blindtransfer', evt =>
    handleEvent(evt, (e) => `
      -- registra transferência
      INSERT INTO meso_transferencias (
        tipo, uniqueid_origem, callerid_origem,
        ramal_transferiu, ramal_destino, motivo, datahora
      ) VALUES (
        'blind',
        '${e.uniqueid || ''}',
        '${e.calleridnum || ''}',
        '${e.transferrer || ''}',
        '${e.exten || ''}',
        '${e.reason || ''}',
        NOW()
      );

      -- marca chamada como transferida
      UPDATE meso_detalhe
      SET estado = 'transferida'
      WHERE uniqueid = '${e.uniqueid}';
    `)
  );

  // ============================================================
  // ATTENDED TRANSFER
  // ============================================================
  ami.on('attendedtransfer', evt =>
    handleEvent(evt, (e) => `
      -- registra transferência com consulta
      INSERT INTO meso_transferencias (
        tipo, uniqueid_origem, callerid_origem, 
        ramal_transferiu, ramal_destino, uniqueid_destino, 
        resultado, motivo, datahora
      ) VALUES (
        'attended',
        '${e.transfereruniqueid || e.uniqueid || ''}',
        '${e.transferercalleridnum || ''}',
        '${e.transferrer || ''}',
        '${e.transfereeexten || ''}',
        '${e.transfereeuniqueid || ''}',
        '${e.result || ''}',
        '${e.reason || ''}',
        NOW()
      );

      UPDATE meso_detalhe
      SET estado = 'transferida'
      WHERE uniqueid = '${e.transfereruniqueid || e.uniqueid}';
    `)
  );

  console.log('✅ Handler de TRANSFERÊNCIAS com flag transferida ativo');
};

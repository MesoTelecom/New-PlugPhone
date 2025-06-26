
    let ami = new require('asterisk-manager')('5038', 'localhost', 'admin', 'M3s0t3l3c0m', true);

    ami.keepConnected();
    let dataAtual = new Date();
    let data = dataAtual.getHours().toString().padStart(2, '0')
    let cont = 0




    console.log(data)

    let { executaQry } = require('./db')


    ami.on('queuecallerjoin', async function (evt) {
        uniqueid = evt.uniqueid
        if (
            evt.event != "RTCPSent" && evt.event != "RTCPReceived" && evt.event != "VarSet") {
            


                if (data === '00') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '00:00'`
                    await executaQry(qry)
                }
                else if (data == '01') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '01:00'`

                    await executaQry(qry)

                    console.log('teste 01h')
                }
                else if (data == '02') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '02:00'`

                    await executaQry(qry)

                    console.log('teste 02h')
                }
                else if (data == '03') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '03:00'`

                    await executaQry(qry)

                    console.log('teste 03h')
                }
                else if (data == '04') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '04:00'`

                    await executaQry(qry)

                    console.log('teste 4h')
                }
                else if (data == '05') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '05:00'`

                    await executaQry(qry)

                    console.log('teste 5h')
                }
                else if (data == '06') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '06:00'`

                    await executaQry(qry)

                    console.log('teste 6h')
                }
                else if (data == '07') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '07:00'`

                    await executaQry(qry)

                    console.log('teste 7h')
                }
                else if (data == '08') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '08:00'`

                    await executaQry(qry)

                    console.log('teste 8h')
                }
                else if (data == '09') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '09:00'`

                    await executaQry(qry)

                    console.log('teste 9h')
                }
                else if (data == '10') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '10:00'`

                    await executaQry(qry)

                    console.log('teste 10h')
                }
                else if (data == '11') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '11:00'`

                    await executaQry(qry)

                    console.log('teste 11h')
                }
                else if (data == '12') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '12:00'`

                    await executaQry(qry)

                    console.log('teste 12h')
                }
                else if (data == '13') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '13:00'`

                    await executaQry(qry)

                    console.log('teste 13h')
                }
                else if (data == '14') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '14:00'`

                    await executaQry(qry)

                    console.log('teste 14h')
                }
                else if (data == '15') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '15:00'`

                    await executaQry(qry)

                    console.log('teste 15h')
                }
                else if (data == '16') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '16:00'`
                    console.log(qry)
                    await executaQry(qry)

                    console.log('teste 16h')
                }
                else if (data == '17') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '17:00'`

                    await executaQry(qry)

                    console.log('teste 17h')
                }
                else if (data == '18') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '18:00'`

                    await executaQry(qry)

                    console.log('teste 18h')
                }
                else if (data == '19') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '19:00'`

                    await executaQry(qry)

                    console.log('teste 19h')
                }
                else if (data == '20') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '20:00'`

                    await executaQry(qry)

                    console.log('teste 20h')
                }
                else if (data == '21') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '21:00'`

                    await executaQry(qry)

                    console.log('teste 21h')
                }
                else if (data == '22') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '22:00'`

                    await executaQry(qry)

                    console.log('teste 22h')
                }
                else if (data == '23') {
                    cont++
                    let qry = `UPDATE meso_fluxo_ligacao set total = ${cont}, datahora = now() where hora = '23:00'`

                    await executaQry(qry)

                    console.log('teste 23h')
                    
                }
                
            
        }



    });



const { executaQry } = require('../db/db')

const ignorarEvento = ["rtcpsent", "rtcpreceived", "varset"]

async function handleEvent(evt, queryBuilder) {
    if (!evt || ignorarEvento.includes(evt.event)) return

    try {
        const qry = queryBuilder(evt);
        if (!qry) return;

        console.log([evt.event], qry);

        await executaQry(qry)
    } catch (err) {
        console.log(`Erro no evento ${evt.event}:`, err, message);
    }
}

module.exports = { handleEvent }

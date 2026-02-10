const queueCallerJoinHandler = require('../handlers/queue/queueCallerJoin.handler');
const queueCallerAbandonHandler = require('../handlers/queue/queueCallerAbandon.handler');
const agentConnectHandler = require('../handlers/agent/agentConnect.handler');
const agentCompleteHandler = require('../handlers/agent/agentComplete.handler');

function isValidEvent(evt) {
    return !['rtcpsent', 'rtcpreceived', 'varset'].includes(evt.event);
}

module.exports = function registerEvents(ami) {

    ami.on('queuecallerjoin', async (evt) => {
        if (!isValidEvent(evt)) return;
        try {
            await queueCallerJoinHandler(evt);
        } catch (err) {
            console.error('❌ queuecallerjoin:', err);
        }
    });

    ami.on('agentconnect', async (evt) => {
        if (!isValidEvent(evt)) return;
        try {
            await agentConnectHandler(evt);
        } catch (err) {
            console.error('❌ agentconnect:', err);
        }
    });

    ami.on('agentcomplete', async (evt) => {
        if (!isValidEvent(evt)) return;
        try {
            await agentCompleteHandler(evt);
        } catch (err) {
            console.error('❌ agentcomplete:', err);
        }
    });

    ami.on('queuecallerabandon', async (evt) => {
        if (!isValidEvent(evt)) return;
        try {
            await queueCallerAbandonHandler(evt);
        } catch (err) {
            console.error('❌ queuecallerabandon:', err);
        }
    });

};

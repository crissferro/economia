const { consultarIA } = require('../ia/iaService');
const { formatearRespuestaIA } = require('../ia/responderIA');

async function responder(bot, msg) {
    try {
        const prompt = msg.text;
        const respuestaIA = await consultarIA(prompt);
        const respuesta = formatearRespuestaIA(respuestaIA);
        await bot.sendMessage(msg.chat.id, respuesta);
    } catch (error) {
        console.error('Error al responder con IA:', error);
        bot.sendMessage(msg.chat.id, 'Lo siento, tuve un problema para responderte.');
    }
}

module.exports = { responder };

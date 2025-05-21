const comandos = require('../handlers/comandos');
const conversacion = require('./conversacion');
const manejadorIA = require('./manejadorIA');

function handleMessage(bot, msg) {
    const text = msg.text?.toLowerCase() || '';

    if (text.startsWith('/')) {
        return comandos.procesar(bot, msg);
    }
    // Ejemplo muy básico para continuar con conversación
    if (conversacion.esPasoConversacion(msg)) {
        return conversacion.continuar(bot, msg);
    }

    // Si no es comando ni paso clásico, responde con IA
    return manejadorIA.responder(bot, msg);
}

function handleCallback(bot, callbackQuery) {
    return require('../handlers/callbackHandler').handle(bot, callbackQuery);
}

module.exports = { handleMessage, handleCallback };

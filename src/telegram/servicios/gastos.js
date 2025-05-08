const { obtenerGastosNoPagados } = require('../../src/db/gastos');
const { mostrarMenu } = require('./notificaciones');
const { iniciarFlujoConversacional } = require('../handlers/conversacion');

async function procesarFrase(bot, chatId, texto) {
    const gastos = await obtenerGastosNoPagados(chatId);

    const gastoCoincidente = gastos.find(gasto => texto.includes(gasto.descripcion.toLowerCase()));

    if (gastoCoincidente) {
        require('./pago').marcarComoPagado(bot, chatId, gastoCoincidente.id);
    } else {
        bot.sendMessage(chatId, 'No encontré un gasto que coincida con tu mensaje.');
    }
}

function iniciarConversacion(bot, chatId) {
    iniciarFlujoConversacional(bot, chatId);
}

module.exports = {
    procesarFrase,
    iniciarConversacion
};

const { actualizarEstadoGasto } = require('../../src/db/gastos');

async function marcarComoPagado(bot, chatId, gastoId) {
    await actualizarEstadoGasto(gastoId, true);
    bot.sendMessage(chatId, '✅ Gasto marcado como pagado.');
}

module.exports = { marcarComoPagado };

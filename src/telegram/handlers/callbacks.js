// src/telegram/handlers/callbacks.js
const {
    mostrarGastosProximos,
    mostrarGastosNoPagados,
    mostrarGastosPagados,
    mostrarGastosVencidos,
    marcarComoPagado,
} = require('../utils/accionesGastos');

module.exports = (bot) => {
    bot.on('callback_query', async (query) => {
        const data = query.data;
        const chatId = query.message.chat.id;

        if (data.startsWith('pagar_')) {
            const id = data.split('_')[1];
            await marcarComoPagado(chatId, id, bot);
        } else {
            switch (data) {
                case 'proximos':
                    await mostrarGastosProximos(chatId, bot);
                    break;
                case 'impagos':
                    await mostrarGastosNoPagados(chatId, bot);
                    break;
                case 'vencidos':
                    await mostrarGastosVencidos(chatId, bot);
                    break;
                case 'pagados':
                    await mostrarGastosPagados(chatId, bot);
                    break;
            }
        }

        bot.answerCallbackQuery(query.id);
    });
};

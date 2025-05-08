const { obtenerGastosDelDia } = require('../../src/db/gastos');

async function enviarNotificacion(bot, chatId) {
    const gastos = await obtenerGastosDelDia(chatId);

    if (gastos.length === 0) return;

    const mensaje = gastos.map(g =>
        `💸 *${g.descripcion}*\n💰 $${g.monto}\n📅 Vence: ${g.vencimiento}`
    ).join('\n\n');

    bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' });
}

function mostrarMenu(bot, chatId) {
    bot.sendMessage(chatId, '¿Qué querés hacer?', {
        reply_markup: {
            keyboard: [['Nuevo gasto'], ['Ver vencimientos']],
            resize_keyboard: true,
            one_time_keyboard: true
        }
    });
}

module.exports = { enviarNotificacion, mostrarMenu };

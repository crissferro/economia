const { manejarConversacion } = require('./conversacion');
const { mostrarMenu } = require('../servicios/notificaciones');
const { frasesGastosNoPagados, frasesPagosRealizados, frasesGastosProximos, frasesGastosVencidos } = require('../utils/frasesReconocidas');
const { formatearMensajePago, mensajeGastoNoEncontrado, mensajeErrorGeneral } = require('../utils/mensajesTelegram');
const { conn } = require('../../db/dbconnection');
const { mostrarGastosProximos, mostrarGastosNoPagados, mostrarGastosPagados, mostrarGastosVencidos } = require('../servicios/gastos');

module.exports = async function(bot, message) {
    const chatId = message.chat.id;
    const texto = (message.text || '').toLowerCase();

    if (await manejarConversacion(bot, message)) return;

    if (texto.startsWith('pagado')) {
        const match = texto.match(/^pagado\s+(\d+)$/);
        if (!match) return;

        const gastoId = parseInt(match[1], 10);
        const fechaISO = new Date().toISOString().split('T')[0];

        try {
            const [[gasto]] = await conn.query(`
                SELECT g.*, c.nombre AS concepto
                FROM gastos g
                JOIN users u ON g.users_id = u.id
                JOIN conceptos c ON g.concepto_id = c.id
                WHERE g.id = ? AND u.chat_id = ?
            `, [gastoId, chatId]);

            if (!gasto) return bot.sendMessage(chatId, mensajeGastoNoEncontrado());

            await conn.query(`UPDATE gastos SET pagado = 1, fecha_pago = ? WHERE id = ?`, [fechaISO, gastoId]);
            await bot.sendMessage(chatId, formatearMensajePago(gasto), { parse_mode: 'Markdown' });
        } catch (err) {
            console.error("❌ Error:", err);
            await bot.sendMessage(chatId, mensajeErrorGeneral());
        }
    } else if (frasesGastosNoPagados.some(f => texto.includes(f))) {
        await mostrarGastosNoPagados(bot, chatId);
    } else if (frasesGastosProximos.some(f => texto.includes(f))) {
        await mostrarGastosProximos(bot, chatId);
    } else if (frasesPagosRealizados.some(f => texto.includes(f))) {
        await mostrarGastosPagados(bot, chatId);
    } else if (frasesGastosVencidos.some(f => texto.includes(f))) {
        await mostrarGastosVencidos(bot, chatId);
    } else if (texto.includes('agregar gasto')) {
        const { iniciarConversacion } = require('./conversacion');
        iniciarConversacion(chatId);
        await bot.sendMessage(chatId, '📝 ¿Cuál es el concepto del gasto?');
    } else {
        await mostrarMenu(bot, chatId);
    }
}

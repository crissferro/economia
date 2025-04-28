const TelegramBot = require('node-telegram-bot-api');
const { conn } = require('../db/dbconnection');

const token = '7290653879:AAEEBQIF_lbgzrYq45hqatOrh4EVQnz0G0M';

// ✅ Configuración con polling
const bot = new TelegramBot(token, { polling: true });

// Función para enviar mensajes
function enviarNotificacion(chatId, mensaje) {
    console.log(`🔔 Enviando mensaje a ${chatId}: ${mensaje}`);
    return bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' })
        .then(() => console.log('✅ Notificación enviada'))
        .catch(err => console.error('❌ Error al enviar mensaje:', err));
}

// Escuchamos mensajes de Telegram
bot.on('message', async (message) => {
    console.log('📨 Mensaje recibido:', message.text);
    if (!message.text) return;

    const chatId = message.chat.id;
    const texto = message.text.toLowerCase();
    const match = texto.match(/^pagado\s+(\d+)$/);

    if (!match) return;

    const gastoId = parseInt(match[1], 10);
    const hoy = new Date();
    const fechaISO = hoy.toISOString().split('T')[0];
    const fechaFormateada = hoy.toLocaleDateString('es-AR');

    try {
        const [[gasto]] = await conn.query(`
            SELECT * FROM gastos g
            JOIN users u ON g.users_id = u.id
            WHERE g.id = ? AND u.chat_id = ?
        `, [gastoId, chatId]);

        if (!gasto) {
            await enviarNotificacion(chatId, `❌ No encontré ese gasto o no te pertenece.`);
            return;
        }

        await conn.query(`
            UPDATE gastos SET pagado = 1, fecha_pago = ? WHERE id = ?
        `, [fechaISO, gastoId]);

        await enviarNotificacion(chatId, `✅ El gasto con ID ${gastoId} fue marcado como pagado el ${fechaFormateada}.`);
    } catch (err) {
        console.error("❌ Error al procesar mensaje:", err);
        await enviarNotificacion(chatId, `⚠️ Ocurrió un error al intentar registrar el pago.`);
    }
});

module.exports = {
    bot,
    enviarNotificacion,
};

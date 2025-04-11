const TelegramBot = require('node-telegram-bot-api');
const { conn } = require('../db/dbconnection');
const hoy = new Date();
const fechaISO = hoy.toISOString().split('T')[0]; // YYYY-MM-DD
const fechaFormateada = hoy.toLocaleDateString('es-AR'); // dd/mm/yyyy


const token = '7290653879:AAEEBQIF_lbgzrYq45hqatOrh4EVQnz0G0M';

const bot = new TelegramBot(token, { polling: false });

function enviarNotificacion(chatId, mensaje,) {
    console.log(`🔔 Enviando mensaje a ${chatId}: ${mensaje}`);
    bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' })
        .then(() => console.log('✅ Notificación enviada'))
        .catch(err => console.error('❌ Error al enviar mensaje:', err));
}

bot.on('message', async (msg) => {
    console.log("📩 Mensaje recibido:", msg);  // Asegurate de tener esto para debug
    const chatId = msg.chat.id;
    const texto = msg.text?.toLowerCase();

    const match = texto.match(/^pagado\s+(\d+)$/);
    if (!match) return;

    const gastoId = parseInt(match[1], 10);

    try {
        // Verificar que el gasto pertenece al usuario
        const [[gasto]] = await conn.query(`
            SELECT * FROM gastos g
            JOIN users u ON g.users_id = u.id
            WHERE g.id = ? AND u.chat_id = ?
        `, [gastoId, chatId]);

        if (!gasto) {
            bot.sendMessage(chatId, `❌ No encontré ese gasto o no te pertenece.`);
            return;
        }

        // Marcar como pagado
        await conn.query(`UPDATE gastos SET pagado = 1, fecha_pago = ? WHERE id = ?`, [fechaISO, gastoId]);
        bot.sendMessage(chatId, `✅ El gasto con ID ${gastoId} fue marcado como pagado el ${fechaFormateada}.`);
    } catch (err) {
        console.error("❌ Error al procesar mensaje:", err);
        bot.sendMessage(chatId, `⚠️ Ocurrió un error al intentar registrar el pago.`);
    }
});

module.exports = { enviarNotificacion };



const TelegramBot = require('node-telegram-bot-api');

const token = '7290653879:AAEEBQIF_lbgzrYq45hqatOrh4EVQnz0G0M';

const bot = new TelegramBot(token, { polling: true });

function enviarNotificacion(chatId, mensaje,) {
    console.log(`🔔 Enviando mensaje a ${chatId}: ${mensaje}`);
    bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' })
        .then(() => console.log('✅ Notificación enviada'))
        .catch(err => console.error('❌ Error al enviar mensaje:', err));
}
module.exports = { enviarNotificacion };

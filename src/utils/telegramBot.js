const TelegramBot = require('node-telegram-bot-api');
const { conn } = require('../db/dbconnection');

const token = '7290653879:AAEEBQIF_lbgzrYq45hqatOrh4EVQnz0G0M';

// Configuración SIN polling (modo webhook)
const bot = new TelegramBot(token);

function enviarNotificacion(chatId, mensaje) {
    console.log(`🔔 Enviando mensaje a ${chatId}: ${mensaje}`);
    return bot.sendMessage(chatId, mensaje, { parse_mode: 'Markdown' })
        .then(() => console.log('✅ Notificación enviada'))
        .catch(err => console.error('❌ Error al enviar mensaje:', err));
}

module.exports = {
    bot,
    enviarNotificacion,
};

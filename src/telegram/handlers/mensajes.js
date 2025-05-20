// src/telegram/handlers/mensajes.js
const { iniciarConversacionRegistro, continuarConversacion } = require('../utils/conversacionGasto');

module.exports = (bot) => {
    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const texto = msg.text;

        if (!texto) return;

        const enConversacion = await continuarConversacion(bot, msg);
        if (!enConversacion) {
            iniciarConversacionRegistro(bot, msg);
        }
    });
};
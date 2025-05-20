// src/telegram/handlers/comandos.js
const {
    mostrarMenuPrincipal,
    mostrarEstadisticasTexto,
} = require('../utils/accionesTelegram');

module.exports = (bot) => {
    bot.onText(/^\/start$/, async (msg) => {
        await mostrarMenuPrincipal(msg.chat.id, bot);
    });

    bot.onText(/^\/stats$/, async (msg) => {
        await mostrarEstadisticasTexto(msg.chat.id, bot);
    });
};

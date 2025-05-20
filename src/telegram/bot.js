
/*
const TelegramBot = require('node-telegram-bot-api');
const mensajeHandler = require('./handlers/mensajeHandler');
const callbackHandler = require('./handlers/callbackHandler');
const estadisticasIAHandler = require('./handlers/iaHandler');
const { manejarConsultaIA } = require('./handlers/iaHandler');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

// bot.on('message', (msg) => mensajeHandler(bot, msg));
bot.on('callback_query', (query) => callbackHandler(bot, query));

bot.on('message', async (msg) => {
    /* if (msg.text.toLowerCase().includes("gasto") || msg.text.toLowerCase().includes("promedio") || msg.text.toLowerCase().includes("obra social")) {
         await estadisticasIAHandler(msg, bot);
     }*/
// Para pruebas simples, redirigí todo a IA
/*    console.log("🔍 Mensaje recibido:", msg.text);
    await manejarConsultaIA(msg, bot);
});


module.exports = bot; // Para usar desde cronjob u otros scripts

*/

// src/telegram/bot.js
const bot = require('./utils/telegramBot');

// Registrar handlers
require('../telegram/handlers/mensajes')(bot);
require('../telegram/handlers/callbacks')(bot);
require('../telegram/handlers/comandos')(bot);

module.exports = bot;

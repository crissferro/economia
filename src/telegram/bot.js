
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

const TelegramBot = require('node-telegram-bot-api');
const dispatcher = require('./core/dispatcher');

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

bot.on('message', (msg) => {
    dispatcher.handleMessage(bot, msg);
});

bot.on('callback_query', (callbackQuery) => {
    dispatcher.handleCallback(bot, callbackQuery);
});

console.log('Bot de Telegram iniciado con polling.');
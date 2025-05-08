const TelegramBot = require('node-telegram-bot-api');
const mensajeHandler = require('./handlers/mensajeHandler');
const callbackHandler = require('./handlers/callbackHandler');

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => mensajeHandler(bot, msg));
bot.on('callback_query', (query) => callbackHandler(bot, query));
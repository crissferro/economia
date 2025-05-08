// telegram/handlers/callbackHandler.js
module.exports = (bot, query) => {
    const chatId = query.message.chat.id;
    const data = query.data;
  
    // Aquí puedes manejar distintas acciones de botones, por ejemplo:
    if (data === 'marcar_pagado') {
      bot.sendMessage(chatId, 'Por favor responde a este mensaje con "pagado" para marcarlo.');
    }
  
    bot.answerCallbackQuery(query.id);
  };
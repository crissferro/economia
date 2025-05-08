const { mostrarGastosNoPagados, mostrarGastosVencidos, mostrarGastosPagados } = require('../servicios/consultasGastos');
const { marcarComoPagado } = require('../servicios/pagos');

async function manejarCallback(bot, query) {
  const chatId = query.message.chat.id;
  const data = query.data;

  if (data === 'gastos_impagos') await mostrarGastosNoPagados(bot, chatId);
  else if (data === 'gastos_vencidos') await mostrarGastosVencidos(bot, chatId);
  else if (data === 'gastos_pagados') await mostrarGastosPagados(bot, chatId);
  else if (data.startsWith('pagar_')) await marcarComoPagado(bot, chatId, data.split('_')[1]);

  bot.answerCallbackQuery(query.id);
}

module.exports = { manejarCallback };

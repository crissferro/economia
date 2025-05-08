const { estadoConversacion, manejarConversacion } = require('./conversacionHandler');
const { frasesGastosNoPagados, frasesPagosRealizados, frasesGastosProximos, frasesGastosVencidos } = require('../utils/frasesReconocidas');
const { mostrarGastosNoPagados, mostrarGastosPagados, mostrarGastosVencidos, mostrarGastosProximos } = require('../servicios/consultasGastos');
const { marcarComoPagadoTexto } = require('../servicios/pagos');
const { enviarNotificacion } = require('../servicios/notificaciones');

async function manejarMensaje(bot, message) {
    const chatId = message.chat.id;
    const texto = message.text?.toLowerCase();
    if (!texto) return;

    if (estadoConversacion[chatId]) {
        return manejarConversacion(bot, chatId, texto);
    }

    if (/^pagado\s+\d+$/.test(texto)) return marcarComoPagadoTexto(bot, chatId, texto);
    if (frasesGastosNoPagados.some(f => texto.includes(f))) return mostrarGastosNoPagados(bot, chatId);
    if (frasesGastosVencidos.some(f => texto.includes(f))) return mostrarGastosVencidos(bot, chatId);
    if (frasesPagosRealizados.some(f => texto.includes(f))) return mostrarGastosPagados(bot, chatId);
    if (frasesGastosProximos.some(f => texto.includes(f))) return mostrarGastosProximos(bot, chatId);
    if (texto.includes('agregar gasto')) {
        estadoConversacion[chatId] = { paso: 'concepto', datos: {} };
        return enviarNotificacion(bot, chatId, '📝 ¿Cuál es el concepto del gasto?');
    }

    return enviarNotificacion(bot, chatId, "📋 Elige una opción:\n\n/gastos_impagos\n/gastos_pagados\n/agregar gasto");
}

module.exports = { manejarMensaje };

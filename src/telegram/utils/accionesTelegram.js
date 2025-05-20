// telegram/utils/accionesTelegram.js
const bot = require('../bot');
const { obtenerGastosPorEstado, marcarGastoComoPagado } = require('../../servicios/gastosService');
const { formatearGasto } = require('./accionesGastos');

function enviarMensaje(chatId, texto, opciones = {}) {
    bot.sendMessage(chatId, texto, opciones);
}

async function mostrarGastosPorEstado(chatId, estado) {
    try {
        const gastos = await obtenerGastosPorEstado(estado);
        if (!gastos.length) return enviarMensaje(chatId, 'No hay gastos para mostrar.');

        const mensajes = gastos.map(g => formatearGasto(g)).join('\n\n');
        const botones = gastos.map(g => [{
            text: `✅ Pagar ${g.concepto}`,
            callback_data: `pagar_${g.id}`
        }]);

        enviarMensaje(chatId, mensajes, {
            reply_markup: { inline_keyboard: botones }
        });
    } catch (error) {
        console.error('Error mostrando gastos:', error);
        enviarMensaje(chatId, '❌ Error al mostrar los gastos.');
    }
}

function pagarGasto(chatId, gastoId) {
    marcarGastoComoPagado(gastoId)
        .then(() => enviarMensaje(chatId, '✅ Gasto marcado como pagado.'))
        .catch(err => {
            console.error(err);
            enviarMensaje(chatId, '❌ Error al marcar el gasto como pagado.');
        });
}

module.exports = {
    enviarMensaje,
    mostrarGastosPorEstado,
    pagarGasto
};

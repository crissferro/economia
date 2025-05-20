// telegram/utils/conversacionGasto.js
const { registrarNuevoGasto } = require('../../servicios/gastosService');
const { enviarMensaje } = require('./accionesTelegram');

const conversaciones = {};

function iniciarConversacion(chatId) {
    conversaciones[chatId] = {
        pasoActual: 'concepto',
        datos: {}
    };
    return '¿Cuál es el concepto del gasto?';
}

function manejarMensaje(chatId, mensaje) {
    const conversacion = conversaciones[chatId];
    if (!conversacion) return null;

    const paso = conversacion.pasoActual;
    const datos = conversacion.datos;

    switch (paso) {
        case 'concepto':
            datos.concepto = mensaje;
            conversacion.pasoActual = 'monto';
            return '¿Cuál es el monto del gasto?';
        case 'monto':
            const monto = parseFloat(mensaje.replace(',', '.'));
            if (isNaN(monto)) return 'Por favor, ingresá un número válido.';
            datos.monto = monto;
            conversacion.pasoActual = 'mes';
            return '¿A qué mes corresponde el gasto? (ej: 5)';
        case 'mes':
            const mes = parseInt(mensaje);
            if (isNaN(mes) || mes < 1 || mes > 12) return 'Ingresá un número de mes válido (1-12).';
            datos.mes = mes;
            conversacion.pasoActual = 'anio';
            return '¿De qué año es el gasto? (ej: 2024)';
        case 'anio':
            const anio = parseInt(mensaje);
            if (isNaN(anio)) return 'Ingresá un año válido.';
            datos.anio = anio;
            conversacion.pasoActual = 'vencimiento';
            return '¿Cuál es la fecha de vencimiento? (formato: YYYY-MM-DD)';
        case 'vencimiento':
            if (!/^\d{4}-\d{2}-\d{2}$/.test(mensaje)) return 'Ingresá la fecha en formato YYYY-MM-DD.';
            datos.vencimiento = mensaje;

            // Guardar gasto
            registrarNuevoGasto(datos)
                .then(() => enviarMensaje(chatId, '✅ Gasto registrado correctamente.'))
                .catch((error) => {
                    console.error('Error registrando gasto:', error);
                    enviarMensaje(chatId, '❌ Hubo un error al registrar el gasto.');
                });

            delete conversaciones[chatId];
            return null;
        default:
            return 'No entendí el mensaje.';
    }
}

function hayConversacionActiva(chatId) {
    return conversaciones[chatId] !== undefined;
}

module.exports = {
    iniciarConversacion,
    manejarMensaje,
    hayConversacionActiva
};

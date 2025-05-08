const { enviarNotificacion } = require('../servicios/notificaciones');
const { guardarGasto } = require('../servicios/pagos');

const estadoConversacion = {};

async function manejarConversacion(bot, chatId, texto) {
    const paso = estadoConversacion[chatId].paso;
    const datos = estadoConversacion[chatId].datos;

    switch (paso) {
        case 'concepto':
            datos.concepto = texto;
            estadoConversacion[chatId] = { paso: 'monto', datos };
            return enviarNotificacion(bot, chatId, '💰 ¿Cuál es el monto del gasto?');
        case 'monto':
            const monto = parseFloat(texto.replace(',', '.'));
            if (isNaN(monto)) return enviarNotificacion(bot, chatId, '⚠️ Ingresá un monto válido.');
            datos.monto = monto;
            estadoConversacion[chatId] = { paso: 'vencimiento_pregunta', datos };
            return enviarNotificacion(bot, chatId, '📅 ¿Querés ingresar una fecha de vencimiento? (sí / no)');
        case 'vencimiento_pregunta':
            if (texto.startsWith('s')) {
                estadoConversacion[chatId] = { paso: 'vencimiento_fecha', datos };
                return enviarNotificacion(bot, chatId, '📆 Ingresá la fecha en formato DD/MM/AAAA:');
            } else {
                datos.fecha_vencimiento = null;
                delete estadoConversacion[chatId];
                return guardarGasto(bot, chatId, datos);
            }
        case 'vencimiento_fecha':
            const partes = texto.split('/');
            if (partes.length !== 3) return enviarNotificacion(bot, chatId, '⚠️ Formato incorrecto.');
            const [dia, mes, anio] = partes.map(n => parseInt(n));
            const fecha = new Date(anio, mes - 1, dia);
            if (isNaN(fecha)) return enviarNotificacion(bot, chatId, '⚠️ Fecha inválida.');
            datos.fecha_vencimiento = fecha.toISOString().split('T')[0];
            delete estadoConversacion[chatId];
            return guardarGasto(bot, chatId, datos);
    }
}

module.exports = { estadoConversacion, manejarConversacion };

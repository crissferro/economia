const { marcarGastoComoPagado } = require('../../src/controllers/gastos/gastos_agregar');

async function manejarMensajeTelegram(body) {
    if (!body.message || !body.message.text) return;

    const chatId = body.message.chat.id;
    const texto = body.message.text.trim().toLowerCase();

    // Extraer ID de gasto desde mensaje anterior (si lo envías con ID al usuario)
    // Aquí puedes usar metadata del mensaje, por ejemplo body.message.reply_to_message.text

    if (texto === 'pagado' && body.message.reply_to_message) {
        const mensajeOriginal = body.message.reply_to_message.text;
        const regex = /ID\s*:\s*(\d+)/i;
        const match = mensajeOriginal.match(regex);

        if (match) {
            const gastoId = parseInt(match[1]);
            await marcarGastoComoPagado(gastoId);
            console.log(`✅ Gasto con ID ${gastoId} marcado como pagado, desde manejadorMensajes`);
        } else {
            console.log('❌ No se encontró ID de gasto en el mensaje original.');
        }
    } else {
        console.log(`📩 Mensaje recibido: "${texto}" (sin acción asociada)`);
    }
}

module.exports = { manejarMensajeTelegram };

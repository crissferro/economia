const {
    frasesGastosNoPagados,
    frasesPagosRealizados,
    frasesGastosProximos,
    frasesGastosVencidos
} = require('./frasesReconocidas');
const TelegramBot = require('node-telegram-bot-api');
const { conn } = require('../db/dbconnection');
const { formatearMensajePago, mensajeGastoNoEncontrado, mensajeErrorGeneral } = require('./mensajesTelegram');


const token = '7290653879:AAEEBQIF_lbgzrYq45hqatOrh4EVQnz0G0M';
const bot = new TelegramBot(token, { polling: true });

function enviarNotificacion(chatId, mensaje, buttons = []) {
    console.log(`🔔 Enviando mensaje a ${chatId}: ${mensaje}`);
    const opciones = buttons.length > 0 ? {
        reply_markup: {
            inline_keyboard: buttons
        }
    } : {};

    return bot.sendMessage(chatId, mensaje, {
        parse_mode: 'Markdown',
        ...opciones
    })
        .then(() => console.log('✅ Notificación enviada'))
        .catch(err => console.error('❌ Error al enviar mensaje:', err));
}

function mostrarMenu(chatId) {
    const opciones = [
        [{ text: "Gastos impagos", callback_data: "gastos_impagos" }],
        [{ text: "Gastos vencidos", callback_data: "gastos_vencidos" }],
        [{ text: "Gastos ya pagados", callback_data: "gastos_pagados" }]
    ];
    return enviarNotificacion(chatId, "📋 Elige una opción para consultar:", opciones);
}

bot.on('message', async (message) => {
    console.log('📨 Mensaje recibido:', message.text);
    const chatId = message.chat.id;
    if (!message.text) return;

    const texto = message.text.toLowerCase();
    const match = texto.match(/^pagado\s+(\d+)$/);

    if (match) {
        const gastoId = parseInt(match[1], 10);
        const fechaISO = new Date().toISOString().split('T')[0];

        try {
            const [[gasto]] = await conn.query(`
                SELECT g.*, c.nombre AS concepto
                FROM gastos g
                JOIN users u ON g.users_id = u.id
                JOIN conceptos c ON g.concepto_id = c.id
                WHERE g.id = ? AND u.chat_id = ?
            `, [gastoId, chatId]);

            if (!gasto) return enviarNotificacion(chatId, mensajeGastoNoEncontrado());

            await conn.query(`
                UPDATE gastos SET pagado = 1, fecha_pago = ? WHERE id = ?
            `, [fechaISO, gastoId]);

            await enviarNotificacion(chatId, formatearMensajePago(gasto));
            console.log(`✅ Gasto ${gastoId} marcado como pagado por ${chatId}`);
        } catch (err) {
            console.error("❌ Error al procesar mensaje:", err);
            await enviarNotificacion(chatId, mensajeErrorGeneral());
        }
    } else if (frasesGastosNoPagados.some(f => texto.includes(f))) {
        await mostrarGastosNoPagados(chatId);
    } else if (frasesGastosProximos.some(f => texto.includes(f))) {
        await mostrarGastosProximos(chatId);
    } else if (frasesPagosRealizados.some(f => texto.includes(f))) {
        await mostrarGastosPagados(chatId);
    } else if (frasesGastosVencidos.some(f => texto.includes(f))) {
        await mostrarGastosVencidos(chatId);
    } else {
        await mostrarMenu(chatId);
    }
});

bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'gastos_impagos') await mostrarGastosNoPagados(chatId);
    else if (data === 'gastos_vencidos') await mostrarGastosVencidos(chatId);
    else if (data === 'gastos_pagados') await mostrarGastosPagados(chatId);
    else if (data.startsWith('pagar_')) await marcarComoPagado(chatId, data.split('_')[1]);

    bot.answerCallbackQuery(query.id);
});


// Gastos proximos a vencer
// Esta función muestra los gastos próximos a vencer al usuario
async function mostrarGastosProximos(chatId) {
    try {
        const hoy = new Date();
        const fechaLimite = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0); // Fin del mes actual
        const fechaLimiteISO = fechaLimite.toISOString().split('T')[0];

        // Consultar los gastos no pagados, tipo egreso, y dentro del rango de fechas
        const [resultados] = await conn.query(`
            SELECT g.id, g.monto, g.fecha_vencimiento, c.nombre AS concepto
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN users u ON g.users_id = u.id
            WHERE g.pagado = 0
            AND u.chat_id = ?
            AND c.tipo = 'egreso'
            AND (
                (g.fecha_vencimiento IS NOT NULL AND DATE(g.fecha_vencimiento) BETWEEN CURDATE() AND ?)
                OR (g.fecha_vencimiento IS NULL AND g.mes = MONTH(CURDATE()) AND g.anio = YEAR(CURDATE()))
            )
            ORDER BY g.fecha_vencimiento IS NULL, g.fecha_vencimiento;
        `, [chatId, fechaLimiteISO]);

        if (resultados.length === 0) {
            await enviarNotificacion(chatId, '✅ No tenés gastos próximos a vencer.');
        } else {
            // Preparar los botones para interactuar con los gastos
            const botones = resultados.map(gasto => [{
                text: `💰 ${gasto.concepto} - $${gasto.monto}`,
                callback_data: `pagar_${gasto.id}`
            }]);

            // Preparar el listado de gastos para enviar
            const textoListado = resultados.map(gasto => {
                const vencimiento = gasto.fecha_vencimiento
                    ? new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR')
                    : 'Sin vencimiento';
                return `• *${gasto.concepto}* - $${gasto.monto} - Vence: ${vencimiento} - ID: ${gasto.id}`;
            }).join('\n');

            // Enviar el mensaje con los gastos y los botones
            await enviarNotificacion(chatId, `📋 *Gastos próximos a vencer:*\n\n${textoListado}`, botones);
        }
    } catch (err) {
        console.error("❌ Error al obtener los gastos próximos a vencer:", err);
        await enviarNotificacion(chatId, "❌ Ocurrió un error al obtener tus gastos.");
    }
}



// Gastos No Pagados
// Esta función muestra los gastos no pagados al usuario y permite marcar como pagado
async function mostrarGastosNoPagados(chatId) {
    try {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = hoy.getMonth() + 1;

        const [resultados] = await conn.query(`
                    SELECT g.id, g.monto, g.fecha_vencimiento, c.nombre AS concepto
                    FROM gastos g
                    JOIN conceptos c ON g.concepto_id = c.id
                    JOIN users u ON g.users_id = u.id
                    WHERE g.pagado = 0
                    AND u.chat_id = ?
                    AND c.tipo = 'egreso'
                    AND (
                        (g.fecha_vencimiento IS NOT NULL AND DATE(g.fecha_vencimiento) <= CURDATE())
                        OR (g.fecha_vencimiento IS NULL AND g.mes = ? AND g.anio = ?)
                    )
                    ORDER BY g.fecha_vencimiento IS NULL, g.fecha_vencimiento

        `, [chatId, mm, yyyy]);

        if (resultados.length === 0) {
            await enviarNotificacion(chatId, '✅ No tenés gastos pendientes por pagar.');
        } else {
            const botones = resultados.map(gasto => [{
                text: `💰 ${gasto.concepto} - $${gasto.monto}`,
                callback_data: `pagar_${gasto.id}`
            }]);

            const textoListado = resultados.map(gasto => {
                const vencimiento = gasto.fecha_vencimiento
                    ? new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR')
                    : 'Sin vencimiento';
                return `• *${gasto.concepto}* - $${gasto.monto} - Vence: ${vencimiento} - ID: ${gasto.id}`;
            }).join('\n');

            await enviarNotificacion(chatId, `📋 *Gastos pendientes de pago:*

${textoListado}`, botones);
        }
    } catch (error) {
        console.error("❌ Error al consultar gastos no pagados:", error);
        await enviarNotificacion(chatId, '⚠️ Ocurrió un error al obtener los gastos.');
    }
}

async function marcarComoPagado(chatId, gastoId) {
    const fechaISO = new Date().toISOString().split('T')[0];
    try {
        const [[gasto]] = await conn.query(`
            SELECT g.*, c.nombre AS concepto
            FROM gastos g
            JOIN users u ON g.users_id = u.id
            JOIN conceptos c ON g.concepto_id = c.id
            WHERE g.id = ? AND u.chat_id = ?
        `, [gastoId, chatId]);

        if (!gasto) return await enviarNotificacion(chatId, mensajeGastoNoEncontrado());

        await conn.query(`
            UPDATE gastos SET pagado = 1, fecha_pago = ? WHERE id = ?
        `, [fechaISO, gastoId]);

        await enviarNotificacion(chatId, formatearMensajePago(gasto));
        console.log(`✅ Gasto ${gastoId} marcado como pagado por ${chatId}`);
    } catch (err) {
        console.error("❌ Error al procesar mensaje:", err);
        await enviarNotificacion(chatId, mensajeErrorGeneral());
    }
}

// Gastos Vencidos:
async function mostrarGastosVencidos(chatId) {
    const hoy = new Date().toISOString().split('T')[0];

    try {
        const [gastos] = await conn.query(`
                SELECT g.id, c.nombre AS concepto, g.monto, g.fecha_vencimiento
                FROM gastos g
                JOIN users u ON g.users_id = u.id
                JOIN conceptos c ON g.concepto_id = c.id
                WHERE u.chat_id = ? AND g.pagado = 0 AND g.fecha_vencimiento < ?
                ORDER BY g.fecha_vencimiento ASC
        `, [chatId, hoy]);

        if (gastos.length === 0) {
            await enviarNotificacion(chatId, "✅ No tenés gastos vencidos por ahora.");
            return;
        }

        const mensaje = `⏰ Gastos vencidos:\n\n` + gastos.map(g =>
            `#${g.id} - ${g.concepto}: $${g.monto} (📅 venció el ${g.fecha_vencimiento})`
        ).join('\n');

        await enviarNotificacion(chatId, mensaje);
    } catch (err) {
        console.error("❌ Error al mostrar gastos vencidos:", err);
        await enviarNotificacion(chatId, mensajeErrorGeneral());
    }
}

// Gastos Pagados:
// Esta función muestra los gastos pagados al usuario

async function mostrarGastosPagados(chatId) {
    try {
        const [gastos] = await conn.query(`
            SELECT g.id, c.nombre AS concepto, g.monto, g.fecha_pago
            FROM gastos g
            JOIN users u ON g.users_id = u.id
            JOIN conceptos c ON g.concepto_id = c.id
            WHERE u.chat_id = ? AND g.pagado = 1
            ORDER BY g.fecha_pago DESC
            LIMIT 10
        `, [chatId]);

        if (gastos.length === 0) {
            await enviarNotificacion(chatId, "📭 No tenés pagos registrados todavía.");
            return;
        }

        const mensaje = `🧾 Últimos gastos pagados:\n\n` + gastos.map(g =>
            `#${g.id} - ${g.concepto}: $${g.monto} (💳 ${g.fecha_pago})`
        ).join('\n');

        await enviarNotificacion(chatId, mensaje);
    } catch (err) {
        console.error("❌ Error al mostrar gastos pagados:", err);
        await enviarNotificacion(chatId, mensajeErrorGeneral());
    }
}

module.exports = {
    bot,
    enviarNotificacion
};

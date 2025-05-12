const estadoConversacion = {}; // Para cada chatId guardamos en qué paso está y qué datos lleva cargados
const {
    frasesGastosNoPagados,
    frasesPagosRealizados,
    frasesGastosProximos,
    frasesGastosVencidos
} = require('./frasesReconocidas');
const TelegramBot = require('node-telegram-bot-api');
const { conn } = require('../../db/dbconnection');
const { formatearMensajePago, mensajeGastoNoEncontrado, mensajeErrorGeneral } = require('./mensajesTelegram');

const { iconosPorRubro } = require('../utils/iconos');
const token = process.env.TELEGRAM_BOT_TOKEN;
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
    const texto = message.text?.toLowerCase().trim();

    // 🔴 Cancelar en cualquier momento
    if (texto === 'cancelar') {
        delete estadoConversacion[chatId];
        return enviarNotificacion(chatId, '❌ Operación cancelada. Podés empezar de nuevo cuando quieras.');
    }

    if (estadoConversacion[chatId]) {
        const paso = estadoConversacion[chatId].paso;
        const datos = estadoConversacion[chatId].datos;

        switch (paso) {
            case 'concepto':
                datos.concepto = message.text;
                estadoConversacion[chatId] = { paso: 'monto', datos };
                return enviarNotificacion(chatId, '💰 ¿Cuál es el monto del gasto?');

            case 'monto':
                const monto = parseFloat(message.text.replace(',', '.'));
                if (isNaN(monto)) return enviarNotificacion(chatId, '⚠️ Ingresá un monto válido.');
                datos.monto = monto;
                estadoConversacion[chatId] = { paso: 'vencimiento_pregunta', datos };
                return enviarNotificacion(chatId, '📅 ¿Querés ingresar una fecha de vencimiento? (sí / no)');

            case 'vencimiento_pregunta':
                if (texto.startsWith('s')) {
                    estadoConversacion[chatId] = { paso: 'vencimiento_fecha', datos };
                    return enviarNotificacion(chatId, '📆 Ingresá la fecha en formato DD/MM/AAAA:');
                } else {
                    datos.fecha_vencimiento = null;
                    delete estadoConversacion[chatId];  // Limpiar estado
                    return guardarGasto(chatId, datos);
                }

            case 'vencimiento_fecha':
                if (['no', 'n', 'omitir'].includes(texto)) {
                    datos.fecha_vencimiento = null;
                    delete estadoConversacion[chatId];
                    return guardarGasto(chatId, datos);
                }

                const partes = message.text.split('/');
                if (partes.length !== 3) {
                    return enviarNotificacion(chatId, '⚠️ Formato incorrecto. Usá DD/MM/AAAA o escribí "cancelar".');
                }

                const [dia, mes, anio] = partes.map(p => parseInt(p));
                const fecha = new Date(anio, mes - 1, dia);

                if (isNaN(fecha.getTime())) {
                    return enviarNotificacion(chatId, '⚠️ Fecha inválida. Reintentá.');
                }

                datos.fecha_vencimiento = fecha.toISOString().split('T')[0];
                delete estadoConversacion[chatId];
                return guardarGasto(chatId, datos);

            default:
                delete estadoConversacion[chatId];
                return enviarNotificacion(chatId, '⚠️ Paso no reconocido. Escribí "cancelar" para empezar de nuevo.');
        }
    }

    if (!message.text) return;

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
    } else if (texto.includes('agregar gasto')) {
        estadoConversacion[chatId] = { paso: 'concepto', datos: {} };
        return enviarNotificacion(chatId, '📝 ¿Cuál es el concepto del gasto?');
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
            SELECT g.id, g.monto, g.fecha_vencimiento, c.nombre AS concepto, r.nombre AS rubro
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN rubros r ON c.rubro_id = r.id
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
            const textoListado = resultados.map(gasto => {
                const vencimiento = gasto.fecha_vencimiento
                    ? new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR')
                    : 'Sin vencimiento';

                const icono = iconosPorRubro[gasto.rubro] || '💰';
                const montoFormateado = gasto.monto.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 2
                });

                return `${icono} *${gasto.concepto}* - Importe: ${montoFormateado} - Vence: ${vencimiento}`;
            }).join('\n\n');

            const botones = resultados.map(gasto => [{
                text: `💰 ${gasto.concepto} - $${gasto.monto}`,
                callback_data: `pagar_${gasto.id}`
            }]);

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
            SELECT g.id, g.monto, g.fecha_vencimiento, c.nombre AS concepto, r.nombre AS rubro
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN rubros r ON c.rubro_id = r.id
            JOIN users u ON g.users_id = u.id
            WHERE g.pagado = 0
                AND u.chat_id = ?
                AND c.tipo = 'egreso'
                AND (
                    (g.fecha_vencimiento IS NOT NULL AND MONTH(g.fecha_vencimiento) = ? AND YEAR(g.fecha_vencimiento) = ?)
                    OR (g.fecha_vencimiento IS NULL AND g.mes = ? AND g.anio = ?)
                )
            ORDER BY g.fecha_vencimiento IS NULL, g.fecha_vencimiento;
        `, [chatId, mm, yyyy, mm, yyyy]); // <-- acá

        if (resultados.length === 0) {
            await enviarNotificacion(chatId, '✅ No tenés gastos pendientes por pagar.');
        } else {
            const textoListado = resultados.map(gasto => {
                const vencimiento = gasto.fecha_vencimiento
                    ? new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR')
                    : 'Sin vencimiento';

                const icono = iconosPorRubro[gasto.rubro] || '💰';
                const montoFormateado = gasto.monto.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 2
                });

                return `${icono} *${gasto.concepto}* - Importe: ${montoFormateado} - Vence: ${vencimiento}`;
            }).join('\n\n');

            const botones = resultados.map(g => [{
                text: `💰 ${g.concepto} - $${g.monto}`,
                callback_data: `pagar_${g.id}`
            }]);

            await enviarNotificacion(chatId, `📋 *Gastos pendientes de pago:*\n\n${textoListado}`, botones);

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
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = hoy.getMonth() + 1;
    const hoyISO = hoy.toISOString().split('T')[0];

    try {
        const [gastos] = await conn.query(`
            SELECT g.id, c.nombre AS concepto, r.nombre AS rubro, g.monto, g.fecha_vencimiento
            FROM gastos g
            JOIN users u ON g.users_id = u.id
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN rubros r ON c.rubro_id = r.id  -- Añadido el JOIN con la tabla rubros
            WHERE g.pagado = 0
                AND u.chat_id = ?
                AND c.tipo = 'egreso'
                AND g.fecha_vencimiento IS NOT NULL
                AND g.fecha_vencimiento < CURDATE()
                AND MONTH(g.fecha_vencimiento) = ? AND YEAR(g.fecha_vencimiento) = ?
            ORDER BY g.fecha_vencimiento ASC;

        `, [chatId, mm, yyyy]);

        if (gastos.length === 0) {
            await enviarNotificacion(chatId, '✅ No tenés gastos vencidos este mes.');
        } else {
            const textoListado = gastos.map(g => {
                const venc = new Date(g.fecha_vencimiento).toLocaleDateString('es-AR');
                const icono = iconosPorRubro[g.rubro] || '💰';
                const montoFormateado = g.monto.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 2
                });

                return `${icono} *${g.concepto}* - Importe: ${montoFormateado} - Venció: ${venc}`;
            }).join('\n\n');

            const botones = gastos.map(g => [{
                text: `💰 ${g.concepto} - $${g.monto}`,
                callback_data: `pagar_${g.id}`
            }]);

            await enviarNotificacion(chatId, `⚠️ *Gastos vencidos este mes:*\n\n${textoListado}`, botones);

        }
    } catch (error) {
        console.error("❌ Error al consultar gastos vencidos:", error);
        await enviarNotificacion(chatId, '⚠️ Ocurrió un error al obtener los gastos vencidos.');
    }
}



// Gastos Pagados:
// Esta función muestra los gastos pagados al usuario

async function mostrarGastosPagados(chatId) {
    try {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = hoy.getMonth() + 1;

        const [gastos] = await conn.query(`
            SELECT g.id, c.nombre AS concepto, r.nombre AS rubro, g.monto, g.fecha_pago
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN rubros r ON c.rubro_id = r.id
            JOIN users u ON g.users_id = u.id
            WHERE g.pagado = 1
            AND u.chat_id = ?
            AND MONTH(g.fecha_pago) = ? AND YEAR(g.fecha_pago) = ?
            ORDER BY g.fecha_pago DESC
            LIMIT 10;
        `, [chatId, mm, yyyy]);

        if (gastos.length === 0) {
            await enviarNotificacion(chatId, '✅ No registrás pagos en este mes.');
        } else {
            const texto = gastos.map(g => {
                const fecha = new Date(g.fecha_pago).toLocaleDateString('es-AR');
                const icono = iconosPorRubro[g.rubro] || '💰';
                const montoFormateado = g.monto.toLocaleString('es-AR', {
                    style: 'currency',
                    currency: 'ARS',
                    minimumFractionDigits: 2
                });

                return `${icono} *${g.concepto}* - Importe: ${montoFormateado} - Fecha pago: ${fecha}`;
            }).join('\n\n');

            await enviarNotificacion(chatId, `📋 *Gastos pagados este mes:*\n\n${texto}`);
        }
    } catch (error) {
        console.error("❌ Error al consultar gastos pagados:", error);
        await enviarNotificacion(chatId, '⚠️ Ocurrió un error al obtener los pagos.');
    }
}


async function guardarGasto(chatId, datos) {
    try {
        const [[usuario]] = await conn.query(`SELECT id FROM users WHERE chat_id = ?`, [chatId]);
        if (!usuario) return enviarNotificacion(chatId, '❌ No se encontró tu usuario en la base de datos.');

        const concepto = datos.concepto;
        const monto = datos.monto;
        const fecha_vencimiento = datos.fecha_vencimiento || null;

        // Validar y parsear fecha
        const fecha = datos.fecha ? new Date(datos.fecha) : new Date();  // Usa hoy si no hay fecha
        const mes = fecha.getMonth() + 1;
        const anio = fecha.getFullYear();

        // Buscar concepto
        const [[conceptoExistente]] = await conn.query(`SELECT id, tipo FROM conceptos WHERE nombre = ?`, [concepto]);
        if (!conceptoExistente) {
            return enviarNotificacion(chatId, `❌ El concepto *${concepto}* no existe. Crealo desde la web primero.`);
        }

        // Asignar datos derivados
        datos.concepto_id = conceptoExistente.id;
        datos.tipo = conceptoExistente.tipo;
        datos.user_id = usuario.id;

        // Insertar gasto
        console.log("Datos antes de guardar gasto:", datos);
        await conn.query(`
            INSERT INTO gastos (fecha, monto, mes, anio, fecha_vencimiento, pagado, concepto_id, tipo, users_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            fecha.toISOString().split('T')[0],  // YYYY-MM-DD
            datos.monto,
            mes,
            anio,
            fecha_vencimiento,
            false,
            datos.concepto_id,
            datos.tipo,
            datos.user_id
        ]);

        estadoConversacion[chatId] = null;

        return enviarNotificacion(chatId, `✅ Gasto *${concepto}* por *$${monto.toLocaleString('es-AR')}* agregado correctamente.`);
    } catch (err) {
        console.error('❌ Error al guardar gasto:', err);
        estadoConversacion[chatId] = null;
        return enviarNotificacion(chatId, '⚠️ Ocurrió un error al guardar el gasto.');
    }
}



module.exports = {
    bot,
    enviarNotificacion
};

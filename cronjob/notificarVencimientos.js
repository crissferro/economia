const { conn } = require('../src/db/dbconnection');
const { enviarNotificacion } = require('../src/telegram/utils/telegramBot');

async function notificarVencimientos() {
    try {
        const hoy = new Date();
        const manana = new Date();
        manana.setDate(hoy.getDate() + 1);

        const fechaHoy = hoy.toISOString().split('T')[0];
        const fechaManana = manana.toISOString().split('T')[0];

        const [gastos] = await conn.query(`
            SELECT g.id, g.monto, g.fecha_vencimiento, c.nombre AS concepto, u.chat_id
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            JOIN users u ON g.users_id = u.id
            WHERE g.pagado = 0
              AND g.notificado = 0
              AND DATE(g.fecha_vencimiento) IN (?, ?)
              AND u.chat_id IS NOT NULL
        `, [fechaHoy, fechaManana]);

        const mensajes = gastos.map(async (gasto) => {
            const fechaVenc = new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR');
            const mensaje = `
📌 *Tenés un gasto próximo a vencer:*
🧾 ID: ${gasto.id}
📋 *${gasto.concepto}*
💰 $${gasto.monto}
📅 *Vence el ${fechaVenc}*
            `;
            console.log(`🔔 Enviando mensaje a ${gasto.chat_id}: ${mensaje}`);
            await enviarNotificacion(gasto.chat_id, mensaje);

            // Marcar como notificado
            await conn.query(`UPDATE gastos SET notificado = 1 WHERE id = ?`, [gasto.id]);
        });

        await Promise.all(mensajes);
        console.log(`✅ Notificaciones enviadas: ${gastos.length}`);
    } catch (error) {
        console.error('❌ Error al enviar notificaciones:', error);
    }
}

notificarVencimientos();

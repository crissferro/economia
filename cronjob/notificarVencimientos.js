const { conn } = require('../src/db/dbconnection');
const { enviarNotificacion } = require('../src/utils/telegramBot');

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
              AND DATE(g.fecha_vencimiento) IN (?, ?)
              AND u.chat_id IS NOT NULL
        `, [fechaHoy, fechaManana]);

        const mensajes = gastos.map(gasto => {
            const fechaVenc = new Date(gasto.fecha_vencimiento).toLocaleDateString('es-AR');
            const mensaje = `
            📌 Tenés un gasto próximo a vencer:\n\n
            🧾 ID: ${gasto.id}\n
            📋 *${gasto.concepto}*\n
            💰 $${gasto.monto}\n
            📅 Vence el ${fechaVenc}
            `;
            console.log(`🔔 Enviando mensaje a ${gasto.chat_id}: ${mensaje}`);
            return enviarNotificacion(gasto.chat_id, mensaje);
        });

        await Promise.all(mensajes);
        console.log(`✅ Notificaciones enviadas: ${gastos.length}`);
    } catch (error) {
        console.error('❌ Error al enviar notificaciones:', error);
    }
}

notificarVencimientos();

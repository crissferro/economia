const express = require('express');
const router = express.Router();
const { enviarNotificacion, bot } = require('../utils/telegramBot');
const { conn } = require('../db/dbconnection');

router.post('/notificar', (req, res) => {
    const { chatId, mensaje } = req.body;

    if (!chatId || !mensaje) {
        return res.status(400).json({ error: 'Faltan chatId o mensaje' });
    }

    enviarNotificacion(chatId, mensaje);
    res.send({ ok: true });
});

// 👉 Ruta para Webhook de Telegram
router.post('/webhook', async (req, res) => {
    const message = req.body.message;

    if (!message || !message.text) {
        return res.sendStatus(200); // Ignora si no hay texto
    }

    const chatId = message.chat.id;
    const texto = message.text.toLowerCase();
    const match = texto.match(/^pagado\s+(\d+)$/);

    if (!match) return res.sendStatus(200);

    const gastoId = parseInt(match[1], 10);
    const hoy = new Date();
    const fechaISO = hoy.toISOString().split('T')[0];
    const fechaFormateada = hoy.toLocaleDateString('es-AR');

    try {
        const [[gasto]] = await conn.query(`
            SELECT * FROM gastos g
            JOIN users u ON g.users_id = u.id
            WHERE g.id = ? AND u.chat_id = ?
        `, [gastoId, chatId]);

        if (!gasto) {
            await enviarNotificacion(chatId, `❌ No encontré ese gasto o no te pertenece.`);
            return res.sendStatus(200);
        }

        await conn.query(`
            UPDATE gastos SET pagado = 1, fecha_pago = ? WHERE id = ?
        `, [fechaISO, gastoId]);

        await enviarNotificacion(chatId, `✅ El gasto con ID ${gastoId} fue marcado como pagado el ${fechaFormateada}.`);
    } catch (err) {
        console.error("❌ Error al procesar webhook:", err);
        await enviarNotificacion(chatId, `⚠️ Ocurrió un error al intentar registrar el pago.`);
    }

    res.sendStatus(200);
});

module.exports = router;

const express = require('express');
const router = express.Router();
const { enviarNotificacion } = require('../utils/telegramBot');

router.post('/notificar', (req, res) => {
    const { chatId, mensaje } = req.body;

    if (!chatId || !mensaje) {
        return res.status(400).json({ error: 'Faltan chatId o mensaje' });
    }

    enviarNotificacion(chatId, mensaje);
    res.send({ ok: true });
});

module.exports = router;

//old
//const express = require('express');
//const router = express.Router();
//const { enviarNotificacion } = require('../telegram/utils/telegramBot');

// 👉 Solo mantenemos esta ruta para enviar notificaciones desde la web
//router.post('/notificar', (req, res) => {
//    const { chatId, mensaje } = req.body;

//if (!chatId || !mensaje) {
//    return res.status(400).json({ error: 'Faltan chatId o mensaje' });
//}

//enviarNotificacion(chatId, mensaje);
//res.send({ ok: true });
//});

//module.exports = router;



const express = require('express');
const router = express.Router();
const { enviarNotificacion } = require('../telegram/utils/telegramBot');
const { manejarMensajeTelegram } = require('../controllers/manejadorMensajes');

// 👉 Ruta para enviar notificaciones desde la web
router.post('/notificar', (req, res) => {
    const { chatId, mensaje } = req.body;

    if (!chatId || !mensaje) {
        return res.status(400).json({ error: 'Faltan chatId o mensaje' });
    }

    enviarNotificacion(chatId, mensaje);
    res.send({ ok: true });
});

// 👉 Ruta webhook para recibir mensajes desde Telegram
router.post('/webhook/telegram', (req, res) => {
    try {
        const body = req.body;
        manejarMensajeTelegram(body);
        res.sendStatus(200); // Telegram necesita un 200 OK
    } catch (error) {
        console.error('Error procesando mensaje:', error);
        res.sendStatus(500);
    }
});

module.exports = router;

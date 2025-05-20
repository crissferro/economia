const { interpretarMensaje } = require('../ia/iaService');
const { responderDesdeIA } = require('../ia/responderIA');

async function manejarConsultaIA(msg, bot) {
    const chatId = msg.chat.id;
    const pregunta = msg.text;

    bot.sendMessage(chatId, 'Procesando tu consulta con IA...');

    const interpretacion = await interpretarMensaje(pregunta);
    console.log("🔍 Interpretación IA:", interpretacion);

    if (!interpretacion) {
        return bot.sendMessage(chatId, 'No pude interpretar tu mensaje. ¿Podés reformularlo?');
    }

    const respuesta = await responderDesdeIA(interpretacion);
    bot.sendMessage(chatId, respuesta, { parse_mode: 'Markdown' });
}

module.exports = { manejarConsultaIA };

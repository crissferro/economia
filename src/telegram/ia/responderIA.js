const { obtenerVariacionPorRango } = require('../../servicios/estadisticasService'); // Asegurate de tener esta función
const { formatearMesAnio } = require('../../utils/fechas'); // Si querés mostrar bonito

async function responderDesdeIA(json) {
    const { intencion, concepto, desde, hasta } = json;

    if (intencion === 'variacion_personalizada') {
        if (!concepto || !desde || !hasta) return 'Faltan datos para procesar tu consulta.';

        try {
            const resultado = await obtenerVariacionPorRango(concepto, desde, hasta);

            if (!resultado) return 'No se encontraron datos para ese rango.';

            const porcentaje = resultado.porcentaje;
            const valorInicial = resultado.valorInicial;
            const valorFinal = resultado.valorFinal;

            return `El gasto en *${concepto}* aumentó un ${porcentaje > 0 ? '+' : ''}${porcentaje.toFixed(2)}% entre ${formatearMesAnio(desde)} y ${formatearMesAnio(hasta)} (de $${valorInicial} a $${valorFinal}).`;
        } catch (err) {
            console.error("Error al responder desde IA:", err);
            return 'Hubo un error procesando tu consulta.';
        }
    }

    return 'Por ahora solo puedo responder consultas de variación personalizada.';
}

module.exports = { responderDesdeIA };

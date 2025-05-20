const axios = require('axios');

async function interpretarMensaje(textoUsuario) {
    const prompt =
        `Convertí frases humanas sobre gastos en objetos JSON que indiquen qué tipo de estadística se solicita.

Ejemplos:
Frase: Decime el promedio de gasto de seguro de los últimos 6 meses
Salida: {"intencion": "promedio_concepto", "concepto": "seguro", "periodo_meses": 6}

Frase: ¿Cuánto aumentó la obra social respecto al mes pasado?
Salida: {"intencion": "variacion_mensual", "concepto": "obra social"}

Frase: ¿Cuál fue el gasto total de luz este año?
Salida: {"intencion": "total_concepto_anual", "concepto": "luz"}

Frase: ${textoUsuario}
Salida:
`;

    try {
        const response = await axios.post('http://ollama:11434/api/generate', {
            model: 'gemma:2b',
            prompt: prompt,
            stream: false,
        });

        const match = response.data.response.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;

    } catch (err) {
        console.error("Error al interpretar el mensaje:", err.message);
        return null;
    }
}

module.exports = { interpretarMensaje };

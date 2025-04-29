const { conn } = require('../../db/dbconnection');
const { enviarMensajeTelegram } = require('../../utils/telegramBot');

module.exports = {
    getModificar: async (req, res) => {
        try {
            const [gasto] = await conn.query(`SELECT * FROM gastos WHERE id=?`, req.params.id);
            const [conceptos] = await conn.query('SELECT * FROM conceptos');

            res.render('modificar_gasto', {
                tituloDePagina: 'Página para Modificar Gastos',
                registro: gasto[0],
                conceptos
            });
        } catch (error) {
            console.error('Error al obtener datos para modificar:', error);
            res.status(500).send('Error interno del servidor');
        }
    },

    actualizarGasto: async (req, res) => {
        const { id } = req.params;
        let { concepto_id, monto, fecha_vencimiento, pagado, mes, anio } = req.body;

        try {
            const [gastoActual] = await conn.query(`SELECT * FROM gastos WHERE id = ?`, [id]);

            if (gastoActual.length === 0) {
                return res.status(404).json({ mensaje: 'Gasto no encontrado' });
            }

            const gasto = gastoActual[0];

            concepto_id = concepto_id ?? gasto.concepto_id;
            monto = monto ?? gasto.monto;
            fecha_vencimiento = fecha_vencimiento ?? gasto.fecha_vencimiento;
            mes = mes ?? gasto.mes;
            anio = anio ?? gasto.anio;
            pagado = pagado == 1 ? 1 : 0;
            const fecha_pago = pagado ? new Date().toISOString().split('T')[0] : null;

            await conn.query(
                'UPDATE gastos SET concepto_id = ?, monto = ?, fecha_vencimiento = ?, pagado = ?, fecha_pago = ?, mes = ?, anio = ? WHERE id = ?',
                [concepto_id, monto, fecha_vencimiento, pagado, fecha_pago, mes, anio, id]
            );

            // ✅ Notificar por Telegram solo si se marcó como pagado
            if (pagado === 1) {
                const [rows] = await conn.query(`
                    SELECT u.chat_id 
                    FROM gastos g
                    JOIN users u ON g.users_id = u.id
                    WHERE g.id = ?
                `, [id]);

                if (rows.length > 0 && rows[0].chat_id) {
                    const chatId = rows[0].chat_id;
                    const fechaHoy = new Date().toLocaleDateString('es-AR');
                    await enviarMensajeTelegram(chatId, `✅ El gasto con ID ${id} fue marcado como pagado el ${fechaHoy}.`);
                }
            }

            res.json({ mensaje: 'Gasto actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar el gasto:', error);
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    },
};

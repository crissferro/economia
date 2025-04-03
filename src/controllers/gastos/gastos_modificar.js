const { conn } = require('../../db/dbconnection');

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

        // Obtener valores actuales del gasto antes de actualizar
        try {
            const [gastoActual] = await conn.query(`SELECT * FROM gastos WHERE id = ?`, [id]);

            if (gastoActual.length === 0) {
                return res.status(404).json({ mensaje: 'Gasto no encontrado' });
            }

            const gasto = gastoActual[0];

            // Asegurar que los valores no sean NULL ni 0 si no se enviaron en la solicitud
            concepto_id = concepto_id ?? gasto.concepto_id;
            monto = monto ?? gasto.monto;
            fecha_vencimiento = fecha_vencimiento ?? gasto.fecha_vencimiento;
            mes = mes ?? gasto.mes;
            anio = anio ?? gasto.anio;

            // Convertir pagado a booleano
            pagado = pagado == 1 ? 1 : 0;

            // Si el gasto se marca como pagado, registrar la fecha actual; si se desmarca, poner NULL
            const fecha_pago = pagado ? new Date().toISOString().split('T')[0] : null;

            // Actualizar la base de datos
            await conn.query(
                'UPDATE gastos SET concepto_id = ?, monto = ?, fecha_vencimiento = ?, pagado = ?, fecha_pago = ?, mes = ?, anio = ? WHERE id = ?',
                [concepto_id, monto, fecha_vencimiento, pagado, fecha_pago, mes, anio, id]
            );

            res.json({ mensaje: 'Gasto actualizado correctamente' });
        } catch (error) {
            console.error('Error al actualizar el gasto:', error);
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    },
};

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
        const { concepto_id, monto, fecha_vencimiento, pagado, mes, anio } = req.body;

        try {
            await conn.query(
                'UPDATE gastos SET concepto_id = ?, monto = ?, fecha_vencimiento = ?, pagado = ?, mes = ?, anio = ? WHERE id = ?',
                [concepto_id, monto, fecha_vencimiento, pagado, mes, anio, id]
            );

            res.redirect('/listado_gastos.html');
        } catch (error) {
            console.error('Error al actualizar el gasto:', error);
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        }
    },
};

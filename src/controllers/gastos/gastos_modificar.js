/*const { conn } = require('../../db/dbconnection');

module.exports.actualizarGasto = async (req, res) => {
    const { id } = req.params;
    const { concepto_id, monto, fecha_vencimiento, pagado } = req.body;

    await conn.query(
        'UPDATE gastos SET concepto_id = ?, monto = ?, fecha_vencimiento = ?, pagado = ? WHERE id = ?',
        [concepto_id, monto, fecha_vencimiento, pagado, id]
    );
    res.json({ mensaje: 'Gasto actualizado' });
};
*/

const { conn } = require('../../db/dbconnection');

module.exports.actualizarGasto = async (req, res) => {
    const { id } = req.params;
    const { concepto_id, monto, fecha_vencimiento, pagado } = req.body;

    try {
        // Obtener los datos actuales del gasto si no se envían en el request
        const [result] = await conn.query('SELECT * FROM gastos WHERE id = ?', [id]);

        if (result.length === 0) {
            return res.status(404).json({ mensaje: 'Gasto no encontrado' });
        }

        const gastoActual = result[0];

        // Usar los valores actuales si no se envían en el request
        const nuevoConceptoId = concepto_id !== undefined ? concepto_id : gastoActual.concepto_id;
        const nuevoMonto = monto !== undefined ? monto : gastoActual.monto;
        const nuevaFechaVenc = fecha_vencimiento !== undefined ? fecha_vencimiento : gastoActual.fecha_vencimiento;
        const nuevoPagado = pagado !== undefined ? pagado : gastoActual.pagado;

        await conn.query(
            'UPDATE gastos SET concepto_id = ?, monto = ?, fecha_vencimiento = ?, pagado = ? WHERE id = ?',
            [nuevoConceptoId, nuevoMonto, nuevaFechaVenc, nuevoPagado, id]
        );

        res.json({ mensaje: 'Gasto actualizado' });
    } catch (error) {
        console.error('Error al actualizar el gasto:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

const { conn } = require('../../db/dbconnection');

exports.actualizarDetalles = async (req, res) => {
    const { id } = req.params;
    const { detalles } = req.body;

    if (!Array.isArray(detalles)) {
        return res.status(400).json({ error: 'Formato de datos incorrecto' });
    }

    try {
        // Iniciar transacción
        await conn.query('START TRANSACTION');

        // Eliminar detalles existentes
        await conn.query('DELETE FROM gastos_detalle WHERE gasto_id = ?', [id]);

        // Insertar nuevos detalles
        if (detalles.length > 0) {
            const valores = detalles.map(det => [id, det.concepto_id, det.monto]);
            await conn.query(
                'INSERT INTO gastos_detalle (gasto_id, concepto_id, monto) VALUES ?',
                [valores]
            );
        }

        // Confirmar transacción
        await conn.query('COMMIT');

        res.json({ mensaje: 'Detalles actualizados correctamente' });
    } catch (error) {
        // Revertir transacción en caso de error
        await conn.query('ROLLBACK');
        console.error('❌ Error al actualizar detalles:', error);
        res.status(500).json({ error: 'Error al actualizar los detalles del gasto' });
    }
};

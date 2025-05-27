const { conn } = require('../../db/dbconnection');

module.exports.eliminarGasto = async (req, res) => {
    const { id } = req.params;

    try {
        // Primero verificamos si el gasto tiene un concepto que requiere detalles
        const [gastoRows] = await conn.query(
            `SELECT g.*, c.requiere_detalles 
             FROM gastos g
             JOIN conceptos c ON g.concepto_id = c.id
             WHERE g.id = ?`,
            [id]
        );

        if (gastoRows.length === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }

        const gasto = gastoRows[0];

        // Si el concepto requiere detalles, primero eliminamos los detalles
        if (gasto.requiere_detalles === 1) {
            console.log(`🗑️ Eliminando detalles del gasto ID: ${id}`);
            await conn.query('DELETE FROM gastos_detalle WHERE gasto_id = ?', [id]);
        }

        // Luego eliminamos el gasto principal
        await conn.query('DELETE FROM gastos WHERE id = ?', [id]);

        res.json({
            mensaje: 'Gasto eliminado',
            detalles_eliminados: gasto.requiere_detalles === 1
        });
    } catch (error) {
        console.error('❌ Error al eliminar gasto:', error);
        res.status(500).json({ error: 'Error al eliminar el gasto' });
    }
};

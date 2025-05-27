const { conn } = require('../../db/dbconnection');

exports.getGasto = async (req, res) => {
    const { id } = req.params;

    try {
        const [gastos] = await conn.query(`
            SELECT g.*, c.nombre as concepto, c.requiere_detalles,
                  (SELECT COUNT(*) FROM gastos_detalle WHERE gasto_id = g.id) as tiene_detalles
            FROM gastos g
            JOIN conceptos c ON g.concepto_id = c.id
            WHERE g.id = ?
        `, [id]);

        if (gastos.length === 0) {
            return res.status(404).json({ error: 'Gasto no encontrado' });
        }

        res.json(gastos[0]);
    } catch (error) {
        console.error('Error al obtener gasto:', error);
        res.status(500).json({ error: 'Error al obtener el gasto' });
    }
};

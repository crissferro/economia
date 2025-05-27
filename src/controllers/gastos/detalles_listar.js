const { conn } = require('../../db/dbconnection');

exports.getDetalles = async (req, res) => {
    const { id } = req.params;

    try {
        const [detalles] = await conn.query(`
            SELECT gd.*, c.nombre as concepto_nombre
            FROM gastos_detalle gd
            JOIN conceptos c ON gd.concepto_id = c.id
            WHERE gd.gasto_id = ?
        `, [id]);

        res.json(detalles);
    } catch (error) {
        console.error('Error al obtener detalles:', error);
        res.status(500).json({ error: 'Error al obtener los detalles del gasto' });
    }
};

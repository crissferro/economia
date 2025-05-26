const { conn } = require('../../db/dbconnection');

module.exports.verificarRequiereDetalle = async (req, res) => {
    const conceptoId = req.params.id;

    try {
        const [result] = await conn.query(
            'SELECT requiere_detalles FROM conceptos WHERE id = ?',
            [conceptoId]
        );

        if (result.length === 0) {
            return res.status(404).json({ error: 'Concepto no encontrado' });
        }

        const requiereDetalle = result[0].requiere_detalles === 1;
        res.json({ requiere_detalle: requiereDetalle });

    } catch (error) {
        console.error('Error al verificar requiere_detalle:', error);
        res.status(500).json({ error: 'Error al consultar el concepto' });
    }
};

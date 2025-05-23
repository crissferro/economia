const { conn } = require('../../db/dbconnection');

module.exports.crearConcepto = async (req, res) => {
    try {
        const {
            rubro_id,
            nombre,
            tipo,
            requiere_vencimiento,
            requiere_detalle // ✅ Nombre corregido
        } = req.body;

        const [result] = await conn.query(
            'INSERT INTO conceptos (rubro_id, nombre, tipo, requiere_vencimiento, requiere_detalles) VALUES (?, ?, ?, ?, ?)',
            [
                rubro_id,
                nombre,
                tipo,
                requiere_vencimiento,
                requiere_detalle || 0 // ✅ Nombre corregido
            ]
        );

        res.status(201).json({ mensaje: 'Concepto creado con éxito' });
    } catch (error) {
        console.error('Error al crear concepto:', error);
        res.status(500).json({ error: 'Error al crear concepto' });
    }
};

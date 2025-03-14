const { conn } = require('../../db/dbconnection');

module.exports.crearConcepto = async (req, res) => {
    try {
        const { rubro_id, nombre, tipo, requiere_vencimiento } = req.body;

        const [result] = await conn.query(
            'INSERT INTO conceptos (rubro_id, nombre, tipo, requiere_vencimiento) VALUES (?, ?, ?, ?)',
            [rubro_id, nombre, tipo, requiere_vencimiento || 0]
        );

        res.status(201).json({ mensaje: 'Concepto creado con exito' });
    }
    catch (error) {
        console.error('Error al crear concepto:', error);
        res.status(500).json({ error: 'Error al crear concepto' });
    };
}
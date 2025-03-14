const { conn } = require('../../db/dbconnection');

module.exports.actualizarConcepto = async (req, res) => {
    const { id } = req.params;
    const { nombre, rubro_id, tipo, requiere_vencimiento } = req.body;

    // Validar que todos los campos requeridos están presentes
    if (!nombre || !rubro_id || !tipo || requiere_vencimiento === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        // Ejecutar la consulta de actualización
        await conn.query(
            'UPDATE conceptos SET nombre = ?, rubro_id = ?, tipo = ?, requiere_vencimiento = ? WHERE id = ?',
            [nombre, rubro_id, tipo, requiere_vencimiento, id]
        );

        res.json({ mensaje: 'Concepto actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar concepto:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};
const { conn } = require('../../db/dbconnection');

// Obtener los datos del concepto y renderizar la página de modificación
module.exports.getModificar = async (req, res) => {
    const { id } = req.params;

    try {
        const [concepto] = await conn.query(
            'SELECT id, rubro_id, nombre, tipo, requiere_vencimiento FROM conceptos WHERE id = ?',
            [id]
        );

        if (concepto.length === 0) {
            return res.status(404).json({ error: "Concepto no encontrado" });
        }

        res.render('modificar_concepto', { concepto: concepto[0] });

    } catch (error) {
        console.error("Error al obtener concepto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

// Actualizar un concepto en la base de datos
module.exports.actualizarConcepto = async (req, res) => {
    const { id } = req.params;
    const { nombre, rubro_id, tipo, requiere_vencimiento } = req.body;

    if (!nombre || !rubro_id || !tipo || requiere_vencimiento === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        const [result] = await conn.query(
            'UPDATE conceptos SET nombre = ?, rubro_id = ?, tipo = ?, requiere_vencimiento = ? WHERE id = ?',
            [nombre, rubro_id, tipo, requiere_vencimiento, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Concepto no encontrado" });
        }

        res.json({ mensaje: "Concepto actualizado correctamente" });

    } catch (error) {
        console.error("Error al actualizar concepto:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};

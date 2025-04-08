const { conn } = require('../../db/dbconnection');

module.exports.crearGasto = async (req, res) => {
    const { monto, mes, anio, fecha_vencimiento, concepto_id, pagado } = req.body;
    const userId = req.user.id; // ✅ ID del usuario autenticado

    if (!monto || !mes || !anio || !concepto_id) {
        return res.status(400).json({ error: 'Todos los campos obligatorios' });
    }

    try {
        // Obtener el tipo de concepto desde la tabla 'conceptos'
        const [result] = await conn.query('SELECT tipo FROM conceptos WHERE id = ?', [concepto_id]);
        const tipo = result[0].tipo;  // "ingreso" o "egreso"

        // Obtener la fecha actual en formato YYYY-MM-DD
        const fechaHoy = new Date().toISOString().split('T')[0];

        await conn.query(
            'INSERT INTO gastos (fecha, monto, mes, anio, fecha_vencimiento, pagado, concepto_id, tipo, users_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [fechaHoy, monto, mes, anio, fecha_vencimiento || null, pagado || false, concepto_id, tipo, userId]
        );

        res.status(201).json({ mensaje: 'Gasto registrado' });
    } catch (error) {
        console.error("Error al insertar gasto:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};


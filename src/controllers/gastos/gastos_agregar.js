const { conn } = require('../../db/dbconnection');

module.exports.crearGasto = async (req, res) => {
    const { monto, mes, anio, fecha_vencimiento, concepto_id, pagado, detalles } = req.body;
    const userId = req.user.id;

    if (!monto || !mes || !anio || !concepto_id) {
        return res.status(400).json({ error: 'Todos los campos obligatorios' });
    }

    try {
        const [result] = await conn.query('SELECT tipo FROM conceptos WHERE id = ?', [concepto_id]);
        const tipo = result[0].tipo;

        const fechaHoy = new Date().toISOString().split('T')[0];

        const [insertResult] = await conn.query(
            'INSERT INTO gastos (fecha, monto, mes, anio, fecha_vencimiento, pagado, concepto_id, tipo, users_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [fechaHoy, monto, mes, anio, fecha_vencimiento || null, pagado || false, concepto_id, tipo, userId]
        );

        const gastoId = insertResult.insertId;

        if (Array.isArray(detalles) && detalles.length > 0) {
            for (const d of detalles) {
                await conn.query(
                    'INSERT INTO gastos_detalle (gasto_id, concepto_id, monto) VALUES (?, ?, ?)',
                    [gastoId, d.concepto, d.monto]
                );
            }
        }

        res.status(201).json({ mensaje: 'Gasto registrado con detalles', gasto_id: gastoId });
    } catch (error) {
        console.error("Error al insertar gasto:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

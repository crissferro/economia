const { conn } = require('../../db/dbconnection');

module.exports.crearGasto = async (req, res) => {
    const { monto, mes, anio, fecha_vencimiento, concepto_id, pagado } = req.body;

    if (!monto || !mes || !anio || !concepto_id) {
        return res.status(400).json({ error: 'Todos los campos obligatorios' });
    }

    try {
        await conn.query(
            'INSERT INTO gastos (monto, mes, anio, fecha_vencimiento, pagado, concepto_id) VALUES (?, ?, ?, ?, ?, ?)',
            [monto, mes, anio, fecha_vencimiento || null, pagado || false, concepto_id]
        );
        res.status(201).json({ mensaje: 'Gasto registrado' });
    } catch (error) {
        console.error("Error al insertar gasto:", error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
};

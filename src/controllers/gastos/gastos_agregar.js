const { conn } = require('../../db/dbconnection');

module.exports.crearGasto = async (req, res) => {
    const { descripcion, monto, fecha, pagado, concepto_id } = req.body;

    if (!descripcion || !monto || !fecha || !concepto_id) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    await conn.query(
        'INSERT INTO gastos (descripcion, monto, fecha, pagado, concepto_id) VALUES (?, ?, ?, ?, ?)',
        [descripcion, monto, fecha, pagado, concepto_id]
    );
    res.status(201).json({ mensaje: 'Gasto registrado' });
};
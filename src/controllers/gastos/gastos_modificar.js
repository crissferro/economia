const { conn } = require('../../db/dbconnection');

module.exports.actualizarGasto = async (req, res) => {
    const { id } = req.params;
    const { descripcion, monto, fecha, pagado } = req.body;

    await conn.query(
        'UPDATE gastos SET descripcion = ?, monto = ?, fecha = ?, pagado = ? WHERE id = ?',
        [descripcion, monto, fecha, pagado, id]
    );
    res.json({ mensaje: 'Gasto actualizado' });
};
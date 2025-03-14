const { conn } = require('../../db/dbconnection');

module.exports.eliminarGasto = async (req, res) => {
    const { id } = req.params;
    await conn.query('DELETE FROM gastos WHERE id = ?', [id]);
    res.json({ mensaje: 'Gasto eliminado' });
};
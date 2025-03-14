const { conn } = require('../../db/dbconnection');

module.exports.eliminarConcepto = async (req, res) => {
    const { id } = req.params;
    await conn.query('DELETE FROM conceptos WHERE id = ?', [id]);
    res.json({ mensaje: 'Concepto eliminado' });
};
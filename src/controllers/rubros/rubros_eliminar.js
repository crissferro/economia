const { conn } = require('../../db/dbconnection');

module.exports.eliminarRubro = async (req, res) => {
    const { id } = req.params;
    await conn.query('DELETE FROM rubros WHERE id = ?', [id]);
    res.json({ mensaje: 'Rubro eliminado' });
};

const { conn } = require('../../db/dbconnection');

module.exports.actualizarRubro = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    await conn.query('UPDATE rubros SET nombre = ? WHERE id = ?', [nombre, id]);
    res.json({ mensaje: 'Rubro actualizado' });
};
const { conn } = require('../../db/dbconnection');

module.exports.crearRubro = async (req, res) => {
    const sql = `
        INSERT INTO rubros (nombre) VALUES (?)
    `
    const creado = await conn.query(sql, [req.body.nombre]);
    console.log('Rubro agregado:', creado);
    res.redirect(/rubros/)
}
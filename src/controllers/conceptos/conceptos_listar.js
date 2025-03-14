const { conn } = require('../../db/dbconnection');

module.exports.getConceptos = async (req, res) => {
    const [conceptos] = await conn.query('SELECT * FROM conceptos');
    res.json(conceptos);
};
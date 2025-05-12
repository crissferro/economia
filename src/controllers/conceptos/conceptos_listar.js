const { conn } = require('../../db/dbconnection');

module.exports.getConceptos = async (req, res) => {
    //   const [conceptos] = await conn.query('SELECT * FROM conceptos');
    //   res.json(conceptos);

    try {
        const [conceptos] = await conn.query('SELECT * FROM conceptos');
        res.json(conceptos);
    } catch (error) {
        console.error('Error al obtener conceptos:', error);
        res.status(500).json({ mensaje: 'Error al obtener conceptos' });
    }


};
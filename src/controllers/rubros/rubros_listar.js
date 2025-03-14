const { conn } = require('../../db/dbconnection');

module.exports = {
    getRubros: async (req, res) => {
        try {
            const [rubro] = await conn.query('SELECT * FROM rubros');
            res.json(rubro);
        } catch (error) {
            console.error('Error al obtener rubros:', error);
            res.status(500).json({ error: 'Error al obtener rubros' });
        }
    }
}
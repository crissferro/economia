const { conn } = require('../../db/dbconnection');

module.exports = {
    getRubros: async (req, res) => {
        try {
            const [rubros] = await conn.query('SELECT * FROM rubros');
            res.json(rubros);
        } catch (error) {
            console.error('Error al obtener rubros:', error);
            res.status(500).json({ error: 'Error al obtener rubros' });
        }
    },

    getModificar: async (req, res) => {
        try {
            const [modificar] = await conn.query(`SELECT * FROM conceptos WHERE id=?`, req.params.id);
            const [rubros] = await conn.query('SELECT * FROM rubros');

            res.render('modificar_concepto', {
                tituloDePagina: 'Página para Modificar Conceptos',
                registro: modificar[0],
                rubros
            });
        } catch (error) {
            console.error('Error al obtener datos para modificar:', error);
            res.status(500).send('Error interno del servidor');
        }
    },

    actualizarConcepto: async (req, res) => {
        const sql = `UPDATE conceptos SET nombre=?, rubro_id=?, tipo=?, requiere_vencimiento=? WHERE id=?`
        const { idMod, nombre, rubro_id, tipo, requiere_vencimiento } = req.body
        try {
            const modificado = await conn.query(sql, [nombre, rubro_id, tipo, requiere_vencimiento, idMod])
            console.log(modificado)
            res.redirect('/conceptos.html')
        } catch (error) {
            console.error('Error al actualizar Concepto:', error);
            res.status(500).send('Error interno del servidor');
        }
    },
}
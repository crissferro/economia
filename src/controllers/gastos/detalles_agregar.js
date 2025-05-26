const { conn } = require('../../db/dbconnection');

exports.agregarDetalles = (req, res) => {
    const gastoId = req.params.id;
    const detalles = req.body.detalles; // array [{ descripcion, monto }]

    if (!Array.isArray(detalles)) {
        return res.status(400).json({ error: 'Formato de datos incorrecto' });
    }

    const valores = detalles.map(det => [gastoId, det.descripcion, det.monto]);

    const sql = 'INSERT INTO detalle_gasto (gasto_id, monto) VALUES ?';

    conn.query(sql, [valores], (err, resultado) => {
        if (err) {
            console.error('Error al insertar detalles:', err);
            return res.status(500).json({ error: 'Error al insertar detalles' });
        }

        res.json({ mensaje: 'Detalles agregados correctamente', inserted: resultado.affectedRows });
    });
};

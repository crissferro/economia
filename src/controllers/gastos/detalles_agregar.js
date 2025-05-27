const { conn } = require('../../db/dbconnection');

exports.agregarDetalles = (req, res) => {
    console.log('➡️ POST recibido para gasto ID:', req.params.id);
    console.log('➡️ Body recibido:', req.body);

    const gastoId = req.params.id;
    const detalles = Array.isArray(req.body) ? req.body : req.body.detalles;

    if (!Array.isArray(detalles)) {
        console.error('❌ Formato incorrecto en detalles');
        return res.status(400).json({ error: 'Formato de datos incorrecto' });
    }

    const valores = detalles.map(det => [gastoId, det.concepto_id, det.monto]);
    console.log('➡️ Valores a insertar:', valores);

    const sql = 'INSERT INTO gastos_detalle (gasto_id, concepto_id, monto) VALUES ?';

    conn.query(sql, [valores], (err, resultado) => {
        if (err) {
            console.error('❌ Error al insertar detalles:', err);
            // Esto asegura que no queda "pending"
            return res.status(500).json({ error: 'Error en la base de datos' });
        }

        console.log('✅ Detalles insertados');
        res.status(200).json({ mensaje: 'OK', filas: resultado.affectedRows });
    });
};

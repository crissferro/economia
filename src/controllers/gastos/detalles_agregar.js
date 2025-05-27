const { conn } = require('../../db/dbconnection');

exports.agregarDetalles = async (req, res) => {
    console.log('➡️ POST recibido para gasto ID:', req.params.id);
    console.log('➡️ Body recibido:', req.body);

    const gastoId = req.params.id;
    const detalles = Array.isArray(req.body) ? req.body : req.body.detalles;

    if (!Array.isArray(detalles)) {
        console.error('❌ Formato incorrecto en detalles');
        return res.status(400).json({ error: 'Formato de datos incorrecto' });
    }

    try {
        // Primero, eliminar detalles existentes
        await conn.query('DELETE FROM gastos_detalle WHERE gasto_id = ?', [gastoId]);

        // Luego, insertar los nuevos detalles
        if (detalles.length > 0) {
            const valores = detalles.map(det => [gastoId, det.concepto_id, det.monto]);
            console.log('➡️ Valores a insertar:', valores);

            console.log('⏳ Iniciando consulta a la base de datos...');
            const sql = 'INSERT INTO gastos_detalle (gasto_id, concepto_id, monto) VALUES ?';

            // Usar la API de promesas correctamente
            const [resultado] = await conn.query(sql, [valores]);

            console.log('✅ Detalles insertados correctamente');
            console.log('✅ Enviando respuesta al cliente');
        } else {
            console.log('✅ No hay detalles para insertar, se eliminaron los existentes');
        }

        return res.status(200).json({ mensaje: 'Detalles actualizados correctamente' });
    } catch (error) {
        console.error('❌ Error capturado:', error);
        return res.status(500).json({ error: error.message });
    }
};

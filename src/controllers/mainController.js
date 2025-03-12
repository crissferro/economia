const { conn } = require('../db/dbconnection');


// 🔹 LISTADO Dashboard
module.exports.getDashboard = async (req, res) => {
    const [dashboard] = await conn.query(`
        SELECT g.id, g.monto, g.fecha, g.pagado, c.nombre as concepto, r.nombre as rubro
        FROM gastos g
        JOIN conceptos c ON g.concepto_id = c.id
        JOIN rubros r ON c.rubro_id = r.id
    `);
    res.json(dashboard);
};



// 🔹 RUBROS (Categorías)
module.exports.getRubros = async (req, res) => {
    const [rubros] = await conn.query('SELECT * FROM rubros');
    res.json(rubros);
};

//agregar rubro

module.exports.crearRubro = async (req, res) => {
    try {
        const sql = `INSERT INTO rubros (nombre) VALUES (?)`;
        const [result] = await conn.query(sql, [req.body.nombre]);

        console.log('Rubro agregado:', result);
        res.status(201).json({ success: true, message: "Rubro creado correctamente", id: result.insertId });
    } catch (error) {
        console.error('Error al crear rubro:', error);
        res.status(500).json({ success: false, error: "Error al crear rubro" });
    }
};

module.exports.actualizarRubro = async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    await conn.query('UPDATE rubros SET nombre = ? WHERE id = ?', [nombre, id]);
    res.json({ mensaje: 'Rubro actualizado' });
};

module.exports.eliminarRubro = async (req, res) => {
    const { id } = req.params;
    await conn.query('DELETE FROM rubros WHERE id = ?', [id]);
    res.json({ mensaje: 'Rubro eliminado' });
};

// 🔹 CONCEPTOS (Subcategorías dentro de un Rubro)
module.exports.getConceptos = async (req, res) => {
    const [conceptos] = await conn.query('SELECT * FROM conceptos');
    res.json(conceptos);
};

module.exports.crearConcepto = async (req, res) => {
    try {
        const { rubro_id, nombre, tipo, requiere_vencimiento } = req.body;
        //validaciones
        /*if (!nombre || !tipo || !rubro_id) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        if (tipo !== 'ingreso' && tipo !== 'egreso') {
            return res.status(400).json({ error: 'Tipo debe ser "ingreso" o "egreso"' });
        }

        // Verificar si el concepto ya existe en el mismo rubro
        const [existe] = await pool.query(
            "SELECT id FROM conceptos WHERE nombre = ? AND rubro_id = ?",
            [nombre, rubro_id]
        );

        if (existe.length > 0) {
            return res.status(400).json({ error: "El concepto ya existe en este rubro" });
        }
            */

        //insertar nuevo concepto

        const [result] = await conn.query(
            'INSERT INTO conceptos (rubro_id, nombre, tipo, requiere_vencimiento) VALUES (?, ?, ?, ?)',
            [rubro_id, nombre, tipo, requiere_vencimiento || 0]
        );

        res.status(201).json({ mensaje: 'Concepto creado con exito' });
    }
    catch (error) {
        console.error('Error al crear concepto:', error);
        res.status(500).json({ error: 'Error al crear concepto' });
    };
}

module.exports.actualizarConcepto = async (req, res) => {
    const { id } = req.params;
    const { nombre, tipo, requiere_vencimiento } = req.body;

    await conn.query(
        'UPDATE conceptos SET nombre = ?, tipo = ?, requiere_vencimiento = ? WHERE id = ?',
        [nombre, tipo, requiere_vencimiento, id]
    );
    res.json({ mensaje: 'Concepto actualizado' });
};

module.exports.eliminarConcepto = async (req, res) => {
    const { id } = req.params;
    await conn.query('DELETE FROM conceptos WHERE id = ?', [id]);
    res.json({ mensaje: 'Concepto eliminado' });
};



// 🔹 GASTOS (Movimientos de dinero)
module.exports.getCargaGastos = async (req, res) => {
    const [gastos] = await conn.query(`
        SELECT g.id, g.descripcion, g.monto, g.fecha, g.pagado, c.nombre as concepto
        FROM gastos g
        JOIN conceptos c ON g.concepto_id = c.id
    `);
    res.json(gastos);
};

module.exports.crearGasto = async (req, res) => {
    const { descripcion, monto, fecha, pagado, concepto_id } = req.body;

    if (!descripcion || !monto || !fecha || !concepto_id) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    await conn.query(
        'INSERT INTO gastos (descripcion, monto, fecha, pagado, concepto_id) VALUES (?, ?, ?, ?, ?)',
        [descripcion, monto, fecha, pagado, concepto_id]
    );
    res.status(201).json({ mensaje: 'Gasto registrado' });
};

module.exports.actualizarGasto = async (req, res) => {
    const { id } = req.params;
    const { descripcion, monto, fecha, pagado } = req.body;

    await conn.query(
        'UPDATE gastos SET descripcion = ?, monto = ?, fecha = ?, pagado = ? WHERE id = ?',
        [descripcion, monto, fecha, pagado, id]
    );
    res.json({ mensaje: 'Gasto actualizado' });
};

module.exports.eliminarGasto = async (req, res) => {
    const { id } = req.params;
    await conn.query('DELETE FROM gastos WHERE id = ?', [id]);
    res.json({ mensaje: 'Gasto eliminado' });
};

// 🔹 LISTADO DE GASTOS
module.exports.getListado = async (req, res) => {
    const [listado] = await conn.query(`
        SELECT g.id, g.descripcion, g.monto, g.fecha, g.pagado, c.nombre as concepto, r.nombre as rubro
        FROM gastos g
        JOIN conceptos c ON g.concepto_id = c.id
        JOIN rubros r ON c.rubro_id = r.id
    `);
    res.json(listado);
};

module.exports.getDetalleGasto = async (req, res) => {
    const { id } = req.params;
    const [[detalle]] = await conn.query(`
        SELECT g.id, g.descripcion, g.monto, g.fecha, g.pagado, c.nombre as concepto, r.nombre as rubro
        FROM gastos g
        JOIN conceptos c ON g.concepto_id = c.id
        JOIN rubros r ON c.rubro_id = r.id
        WHERE g.id = ?
    `, [id]);

    if (!detalle) return res.status(404).json({ error: 'Gasto no encontrado' });

    res.json(detalle);
};

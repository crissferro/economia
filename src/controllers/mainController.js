const { conn } = require('../db/dbconnection');

// 🔹 RUBROS (Categorías)
module.exports.getRubros = async (req, res) => {
    const [rubros] = await conn.query('SELECT * FROM rubros');
    res.json(rubros);
};

module.exports.crearRubro = async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) return res.status(400).json({ error: 'El nombre del rubro es obligatorio' });

    await conn.query('INSERT INTO rubros (nombre) VALUES (?)', [nombre]);
    res.status(201).json({ mensaje: 'Rubro creado correctamente' });
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
    const { nombre, tipo, requiere_vencimiento, rubro_id } = req.body;

    if (!nombre || !tipo || !rubro_id) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    await conn.query(
        'INSERT INTO conceptos (nombre, tipo, requiere_vencimiento, rubro_id) VALUES (?, ?, ?, ?)',
        [nombre, tipo, requiere_vencimiento, rubro_id]
    );
    res.status(201).json({ mensaje: 'Concepto creado' });
};

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

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


// 🔹 CONCEPTOS (Subcategorías dentro de un Rubro)

//listar conceptos

module.exports.getConceptos = async (req, res) => {
    const [conceptos] = await conn.query('SELECT * FROM conceptos');
    res.json(conceptos);
};

//agregar conceptos

module.exports.crearConcepto = async (req, res) => {
    try {
        const { rubro_id, nombre, tipo, requiere_vencimiento } = req.body;

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

//modificar conceptos

module.exports.actualizarConcepto = async (req, res) => {
    const { id } = req.params;
    const { nombre, rubro_id, tipo, requiere_vencimiento } = req.body;

    // Validar que todos los campos requeridos están presentes
    if (!nombre || !rubro_id || !tipo || requiere_vencimiento === undefined) {
        return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    try {
        // Ejecutar la consulta de actualización
        await conn.query(
            'UPDATE conceptos SET nombre = ?, rubro_id = ?, tipo = ?, requiere_vencimiento = ? WHERE id = ?',
            [nombre, rubro_id, tipo, requiere_vencimiento, id]
        );

        res.json({ mensaje: 'Concepto actualizado correctamente' });

    } catch (error) {
        console.error('Error al actualizar concepto:', error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
};


//eliminar conceptos

module.exports.eliminarConcepto = async (req, res) => {
    const { id } = req.params;
    await conn.query('DELETE FROM conceptos WHERE id = ?', [id]);
    res.json({ mensaje: 'Concepto eliminado' });
};



// 🔹 GASTOS (Movimientos de dinero)

//listar gastos

module.exports.getCargaGastos = async (req, res) => {
    const [gastos] = await conn.query(`
        SELECT g.id, g.descripcion, g.monto, g.fecha, g.pagado, c.nombre as concepto
        FROM gastos g
        JOIN conceptos c ON g.concepto_id = c.id
    `);
    res.json(gastos);
};

//agregar gastos

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

//modificar gastos

module.exports.actualizarGasto = async (req, res) => {
    const { id } = req.params;
    const { descripcion, monto, fecha, pagado } = req.body;

    await conn.query(
        'UPDATE gastos SET descripcion = ?, monto = ?, fecha = ?, pagado = ? WHERE id = ?',
        [descripcion, monto, fecha, pagado, id]
    );
    res.json({ mensaje: 'Gasto actualizado' });
};

//eliminar gastos

module.exports.eliminarGasto = async (req, res) => {
    const { id } = req.params;
    await conn.query('DELETE FROM gastos WHERE id = ?', [id]);
    res.json({ mensaje: 'Gasto eliminado' });
};


// 🔹 LISTADO DE GASTOS

//listar listado de gastos

module.exports.getListado = async (req, res) => {
    const [listado] = await conn.query(`
        SELECT g.id, g.descripcion, g.monto, g.fecha, g.pagado, c.nombre as concepto, r.nombre as rubro
        FROM gastos g
        JOIN conceptos c ON g.concepto_id = c.id
        JOIN rubros r ON c.rubro_id = r.id
    `);
    res.json(listado);
};

// listado detallado de gastos

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

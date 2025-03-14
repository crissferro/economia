const { conn } = require('../../db/dbconnection');

module.exports.getCargaGastos = async (req, res) => {
    const [gastos] = await conn.query(`
        SELECT g.id, g.descripcion, g.monto, g.fecha, g.pagado, c.nombre as concepto
        FROM gastos g
        JOIN conceptos c ON g.concepto_id = c.id
    `);
    res.json(gastos);
};
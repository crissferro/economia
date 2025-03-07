const { conn } = require('../db/dbconnection');

module.exports = {

    getListado: async (req, res) => {
        try {
            console.log('Fetching list...')
            const [registros] = await conn.query(`SELECT 
                    p.id, 
                    p.nombre, 
                    p.descripcion, 
                    p.precio, 
                    tp.nombre AS tipoProducto, 
                    pr.alias AS proveedor
                FROM 
                    productos p
                JOIN 
                    tipoProducto tp ON p.id_tipoProducto = tp.id
                JOIN 
                    proveedor pr ON p.alias = pr.id;`);
            console.log('Fetched list:', registros);
            res.json(registros);
        } catch (error) {
            console.error('Error fetching list:', error)
            throw error
        } finally {
            conn.releaseConnection()
        }
    },

    getProveedores: async (req, res) => {
        try {
            const [proveedores] = await conn.query('SELECT * FROM proveedor');
            res.json(proveedores);
        } catch (error) {
            console.error('Error al obtener proveedores:', error);
            res.status(500).send('Error al obtener proveedores');
        }
    },

    getTiposProducto: async (req, res) => {
        try {
            const [tiposProducto] = await conn.query('SELECT * FROM tipoProducto');
            res.json(tiposProducto);
        } catch (error) {
            console.error('Error al obtener tipos de productos:', error);
            res.status(500).send('Error al obtener tipos de productos');
        }
    },

    getProductos: async (req, res) => {
        try {
            const [productos] = await conn.query(`
                SELECT 
                    p.id, 
                    p.nombre, 
                    p.descripcion, 
                    p.precio, 
                    tp.id AS id_tipoProducto,
                    tp.nombre AS tipoProducto, 
                    pr.alias AS proveedor
                FROM 
                    productos p
                JOIN 
                    tipoProducto tp ON p.id_tipoProducto = tp.id
                JOIN 
                    proveedor pr ON p.alias = pr.id;
            `);
            res.json(productos);
        } catch (error) {
            console.error('Error fetching products:', error);
            res.status(500).send('Error al obtener productos');
        }
    },


    crearRegistro: async (req, res) => {
        const sql = `
                INSERT INTO productos (nombre, descripcion, precio, id_tipoProducto, alias)
                VALUES (?, ?, ?, ?, ?)`;
        const creado = await conn.query(sql, [
            req.body.nombre,
            req.body.descripcion,
            parseFloat(req.body.precio),
            req.body.id_tipoProducto,
            req.body.alias
        ])
        console.log('Producto agregado:', creado);
        res.redirect('/listado.html');

    },

    getModificar: async (req, res) => {
        try {
            const [modificar] = await conn.query(`SELECT * FROM productos WHERE id=?`, req.params.id);
            const [tiposProducto] = await conn.query('SELECT * FROM tipoProducto');
            const [proveedores] = await conn.query('SELECT * FROM proveedor');

            res.render('modificar', {
                tituloDePagina: 'Página para Modificar Productos',
                registro: modificar[0],
                tiposProducto,
                proveedores
            });
        } catch (error) {
            console.error('Error al obtener datos para modificar:', error);
            res.status(500).send('Error interno del servidor');
        }
    },

    actualizar: async (req, res) => {
        const sql = `UPDATE productos SET nombre=?, descripcion=?, precio=?, id_tipoProducto=?, alias=? WHERE id=?`
        const { idMod, nombre, descripcion, precio, id_tipoProducto, alias } = req.body
        try {
            const modificado = await conn.query(sql, [nombre, descripcion, precio, id_tipoProducto, alias, idMod])
            console.log(modificado)
            res.redirect('/listado.html')
        } catch (error) {
            console.error('Error al actualizar producto:', error);
            res.status(500).send('Error interno del servidor');
        }
    },


    eliminar: async (req, res) => {
        const eliminado = await conn.query(`DELETE FROM productos WHERE id=?`, req.body.idEliminar)
        console.log(eliminado)
        res.redirect('/listado.html')
    },

}

/*
const express = require('express');
const router = express.Router();
const path = require('path');
const auth = require('../config/auth'); // Middleware de autenticación

const gastosAgregar = require('../controllers/gastos/gastos_agregar');
const gastosModificar = require('../controllers/gastos/gastos_modificar');
const gastosEliminar = require('../controllers/gastos/gastos_eliminar');
const gastosListar = require('../controllers/gastos/gastos_listar');


// Carga de Gastos
router.get('/', gastosListar.getGastos); // Ver listado de gastos
router.post('/', auth, gastosAgregar.crearGasto); // Crear nuevo gasto
router.put('/:id', auth, gastosModificar.actualizarGasto); // Modificar gasto
router.delete('/:id', gastosEliminar.eliminarGasto); // Eliminar gasto



module.exports = router;
*/


const express = require('express');
const router = express.Router();
const auth = require('../config/auth'); // Middleware de autenticación

const gastosAgregar = require('../controllers/gastos/gastos_agregar');
const gastosModificar = require('../controllers/gastos/gastos_modificar');
const gastosEliminar = require('../controllers/gastos/gastos_eliminar');
const gastosListar = require('../controllers/gastos/gastos_listar');
const conn = require('../db/dbconnection'); // Conexión a la base de datos

// Ver listado de gastos
router.get('/', async (req, res) => {
    try {
        const { mes, anio, rubro, concepto, pagado } = req.query;
        let query = `SELECT g.*, c.nombre_concepto, r.nombre_rubro 
                     FROM movimientos g
                     JOIN conceptos c ON g.id_concepto = c.id
                     JOIN rubros r ON c.id_rubro = r.id
                     WHERE 1 = 1`;

        let params = [];

        if (mes) {
            query += ` AND MONTH(g.fecha) = ?`;
            params.push(mes);
        }

        if (anio) {
            query += ` AND YEAR(g.fecha) = ?`;
            params.push(anio);
        }

        if (rubro) {
            query += ` AND r.id = ?`;
            params.push(rubro);
        }

        if (concepto) {
            query += ` AND c.id = ?`;
            params.push(concepto);
        }

        if (pagado !== '') {
            query += ` AND g.pagado = ?`;
            params.push(pagado);
        }

        const [gastos] = await conn.execute(query, params);
        res.json(gastos);
    } catch (error) {
        console.error('Error al obtener gastos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Crear nuevo gasto
router.post('/', auth, gastosAgregar.crearGasto);

// Modificar gasto
router.put('/:id', auth, async (req, res) => {
    try {
        const { id } = req.params;
        const [movimiento] = await conn.query('SELECT pagado FROM movimientos WHERE id = ?', [id]);

        if (!movimiento) {
            return res.status(404).json({ error: 'Movimiento no encontrado' });
        }

        if (movimiento.pagado) {
            return res.status(400).json({ error: 'No se puede modificar un movimiento marcado como pagado' });
        }

        await gastosModificar.actualizarGasto(req, res);
    } catch (error) {
        console.error('Error al modificar gasto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar gasto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Verificar si el concepto tiene movimientos registrados
        const [movimientos] = await conn.query('SELECT COUNT(*) AS total FROM movimientos WHERE id_concepto = ?', [id]);

        if (movimientos.total > 0) {
            return res.status(400).json({ error: 'No se puede eliminar un concepto con movimientos registrados' });
        }

        await gastosEliminar.eliminarGasto(req, res);
    } catch (error) {
        console.error('Error al eliminar gasto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

module.exports = router;

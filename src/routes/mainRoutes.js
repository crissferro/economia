const express = require('express')
const router = express.Router()
const controladores = require(`../controllers/mainController`)
const multer = require('multer')
const path = require('path')


const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, `public/img/`)
	},
	filename: (req, file, cb) => {
		console.log(file)
		cb(null.Date.now() + "_" + file.originalname)
	}
})

const uploadFile = multer({ storage })

router.get("/listado", controladores.getListado)
router.post('/listado', uploadFile.single('archivo'), controladores.crearRegistro)
router.get('/modificar/:id', controladores.getModificar)
router.put('/modificar', controladores.actualizar)
router.delete('/listado', controladores.eliminar)

// Rutas para obtener datos de proveedores y tipos de productos
router.get('/proveedores', controladores.getProveedores);
router.get('/tiposProducto', controladores.getTiposProducto);

router.get('/api/productos', controladores.getProductos);

module.exports = router;
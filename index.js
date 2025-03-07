const express = require(`express`)
const session = require('express-session')
const override = require('method-override')
const rutas = require('./src/routes/mainRoutes.js')
const login = require('./src/routes/loginRoutes.js')
const auth = require('./src/config/auth.js')

const app = express()
const port = process.env.PORT || 8080; // Corrección en la asignación del puerto

// Configurar EJS como motor de vistas
app.set('view engine', 'ejs')
app.set('views', (__dirname + '/src/views'))

// Middlewares
app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(override('_metodo'))

// Configurar sesión antes de las rutas
app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true
}))

// Definir rutas
app.use('/login', login) // /login/login o /login/registro
app.use('/', auth) // Middleware de autenticación (si es necesario)
app.use('/', rutas) // Rutas generales

// Middleware para manejar errores 404
app.use((req, res) => {
    res.status(404).send(`<h1 style="color: red"> Recurso no encontrado!</h1>`)
})

const IP = '127.0.0.1';
app.listen(port, () => console.log(`Servidor corriendo en http://${IP}:${port}`))

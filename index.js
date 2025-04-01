const express = require(`express`)
const session = require('express-session')
const override = require('method-override')
const rubrosRoutes = require('./src/routes/rubrosRoutes');
const conceptosRoutes = require('./src/routes/conceptosRoutes');
const gastosRoutes = require('./src/routes/gastosRoutes');
const login = require('./src/routes/loginRoutes.js')
const auth = require('./src/config/auth.js')
const dashboardRoutes = require('./src/routes/dashboardRoutes');

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
app.use('/rubros', rubrosRoutes);
app.use('/conceptos', conceptosRoutes);
app.use('/gastos', gastosRoutes);
app.use('/dashboard', dashboardRoutes);


// Configurar sesión antes de las rutas
app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true
}))

// Definir rutas
app.use('/login', login) // /login/login o /login/registro
//app.use('/', auth) // Middleware de autenticación (si es necesario)
//app.use('/', rutas) // Rutas generales

// Middleware para manejar errores 404
app.use((req, res) => {
    res.status(404).send(`<h1 style="color: red"> Recurso no encontrado!</h1>`)
})

// Middleware para manejar errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

const IP = '127.0.0.1';
app.listen(port, () => console.log(`Servidor corriendo en http://${IP}:${port}`))

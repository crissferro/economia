const express = require('express');
const session = require('express-session');
const override = require('method-override');
const path = require('path');

const rubrosRoutes = require('./src/routes/rubrosRoutes');
const conceptosRoutes = require('./src/routes/conceptosRoutes');
const gastosRoutes = require('./src/routes/gastosRoutes');
const login = require('./src/routes/loginRoutes');
const auth = require('./src/config/auth');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const telegramRoutes = require('./src/routes/telegram');

const app = express();
const port = process.env.PORT || 8080;

// Middlewares generales
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(override('_metodo'));

// Servir archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// Configurar sesión antes de las rutas
app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true
}));

// Motor de vistas EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Rutas
app.use('/api/telegram', telegramRoutes);
app.use('/rubros', rubrosRoutes);
app.use('/conceptos', conceptosRoutes);
app.use('/gastos', gastosRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/login', login);
// app.use('/', auth); // Middleware de autenticación si fuera necesario
// app.use('/', rutas); // Rutas generales

// Middleware 404
app.use((req, res) => {
    res.status(404).send('<h1 style="color: red"> Recurso no encontrado!</h1>');
});

// Middleware para errores generales
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

const IP = '127.0.0.1';
app.listen(port, () => console.log(`Servidor corriendo en http://${IP}:${port}`));

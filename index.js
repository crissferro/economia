const express = require('express');
const session = require('express-session');
const override = require('method-override');
const path = require('path');
const cors = require('cors'); // <-- agregado
require('dotenv').config();

// Rutas
const rubrosRoutes = require('./src/routes/rubrosRoutes');
const conceptosRoutes = require('./src/routes/conceptosRoutes');
const gastosRoutes = require('./src/routes/gastosRoutes');
const login = require('./src/routes/loginRoutes');
const auth = require('./src/config/auth');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const telegramRoutes = require('./src/routes/telegram');
const configRoutes = require('./src/routes/configRoutes');

const app = express();
const port = process.env.PORT || 8080;

// ✅ Middleware CORS
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'http://crissferro.net.ar'
        : ['http://localhost:8080', 'http://192.168.1.222:8080'],
    credentials: true
};
app.use(cors(corsOptions));

// Configuración
app.use('/', configRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(override('_metodo'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

const backendUrl = process.env.NODE_ENV === 'production'
  ? process.env.BACKEND_URL_PROD
  : process.env.BACKEND_URL_DEV;
app.locals.backendUrl = backendUrl;

// Rutas
app.use('/api/telegram', telegramRoutes);
app.use('/rubros', rubrosRoutes);
app.use('/conceptos', conceptosRoutes);
app.use('/gastos', gastosRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/login', login);

// Errores
app.use((req, res) => {
    res.status(404).send('<h1 style="color: red"> Recurso no encontrado!</h1>');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

const IP = '127.0.0.1';
app.listen(port, () => console.log(`Servidor corriendo en http://${IP}:${port}`));

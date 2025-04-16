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

// Determinar automáticamente el entorno y las URLs
const isProduction = process.env.NODE_ENV === 'production';
const backendUrl = isProduction ? process.env.BACKEND_URL_PROD : process.env.BACKEND_URL_DEV;


// ✅ Middleware CORS mejorado
const corsOptions = {
    origin: function(origin, callback) {
        // Lista de dominios permitidos
        const allowedOrigins = [
            'http://localhost:8080',
            'http://127.0.0.1:8080',
            'http://192.168.1.222:8080',
            'http://crissferro.net.ar',
            'http://crissferro.net.ar:8080'
        ];
        
        // Permitir peticiones sin origin (como las del navegador directamente)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            console.log('Origen bloqueado por CORS:', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
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

// Guardar la URL del backend para usarla en las plantillas
app.locals.backendUrl = backendUrl;

// Agregar middleware para debugging (solo en desarrollo)
if (!isProduction) {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.url}`);
        next();
    });
}

// Configuración - Mover después de los middleware básicos
app.use('/', configRoutes);

// Rutas
app.use('/api/telegram', telegramRoutes);
app.use('/rubros', rubrosRoutes);
app.use('/conceptos', conceptosRoutes);
app.use('/gastos', gastosRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/login', login);

// Ruta para verificar la configuración del servidor
app.get('/config', (req, res) => {
    res.json({
        environment: process.env.NODE_ENV,
        backendUrl: backendUrl,
        isProduction: isProduction
    });
});

// Errores
app.use((req, res) => {
    res.status(404).send('<h1 style="color: red"> Recurso no encontrado!</h1>');
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Algo salió mal!');
});

// IMPORTANTE: Cambiar para escuchar en todas las interfaces
app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en modo ${isProduction ? 'PRODUCCIÓN' : 'DESARROLLO'}`);
    console.log(`📡 Escuchando en: http://0.0.0.0:${port}`);
    console.log(`🔗 URL del backend: ${backendUrl}`);
});
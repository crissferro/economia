//creo un server estatico con express (modulo externo)

const express = require(`express`)
const session = require('express-session')
const override = require('method-override')
const rutas = require('./src/routes/mainRoutes.js')
const login = require('./src/routes/loginRoutes.js')
const app = express()
const auth = require('./src/config/auth.js')


const port = 8080 || process.env.PORT || 3000

app.set('view engine', 'ejs')
app.set('views', (__dirname + '/src/views'))

app.use(express.static(__dirname + '/public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(override('_metodo'));


//Es mejor ejecutar primero las rutas de login y luego las que necesiten 'auth'
app.use('/login', login) // /login/login o /login/registro
app.use('/', auth)
app.use('/', rutas)



app.use(session({
    secret: 'clave_secreta',
    resave: false,
    saveUninitialized: true
}));

//app.use('/admin', auth, rutasAdmin) // /admin/loquesea /admin/xyz


app.use((req, res, next) => {
    res.status(404).send(`<h1 style="color: red"> Recurso no encontrado!</h1>`)
})

const IP = '127.0.0.1';

app.listen(port, () => console.log(`Hola, estoy arriba en el puerto: ${port}`))
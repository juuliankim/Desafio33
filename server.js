const express = require('express')
const session = require('express-session')
const handlebars = require('express-handlebars')
const app = express()
const http = require('http')
const server = http.Server(app)
const io = require('socket.io')(server)
const normalize = require('normalizr').normalize
const schema = require('normalizr').schema
const productos = require('./api/productos')
const Mensajes = require('./api/mensajes')
const passport = require('passport')
// const bcrypt = require('bcrypt')
const FacebookStrategy = require('passport-local').Strategy
const dotenv = require('dotenv')
const User = require('./models/users')
const { fork } = require('child_process')
const numCPUs = require('os').cpus().length
const compression = require('compression')
const log4js = require('log4js')

dotenv.config()

log4js.configure({
    appenders: {
        miLoggerConsole: { type: "console" },
        miLoggerError: { type: 'file', filename: 'error.log' },
        miLoggerWarn: { type: 'file', filename: 'warn.log' }
    },
    categories: {
        default: { appenders: ["miLoggerConsole"], level: "trace" },
        consola: { appenders: ["miLoggerConsole"], level: "info" },
        error: { appenders: ["miLoggerError"], level: "error" },
        warn: { appenders: ["miLoggerWarn"], level: "warn" }
    }
})

const loggerConsola = log4js.getLogger('consola')
const loggerWarn = log4js.getLogger('warn')
const loggerError = log4js.getLogger('error')

require('./database/connection')

app.use(compression())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}))

app.use(express.static('public'))

const FACEBOOK_CLIENT_ID = " "
const FACEBOOK_CLIENT_SECRET = " "

if (process.argv[4] && process.argv[5]) {
    FACEBOOK_CLIENT_ID = process.argv[4];
    FACEBOOK_CLIENT_SECRET = process.argv[5];
} else {
    loggerConsola.warn('No se ingresaron los valores correctamente. Se procede a usar valores por defecto')
    loggerWarn.warn('No se ingresaron los valores correctamente. Se procede a usar valores por defecto')
    
    FACEBOOK_CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
    FACEBOOK_CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
}

passport.use(new FacebookStrategy({
    clientID: FACEBOOK_CLIENT_ID,
    clientSecret: FACEBOOK_CLIENT_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'photos', 'emails'],
    scope: ['email']
}, function (accessToken, refreshToken, profile, done) {
    let userProfile = profile._json;
    console.log(userProfile);
    return done(null, userProfile);
}))

passport.serializeUser(function (user, done) {
    done(null, user)
})

passport.deserializeUser(function (user, done) {
    done(null, user)
})

app.use(passport.initialize())
app.use(passport.session())

app.get('/info', (req, res) => {
    let informacion = {}
    informacion['Argumentos de entrada:'] = `${process.argv[2]} ${process.argv[3]} ${process.argv[4]}`
    informacion['Nombre de plataforma:'] = process.platform
    informacion['Version de Node:'] = process.version
    informacion['Uso de memoria:'] = process.memoryUsage()
    informacion['Path de ejecucion:'] = process.execPath
    informacion['Process id:'] = process.pid
    informacion['Carpeta corriente:'] = process.cwd()
    informacion['Numero de procesadores'] = numCPUs
    informacion['Puerto'] = process.argv[2]
    res.send(JSON.stringify(informacion, null, 4))
})

app.get('/random', (req, res) => {
    const numeroRandom = fork('./api/numeroRandom.js')
    let cantidad = 0
    if (req.query.cant & !isNaN(req.query.cant)) {
        cantidad = req.query.cant
    } else if (isNaN(req.query.cant)) {
        loggerError.error('No se ingresó un número en la ruta /random')
        res.send('Error:No se ingresó un número')
    } else {
        cantidad = 100000000
    }
    numeroRandom.send((cantidad).toString())
    numeroRandom.on("message", obj => {
        res.end(JSON.stringify(obj, null, 3))
    })
})

//

// const MongoStore = require('connect-mongo')
// const advancedOptions = {useNewUrlParser: true, useUnifiedTopology: true}

app.use((err, req, res, next) =>{
    console.error(err.message)
    return res.status(500).send('Algo se rompió!!')
})

app.engine('hbs', handlebars({
    extname: '.hbs',
    defaultLayout: 'index.hbs',
    layoutsDir: __dirname + '/views/layouts'
}))

app.set("view engine", "hbs")
app.set("views", "./views")

// app.use(session({
//     store: MongoStore.create({
//         mongoUrl: 'mongodb+srv://juliankim:coderhouse@cluster0.jiary.mongodb.net/myFirstDatabase?retryWrites=true&w=majority',
//         mongoOptions: advancedOptions
//     }),
//     secret: 'secret',
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//         maxAge: 600000
//     }
// }))

app.get('/auth/facebook', passport.authenticate('facebook'))

app.get('/auth/facebook/callback', passport.authenticate('facebook',
    {
        successRedirect: '/login',
        failureRedirect: '/faillogin'
    }
))

app.get('/login', (req, res) => {
    res.render('vista', {
        showLogin: false,
        showContent: true,
        bienvenida: req.user.name,
        email: req.user.email,
        urlImg: req.user.picture.data.url,
        showBienvenida: true
    })
})

app.get('/faillogin', (req, res) => {
    res.sendFile(__dirname + '/public/failLogin.html')
})

app.get('/logout', (req, res) => {
    req.logout();
    res.sendFile(__dirname + '/public/logout.html')
})

//

app.get('/signup', (req, res) => {
    res.render('register', {})
})

app.post('/signup', passport.authenticate('signup', { failureRedirect: '/failsignup' }), (req, res) => {
    var user = req.user;
    res.render('vista', { showLogin: false, showContent: true, bienvenida: user.username, showBienvenida: true });
})

app.get('/failsignup', (req, res) => {
    res.sendFile(__dirname + '/public/failSignup.html')
})

const productosRouter = require('./routes/productosRouter')
app.use('/api', productosRouter)
const mensajesRouter = require('./routes/mensajesRouter')
const { createHash } = require('crypto')
app.use('/api', mensajesRouter)

io.on('connection', async socket => {
    console.log('Usuario conectado')

    socket.on('nuevo-producto', nuevoProducto => {
        console.log(nuevoProducto)
        productos.guardar(nuevoProducto)
    })
    socket.emit('guardar-productos', () => {
        socket.on('notificacion', data => {
            console.log(data)
        })
    })

    socket.on("new-message", async function (data) {

        await Mensajes.guardar(data)

        let mensajesDB = await Mensajes.buscarTodo()     

        const autorSchema = new schema.Entity('autor', {}, { idAttribute: 'nombre' });

        const mensajeSchema = new schema.Entity('texto', {
            autor: autorSchema
        }, { idAttribute: '_id' })

        const mensajesSchema = new schema.Entity('mensajes', {
            msjs: [mensajeSchema]
        }, {idAttribute: 'id'})

        const mensajesNormalizados = normalize(mensajesDB, mensajesSchema)
        const messages = []
        messages.push(mensajesDB);

        console.log(mensajesDB)

        console.log(mensajesNormalizados)
            
        io.sockets.emit("messages", mensajesNormalizados)
    })
})

/* let PORT = 0
if (process.argv[2] && !isNaN(process.argv[2])) {
    PORT = process.argv[2]
} else if (isNaN(process.argv[2])) {
    loggerWarn.warn('No se ingresó un puerto válido, se usará el 8080') 
    PORT = 8080
} */

const PORT = process.env.PORT

const svr = server.listen(PORT, () => {
    loggerConsola.info(process.argv)
    loggerConsola.info(`servidor escuchando en http://localhost:${PORT}`)
})

server.on('error', error => {
    loggerError.error('error en el servidor:', error)
})
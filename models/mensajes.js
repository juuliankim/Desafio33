const mongoose = require('mongoose')

const schema = mongoose.Schema({
    autor: {
        id: { type: String },
        nombre: { type: String },
        apellido: { type: String },
        edad: { type: Number },
        alias: { type: String },
        avatar: { type: String }
    },
    fyh: { type: String },
    text: { type: String }
}, { strict: false })

const Mensaje = mongoose.model('mensajes', schema)

module.exports = Mensaje
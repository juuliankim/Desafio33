const mongoose = require('mongoose')

const schema = mongoose.Schema({
    username: {type: String, required: true, max: 50},
    password: {type: String, required: true}
})

const Usuario = mongoose.model('Users', schema)

module.exports = Usuario
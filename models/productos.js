const mongoose = require('mongoose')

const schema = mongoose.Schema({
    title: { type: String, required: true, max: 100 },
    price: { type: Number, required: true },
    thumbnail: { type: String, required: true, max: 100 }
});

const Producto = mongoose.model('productos', schema)

module.exports = Producto
const Producto = require('../models/productos')

class Productos {
    constructor() { }

    async listar() {
        try {
            return Producto.find({})
        } catch (error) {
            throw error
        }
    }

    async listarPorId(id) {
        try {
            return Producto.findById({ _id: id })
        } catch (error) {
            throw error
        }
    }

    async guardar(nuevoProducto) {
        try {
            console.log(nuevoProducto)
            return Producto.create(nuevoProducto)
        } catch (error) {
            throw error
        }
    }

    async actualizar(idProducto, nuevoProducto) {
        try {
            return Producto.findByIdAndUpdate(idProducto, nuevoProducto)
        } catch (error) {
            throw error
        }
    }

    async borrar(idProducto) {
        try {
            return Producto.findByIdAndDelete(idProducto)
        } catch (error) {
            throw error
        }
    }
}

module.exports = new Productos()
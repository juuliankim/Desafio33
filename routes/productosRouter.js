const express = require('express')
const router = express.Router()
const productos = require('../api/productos')

// // VISTA-TEST ** FAKER **
// routerProductos.get('/vista-test/', (req, res) => {
//     res.render('vista', { hayProductos: true, productos: Faker.generarProductos(10) })
// })

// routerProductos.get('/vista-test/:cant', (req, res) => {
//     let cantidad = req.params.cant
//     res.render('vista', { hayProductos: true, productos: Faker.generarProductos(cantidad) })
// })

// LISTAR PRODUCTOS
router.get('/listar', async (req, res) => {
    try {
        let result = await productos.listar();
        return res.json(result);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
})

// LISTAR PRODUCTOS POR ID
router.get('/listar/:id', async (req, res) => {

    try {
        let mensajeLista = await productos.listarPorId(req.params.id);
        res.json(mensajeLista)
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
})


// GUARDAR PRODUCTO
router.post('/guardar', async (req, res) => {
    try {
        let nuevoProducto = {};
        nuevoProducto.title = req.body.title;
        nuevoProducto.price = req.body.price;
        nuevoProducto.thumbnail = req.body.thumbnail;
        await productos.guardar(nuevoProducto)
        res.json(nuevoProducto)
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
})

//ACTUALIZAR PRODUCTO POR ID
router.put('/actualizar/:id', async (req, res) => {
    try {
        let nuevoProducto = await productos.actualizar(req.params.id, req.body);
        res.json(nuevoProducto);
    } catch (error) {
        return res.status(500).send({ error: error.message });
    }
})

// BORRAR PRODUCTO POR ID
router.delete('/borrar/:id', async (req, res) => {
    let productoBorrado = await productos.borrar(req.params.id);
    return res.json(productoBorrado);
})

module.exports = router
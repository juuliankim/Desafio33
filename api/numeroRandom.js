let resultado = {}

process.on("message", numero => {
    console.log(`Cantidad recibida: ${numero}`)
    function obtenerRandom(min, max) {
        return Math.floor(Math.random() * (max - min)) + min;
    }
    for (let i = 0; i < numero; i++) {
        let random = obtenerRandom(1, 1001)
        resultado[random] = (resultado[random] || 0) + 1
    }
    process.send(resultado);
})
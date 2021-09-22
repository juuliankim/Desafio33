const socket = io.connect()
const schema = normalizr.schema
const denormalize = normalizr.denormalize

function render(data) {
    console.log(JSON.stringify('!!!!!DATA !!!!!' + JSON.stringify(data.mensajes, null, 3)))

    let html = data.mensajes.map(function (elem, index) {
       
        return (`
        <div>
            <b style="color:blue;">${elem.autor.email}</b> 
            [<span style="color:brown;">${elem.fyh}</span>] : 
            <i style="color:green;">${elem.texto}</i>
        </div>
    `)
    }).join(' ')
    document.getElementById('messages').innerHTML = html
}


socket.on('messages', function (data) {

    const autorSchema = new schema.Entity('autor', {}, { idAttribute: 'nombre' })

    const mensajeSchema = new schema.Entity('texto', {
        autor: autorSchema
    }, { idAttribute: '_id' })

    const mensajesSchema = new schema.Entity('mensajes', {
        msjs: [mensajeSchema]
    }, { idAttribute: 'id' })

    const desnormalizado = denormalize(data.result, mensajesSchema, data.entities);
    console.log("!!!!!DESNORMALIZADO!!!!!" + JSON.stringify(desnormalizado, null, 3))
    render(desnormalizado);
});

function addMessage(e) {
    let mensaje = {
        autor: {
            email: document.getElementById('email').value,
            nombre: document.getElementById('nombre').value,
            apellido: document.getElementById('apellido').value,
            edad: document.getElementById('edad').value,
            alias: document.getElementById('alias').value,
            avatar: document.getElementById('avatar').value,
        },
        fyh: new Date().toLocaleString(),
        texto: document.getElementById('texto').value
    }

    socket.emit('new-message', mensaje)
    return false
}
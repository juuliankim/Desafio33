socket.on('guardar-productos', () => {

  const formProductos = document.querySelector('#form-productos')
  formProductos.addEventListener('submit', (e) => {
    e.preventDefault()

    let nuevoProducto = {
      title: formProductos.title.value,
      price: formProductos.price.value,
      thumbnail: formProductos.thumbnail.value
    }
    console.log(nuevoProducto)

    socket.emit('nuevo-producto', nuevoProducto)
    socket.emit('notificacion', 'Producto recibido exitosamente en el cliente');
    location.reload();
  })
});

socket.on('actualizar-tabla', data => {

  let tabla = document.querySelector('#tabla')
  tabla.innerHTML = `<table class="table">
    <thead>
      <tr>
        <th scope="col">Titulo</th>
        <th scope="col">Precio</th>
        <th scope="col">Thumbnail</th>
      </tr>
    </thead>
    <tbody id="datos-tabla">

    </tbody>
  </table>`

  let datosTabla = document.getElementById('datos-tabla')
  data.forEach(producto => {
    datosTabla.innerHTML += `       
        <tr>                     
            <td>${producto.title}</td>
            <td>${producto.price}</td>
            <td>@${producto.thumbnail}</td>
        </tr>`
  });

})

let botonLogout = document.querySelector('#boton-logout');

botonLogout.addEventListener('click', (e) => {
  botonLogout.classList.add('hidden');  
})

let nombre = ''

socket.on('nombre-usuario', data => {

  console.log('NOMBRE USUARIO: ' + data)

  function updateBienvenida(nombre) {
    let bienvenida = document.querySelector('#bienvenida')
    bienvenida.innerHTML = `Bienvenido ${nombre}`
  }

  nombre = data

  console.log(nombre)
  
  updateBienvenida(nombre);

})

socket.on('visibilidad-logout', data => {

  if (data == true){
    botonLogout.addEventListener('click', (e) => {
      botonLogout.classList.remove('hidden');  
    })
  }
})
socket = io();

/*socket.on("mensaje", (informacion) =>{
    console.log(informacion)
})

socket.emit("mensaje", "Estoy conectado")

socket.emit("Contador")

socket.on("Contador", (contador)=>{
    console.log(contador)
})*/

var param = new URLSearchParams(window.location.search);
var usuario= param.get('nombre')

socket.on("connect",()=>{
    console.log(usuario)
    socket.emit('usuarioNuevo', usuario)
})

socket.on('nuevoUsuario', (texto)=>{
    console.log(texto)
    chat.innerHTML = chat.innerHTML + texto + '<br>'
})

socket.on('usuarioDesconectado', (texto)=>{
    chat.innerHTML = chat.innerHTML + texto + '<br>'
})

const formulario = document.querySelector('#formulario')
const mensaje = formulario.querySelector('#texto')
const chat = document.querySelector('#chat')

formulario.addEventListener('submit', (datos)=>{
    datos.preventDefault()
    
    socket.emit('texto', mensaje.value, ()=>{
            mensaje.value = ''
            mensaje.focus()
        })       
})

socket.on("texto", (text)=>{
    chat.innerHTML = chat.innerHTML + text + '<br>'

})
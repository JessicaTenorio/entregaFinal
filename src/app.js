require('./config/config')
const express = require('express');
const app = express ();
const path = require('path');
const bodyParser= require('body-parser');
const mongoose = require('mongoose');
const server = require('http').createServer(app);
const io = require('socket.io')(server);


//### Para usar las variables de sesión
const session = require('express-session')
var MemoryStore = require('memorystore')(session)

//Paths
const directoriopublico = path.join(__dirname, '../public')
const dirNode_modules = path.join(__dirname, '../node_modules')

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

//Static
app.use(express.static(directoriopublico));
//app.use('/css', express.static(dirNode_modules + '/bootstrap/dist/css'));
app.use('/js', express.static(dirNode_modules + '/jquery/dist'));
app.use('/js', express.static(dirNode_modules + '/popper.js/dist'));
//app.use('/js', express.static(dirNode_modules + '/bootstrap/dist/js'));


app.use(session({
	cookie: { maxAge: 86400000 },
 	store: new MemoryStore({
      	checkPeriod: 86400000 // prune expired entries every 24h
    	}),
  	secret: 'keyboard cat',
  	resave: true,
  	saveUninitialized: true
}))


app.use((req, res, next)=>{
    if(req.session.usuario){
        res.locals.session = true
        res.locals.nombre = req.session.nombre
        res.locals.avatar = req.session.avatar
        res.locals.rolC= req.session.rolCoordinador
        res.locals.rolA= req.session.rolAspirante 
    }
    next()
})


//BodyParser
app.use(bodyParser.urlencoded({extended:false}))

app.use(require('./routes/index'));



mongoose.connect(process.env.URLDB, {useNewUrlParser: true, useCreateIndex: true}, 
(err, resultado)=>{
    if(err){
        return console.log(err)
    }

    console.log("conectado");
});

//let contador=0;
const { UsuarioChat } = require('./models/usuarioChat')
const usuarioChat = new UsuarioChat();


io.on('connection', client =>{
    console.log('un usuario se ha conectado')
   
   /* client.emit("mensaje", "Bienvenido")
    client.on("mensaje", (informacion)=>{
        console.log(informacion)
    })

    client.on("contador", ()=>{
        contador ++
        console.log(contador)
        io.emit("contador", contador)
    })*/

    client.on('usuarioNuevo', (usuario)=>{
        
        let user=usuarioChat.agregarUsuario(client.id, usuario)       
            
            let texto = `Se ha conectado ${user.nombre}`
            io.emit('nuevoUsuario', texto)
        
    })

    client.on('disconnect',()=>{
        
         let usuarioBorrado=usuarioChat.borrarUsuario(client.id)
         let texto = `Se ha desconectado ${usuarioBorrado.nombre}`
         io.emit('usuarioDesconectado', texto)
        
    })

    client.on("texto", (text, callback)=>{
       
         let usuario = usuarioChat.getUsuario(client.id)
         let texto = `${usuario.nombre} : ${text}`      
         io.emit("texto", (texto))
         callback()
        
    })

});

server.listen(process.env.PORT, ()=>{
    console.log('Servidor escuchando en el puerto '+ process.env.PORT)
})


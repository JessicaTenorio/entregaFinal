class UsuarioChat{

    constructor(){
        this.usuarios=[];
    }

    agregarUsuario(id, nombre){
        
        let existe= this.usuarios.filter(user=>user.nombre==nombre)
        let usuario;
        if(existe.length>0){
            console.log('nombreRamdom')
            let random=Math.floor((Math.random() * 1000) + 1);
            let nomRandom=nombre+'_'+random;
            nombre=nomRandom;
            usuario = {id, nombre}
            this.usuarios.push(usuario)
            return usuario;
        }else{
            usuario = {id, nombre}
            this.usuarios.push(usuario)
            return usuario;
        }
        
    }

    getUsuarios(){
        return this.usuarios
    }

    getUsuario(id){
        let usuario = this.usuarios.filter(user=> user.id === id)[0]
        return usuario
    }

    borrarUsuario(id){
        let usuarioBorrado= this.getUsuario(id)
        this.usuarios = this.usuarios.filter(user=> user.id!=id)
        return usuarioBorrado
    }
}

module.exports = {
    UsuarioChat
}
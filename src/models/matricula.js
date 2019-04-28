const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matriculaSchema = new Schema({
    idUsuario:{
        type: Number,
        require: true              
    },
    idCurso:{
        type: Number,
        required: true          
    },    
    nombre:{
        type: String,
        required: true,
        trim: true     
    },    
    correo: {
        type: String,
        required: true,
        trim: true
    },
    telefono: {
        type: Number,
        required: true,
        trim: true     
    },
});

const Matricula = mongoose.model('Matricula', matriculaSchema);
module.exports=Matricula;

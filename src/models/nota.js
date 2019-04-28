const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notaSchema = new Schema({
    idUsuario:{
        type: Number,
        required: true                     
    },
    idCurso:{
        type: Number,
        required: true              
    },
    nomCurso:{
        type: String,
        required: true              
    },
    nota1: {
        type: Number,
        required: true,
        min: 0,
        max: 5    
    },
    nota2: {
        type: Number,
        required: true,
        min: 0,
        max: 5      
    },
    nota3: {
        type: Number,
        required: true,
        min: 0,
        max: 5      
    }
});
notaSchema.index({idUsuario: 1, idCurso: -1}, { unique: true })
const Nota = mongoose.model('Nota', notaSchema);
module.exports=Nota;

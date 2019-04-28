const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const cursoSchema = new Schema({
    nombre:{
        type: String,
        require: true,      
        trim: true        
    },
    idCurso:{
        type: String,
        required: true,
        unique: true       
    },
    descripcion: {
        type: String,
        required: true
    },
    valor: {
        type: Number,
        default: 0,
        required: true        
    },
    modalidad: {
        type: String,
        default: "-"        
    },
    intensidad: {
        type: String,
        default: "-"      
    },
    estado:{
        type: String,
        required: true
    }
});

cursoSchema.plugin(uniqueValidator, { message: 'Ya existe {VALUE}.' });

const Curso = mongoose.model('Curso', cursoSchema);
module.exports=Curso;

const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const usuarioSchema = new Schema({
    identidad:{
        type: Number,
        require: true,      
        trim: true,
        unique: true    
    },
    nombre:{
        type: String,
        required: true,
        trim: true     
    },
    password:{
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
    rol: {
        type: String,
        default: "Aspirante",
        required: true       
    },
    avatar: {
        type: Buffer
    }
});

usuarioSchema.plugin(uniqueValidator, { message: 'Ya existe usuario con documento de identidad {VALUE}.' });

const Usuario = mongoose.model('Usuario', usuarioSchema);
module.exports=Usuario;

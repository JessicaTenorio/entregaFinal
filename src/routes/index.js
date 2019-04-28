const express = require('express')
const app = express()
const path = require('path')
const hbs = require ('hbs')
const Curso = require('./../models/curso')
const Usuario = require('./../models/usuario')
const Matricula = require('./../models/matricula')
const Nota = require('./../models/nota')
const dirViews= path.join(__dirname, '../../template/views')
const dirPartials = path.join(__dirname, '../../template/partials')
const bcrypt = require('bcrypt');
const multer = require('multer')

require('./../helpers/helpers')

//hbs
app.set('view engine', 'hbs')
app.set('views', dirViews)
hbs.registerPartials(dirPartials)


var upload = multer({ 
    limits:{
        fileSize: 10000000
    },
    fileFilter(req,file,cb){
        if(!file.originalname.match(/\.(jpg|png|jpeg)$/)){
            return cb(new Error('Archivo invalido'))
        }
        //accept the file
        cb(null,true)
    }
})

app.get('/', (req, res)=>{
    res.render('index', {
          titulo: 'Inicio',
    })
});

app.get('/registroUsuario', (req, res)=>{
    if(!req.session.usuario){
       res.render('registroUsuario')
    }else{
        res.render('error',{
            titulo:"Error 404",
        })  
    }
    
});

app.post('/registrar', upload.single('archivo'),(req, res)=>{
   
    let usuario= new Usuario({
        identidad: req.body.identidad,
        nombre: req.body.nombre,
        password: bcrypt.hashSync(req.body.password, 10),
        correo: req.body.correo,
        telefono: req.body.telefono,
        rol: "Aspirante",
        avatar: req.file.buffer    
    });   

    usuario.save((err, resultado)=>{
        if(err){
            res.render('registroUsuario', {
                response: "Error registrando el usuario "+err
             });
           
        }else{
            res.render('registroUsuario', {
                response: "**Se ha registrado exitosamente "+ resultado.nombre
             });            
        }        
    })  
});

app.post('/ingresar', (req,res)=>{
    Usuario.findOne({identidad: req.body.usuario}, (err,resultado)=>{
        if(err){
            return console.log(err)
        }

        if(!resultado){
            return res.render('ingresar',{
                mensaje: "**Usuario o clave incorrecta"               
            })  
        }
        
        if(!bcrypt.compareSync(req.body.password, resultado.password)){
           return res.render('ingresar',{
                mensaje: "**Usuario o clave incorrecta"               
            })
        }   

        if(resultado.rol=='Coordinador'){
            req.session.rolCoordinador=true;
        }else{
            req.session.rolCoordinador=false; 
        }

        if(resultado.rol=='Aspirante'){
            req.session.rolAspirante=true;
        }else{
            req.session.rolAspirante=false; 
        }

        req.session.usuario = resultado._id
        req.session.nombre = resultado.nombre
        req.session.identidad = resultado.identidad
        req.session.correo = resultado.correo
        req.session.telefono = resultado.telefono
        req.session.avatar = resultado.avatar.toString('base64')

        res.render('ingresar',{
           mensaje: "BIENVENIDO " + resultado.nombre,
           session:true,
           avatar: req.session.avatar,
           nombre: req.session.nombre,
           rolC: req.session.rolCoordinador,
           rolA: req.session.rolAspirante            
        })        
    })
})


app.get('/registroCurso', (req, res)=>{
    if(req.session.rolCoordinador){
        res.render('registroCurso')
    }else{
        res.render('error',{
            titulo:"Error 404",
        }) 
    }
});

app.post('/guardar', (req, res)=>{
    let inten=req.body.intensidad;
    
    if(inten===null || inten==undefined || inten==""){
       inten="-";
    }
    let curso= new Curso({
        nombre: req.body.nombre,
        idCurso: req.body.idCurso,
        descripcion: req.body.descripcion,
        valor: req.body.valor,
        modalidad: req.body.modalidad,
        intensidad: inten,
        estado: 'Disponible'
    });   

    curso.save((err, resultado)=>{
        if(err){
            res.render('registroCurso', {
                response: "Error registrando el curso "+err
             });
           
        }else{
            res.render('registroCurso', {
                response: "**Se ha registrado exitosamente "+ resultado.nombre
             });            
        }        
    })  
});


app.get('/verCurso', (req,res)=>{
    Curso.find({estado:"Disponible"}).exec((err,respuesta)=>{
        if(err){
            console.log(err)
            res.render('verCurso',{
                listado : null
            })
            
        }else{
            res.render('verCurso',{
                listado : respuesta
            })
        }
    })
})


app.get('/inscribir', (req,res)=>{
  if(req.session.rolAspirante){  
    Curso.find({estado:"Disponible"}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            res.render ('inscripcion',{
                identidad : req.session.identidad,
                nombre : req.session.nombre,
                correo : req.session.correo,
                telefono : req.session.telefono,
                listado: null
            })
            
        }else{
            res.render ('inscripcion',{
                identidad : req.session.identidad,
                nombre : req.session.nombre,
                correo : req.session.correo,
                telefono : req.session.telefono,
                listado: respuesta
            })
        }
    }) 
 } else{
    res.render('error',{
        titulo:"Error 404",
    })
 } 
})


app.post('/inscribir', (req, res)=>{    

    let matricula=new Matricula({
        idUsuario: req.session.identidad,          
        idCurso: req.body.curso,
        nombre: req.session.nombre,
        correo: req.session.correo,
        telefono: req.session.telefono 
    });   

    Matricula.find({idUsuario:req.session.identidad, idCurso:req.body.curso}).exec((err,respuesta)=>{
       
        if(err){
            console.log(err)
            return res.render ('indexpost',{
                response: "Error realizando consulta en la BD"
            })            
        }
        if(respuesta.length>0){ 
            
            return res.render ('indexpost',{
                response: "Usted ya se encuentra matriculado en el curso seleccionado"
            }) 
            
        }else{
            matricula.save( (err, resultado)=>{
                if(err){
                     res.render('indexpost', {
                        response: "Error registrando la matricula "+err
                     })
                   
                }else{
                    res.render('indexpost', {
                        response: "**Se ha matriculado exitosamente al curso"
                     })        
                }        
            }) 
        }        
    })
});


app.get('/registroNota', (req,res)=>{
    if(req.session.rolCoordinador){  
      Curso.find({estado:"Cerrado"}).exec((err,respuesta)=>{
          
          if(err){
              console.log(err)
              res.render ('registroNota',{
                 listado: null,
                 response: "Error en la BD"
              })
              
          }else{
              res.render ('registroNota',{
                  listado: respuesta
              })
          }
      }) 
   } else{
      res.render('error',{
          titulo:"Error 404",
      })
   } 
})

app.post('/guardarNota', (req,res)=>{
    let curso=req.body.curso2;
    let parts= curso.split("|");
    console.log(parts[0])
    console.log(parts[1])
    if(req.body.nota1>5 || req.body.nota2>5 || req.body.nota3>5){
        return res.render ('indexpost',{
          response: "Error Las notas deben estar en un rango de 0 a 5"
        })
    }else if(req.body.nota1<0 || req.body.nota2<0 || req.body.nota3<0){
        return res.render ('indexpost',{
            response: "Error Las notas deben estar en un rango de 0 a 5"
        })
    }else{
       
    let nota=new Nota({
        idUsuario: req.body.identidad,          
        idCurso: parts[0],
        nomCurso: parts[1],
        nota1: req.body.nota1,
        nota2: req.body.nota2,
        nota3: req.body.nota3     
    });   
    
    
    Matricula.find({idUsuario:req.body.identidad, idCurso:parts[0]}).exec((err,respuesta)=>{
      
        if(err){
            console.log(err)
            return res.render ('indexpost',{
                response: "Error realizando consulta en la BD "+err
            })            
        }
        if(respuesta.length>0){ 
            nota.save( (err, resultado)=>{
                if(err){
                     res.render('indexpost', {
                        response: "Error Ya se han registrado las notas del estudiante para este curso"
                     })
                   
                }else{
                    res.render('indexpost', {
                        response: "**Se han registrado las notas exitosamente"
                     })        
                }        
            })  
            
        }else{
            return res.render ('indexpost',{
                response: "Error El estudiante no se encuentra matriculado en el curso seleccionado"
            }) 
        }        
    })
}
});


app.get('/chatear', (req,res)=>{
    if(req.session.rolAspirante){  
      res.render('chat', {
            titulo: 'Inicio',
      })
   } else{
      res.render('error',{
          titulo:"Error 404",
      })
   } 
})

app.get('/salaChat', (req,res)=>{
    if(req.session.rolAspirante){  
      res.render('salaChat', {
            titulo: 'Inicio',
      })
   } else{
      res.render('error',{
          titulo:"Error 404",
      })
   } 
})


app.get('/verNotas', (req,res)=>{
    if(req.session.rolAspirante){  
      Nota.find({idUsuario:req.session.identidad}).exec((err,respuesta)=>{
          
          if(err){
              console.log(err)
              res.render ('verNotas',{
                 listado: null                 
              })
              
          }else{
              res.render ('verNotas',{
                  listado: respuesta
              })
          }
      }) 
   } else{
      res.render('error',{
          titulo:"Error 404",
      })
   } 
})


app.get('/verInscritos', (req, res)=>{
  if(req.session.rolCoordinador){   
    let list;
    let curs;
    Curso.find({estado:"Disponible"}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            list=null;          
        }else{
            list=respuesta;
        }
    });
    Curso.find({}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            curs = null
                      
        }else{           
            curs= respuesta          
        }
    }); 
    Matricula.find({}).exec((err,respuesta)=>{        
        if(err){
            console.log(err)
            res.render ('verInscritos',{                
                listado: null,
                cursos: null,
                matriculas: null
            })            
        }else{
            res.render ('verInscritos',{ 
                listado: list,              
                cursos: curs,
                matriculas: respuesta
            })
        }
    }); 
}else{
    res.render('error',{
        titulo:"Error 404",
    })
}   
});

app.post('/cambiar', (req, res)=>{
    let list;
    let resp;
    Curso.updateOne({idCurso: req.body.curso}, {$set:  {estado: "Cerrado" }},
     (err, resultado)=>{
         if(err){
           resp = "Error al actualizar curso"            
         }else{
            resp = "Actualizó correctamente"            
         }        
     })
     
     Curso.find({estado:"Disponible"}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            list=null;          
        }else{
            list=respuesta;
        }
    });
    Curso.find({}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            curs = null
                      
        }else{           
            curs= respuesta          
        }
    }); 
    Matricula.find({}).exec((err,respuesta)=>{        
        if(err){
            console.log(err)
            res.render ('verInscritos',{                
                listado: null,
                cursos: null,
                matriculas: null,
                response: resp
            })            
        }else{
            res.render ('verInscritos',{ 
                listado: list,              
                cursos: curs,
                matriculas: respuesta,
                response: resp
            })
        }
    });    
});

app.get('/eliminaInscrito', (req, res)=>{
  if(req.session.rolCoordinador){  
    Curso.find({}).exec((err,respuesta)=>{          
        if(err){ 
            console.log(err)
            return res.render('eliminaInscrito',{
                listado: null
            })
        }else{              
             res.render('eliminaInscrito',{                
                listado: respuesta
            }) 
        }
    })
  }else{
    res.render('error',{
        titulo:"Error 404",
    }) 
  }    
});

app.post('/eliminar', (req, res)=>{
    let lista;
    let response;
    let curs;
    Matricula.deleteOne({idUsuario:req.body.identidad2, idCurso:req.body.curso2}).exec((err,respuesta)=>{        
        if(err){
            console.log(err)
            response= "Error al eliminar matricula"            
        }else if(respuesta.deletedCount==0){
              response= 'No se encontro registro con el documento de identidad '+req.body.identidad2+ ' para el curso seleccionado'            
        }else{       
            response= 'Eliminación exitosa '
        }        
    })     
    Curso.find({idCurso:req.body.curso2}).exec((err,respuesta)=>{
        
        if(err){
            console.log(err)
            curs = null                      
        }else{           
            curs= respuesta          
        }
    }); 
    Matricula.find({}).exec((err,respuesta)=>{        
        if(err){
            console.log(err)
            res.render ('eliminapost',{                
                response: response,
                cursos: curs,
                matriculas: null
            })            
        }else{
            res.render ('eliminapost',{ 
                response: response,
                cursos: curs,
                matriculas: respuesta
            })
        }
    });    
})       


app.get('/salir', (req, res)=>{
    req.session.destroy((err)=>{
        if(err) return console.log(err)
    })
    res.redirect('/')
});


app.get('*', (req, res)=>{
    res.render('error',{
        titulo:"Error 404",
    })
});

module.exports = app
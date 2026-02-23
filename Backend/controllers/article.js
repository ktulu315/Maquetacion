'use strict'

var validator = require("validator");
var Article = require("../models/article");
const article = require("../models/article");
const { response } = require("express");
const fs = require('fs');  //libreria file system
const path = require('path');
const { escapeRegex, slugify, isValidEmail } = require('../utils/regex');


var controller = {
    datosCurso: (request, response) => {
        var hola = request.body.hola;
        return response.status(200).send({
            curso: "Master en Frameworks",
            autor: "David Eduardo",
            url: "www.google.com",
            x: "yes",
            hola
        });
    },

    test: (request, response) => {
        return response.status(200).send({
            message: "accion de test de controller de articulos"
        })
    },

    saveArticle: (request, response) => {
        // recoger parametros pos POST
        var params = request.body;
        console.log(params);

        //validar datos con VALIDATOR
        try {
            var validate_title = !validator.isEmpty(params.title); //cuando no este vacio el titulo
            var validate_content = !validator.isEmpty(params.content);
        } catch (error) {
            return response.status(200).send({
                status: "Error",
                message: "Error, Faltan datos por enviar!"
            }); 
        }

        if(validate_title && validate_content){   
            //crear el objeto a guardar
            var article = new Article(); 
            //Asignar los valores
            article.title = params.title;
            article.content = params.content;
            article.image = null;
            //Guardar el articulo
            article.save()
                .then((result) => {
                    return response.status(200).send({
                        status: "success",
                        article
                    })                    
                }).catch((error) => {
                    return response.status(404).send({
                        status: "Error",
                        message: "No se pudo guardar: " + error
                    })
                });
        }else{
            return response.status(200).send({
                status: "Error",
                message: "Datos incorrectos o invalidos"
            })
        }
    },

    getArticles: async (request, response) => {
        
        try {
            const query = Article.find({});
            const last = request.params.last;

            if(last || last == undefined){
                query.limit(last);
            }

            const articles = await query.sort('-_id').lean();
            if(articles[0] == null) {
                return response.status(402).send({
                    status: "error",
                    message: "No existen articulos en la base de datos"
                })
            }

            return response.status(200).send({
                status: "success",
                articles   
            })

        } catch (error) {
            return response.status(500).send({
                status: "error",
                message: "Error al obtener articulos: " + error.message
            })
        }
    },
    
   /*
    ((request, response) => {
        //.find
        Article.find({}).sort('-_id').lean()
            .then((articles) => {
                var last = request.params.last;

                console.log("tamaño de last: " + last);
                console.log("tamaño de articles: " + articles.lenght);
                if(articles[0] == null){
                    return response.status(404).send({
                        status: "error",
                        message: "No hay articulos en la base de datos"
                    })
                }

                return response.status(200).send({
                    status: "success",
                    articles
                })
            })

            .catch((error) => {
                return response.status(500).send({
                    status: "error",
                    message: "Error al obtener articulos: " + error.message
                })
            })
                
    }) 
    */
    getArticle: async (request, response) => {
          try {
            //recoger el id de la URL
            const articleId = request.params.id;
            //comprobar que existe 
            if(!articleId){
                return response.status(400).send({
                    status: "error",
                    message: "ID de articulo no existe"
                });
            }
            //buscar el articulo
            const article = await Article.findById(articleId);
                if(!article){
                    return response.status(402).send({
                        status: "error",
                        message: "No existe el articulo"
                    });
                }
                // enviar respuesta   
                return response.status(200).send({
                    status: "success",
                    article
                });
            }

            catch (error) {
            return response.status(500).send({
                status: "error",
                message: "No existe el articulo" + error.message
            });
        }
    },

    updateArticle: async (request, response) => {

        //obtener ID por url
        const articleId = request.params.id;
        //obtener datos que llegan por put
        const params = request.body;

        //validar los datos
        try {
            const validate_title = !validator.isEmpty(params.title || '');
            const validate_content = !validator.isEmpty(params.content || '');

            if(validate_title && validate_content){
                const articleUpdated = await Article.findOneAndUpdate(
                    {_id: articleId },
                    params,
                    {new: true} //devuelve el actualizado
                );
                
                if(!articleUpdated){
                    return response.status(404).json({
                        status: "error",
                        message: "No se encontró el articulo a actualizar"
                    });
                }

                return response.status(200).json({
                    status: "success",
                    article: articleUpdated
                });
            
            } else{
                return response.status(400).json({
                    status: "error",
                    message: "Datos faltantes o invalidos"
                });
            }
            
        } catch (error) {
            return response.status(500).json({
                status: "error",
                message: "Error al actualizar: " + error.message
            });
        }
    },

    deleteArticle: async (request, response) => {

        const articleId = request.params.id;
        const validateArticle = !validator.isEmpty(articleId.trim());
        
        if(!validateArticle){
            return response.status(402).send({
                status: "error",
                message: "Se necesita el ID del articulo"
            });
        }


        try {
            const articleRemoved = await Article.findOneAndDelete({_id: articleId});

            if(!articleRemoved){
                return response.status(404).json({
                    status: "error",
                    message: "No existe articulo a eliminar: " + error.message
                });
            }

            return response.status(200).json({
                status:"success",
                article: articleRemoved 
            });

        } catch (error) {
            return response.status(500).json({
                status: "error",
                message: "Error en servidor al eliminar: " + error.message
            });
        }
    },

    uploadImage: async (request, response) => {
        
        let file_name = "Imagen no subida";
    
        if (!request.files) {
            return response.status(500).json({
                status: "error",
                message: file_name
            });
        }
    
        // Obtener ruta y nombre del archivo subido
        const file_path = request.files.image.path;
        const file_split = file_path.split(path.sep); // usa path.sep para compatibilidad multiplataforma
        file_name = file_split[file_split.length - 1];
        const file_ext = file_name.split('.').pop();  //pop devuelve la ultima parte del array
    
        // Validar extensión del archivo
        if (["jpg", "png", "svg", "jpeg", "gif"].includes(file_ext.toLowerCase())) {
            const article_id = request.params.id;
    
            try {
                // 1. Obtener el artículo actual
                const article = await Article.findById(article_id);
                if (!article) {
                    // Eliminar la imagen nueva ya que no existe el artículo
                    fs.unlink(file_path, () => {});
                    return response.status(404).json({
                        status: "error",
                        message: "Artículo no encontrado"
                    });
                }
    
                // 2. Eliminar imagen anterior si existe
                if (article.image) {
                    const old_image_path = path.join(__dirname, "../upload/articles/", article.image);
                    fs.access(old_image_path, fs.constants.F_OK, (err) => {
                        if (!err) { //validar accesibilidad, si no hay error elimina la imagen anterior
                            fs.unlink(old_image_path, (unlinkErr) => {
                                if (unlinkErr) {
                                    console.log("Error al eliminar la imagen anterior:", unlinkErr);
                                }
                            });
                        }
                    });
                }
    
                // 3. Actualizar el artículo con el nuevo nombre de imagen
                article.image = file_name;
                const articleUpdated = await article.save();
    
                return response.status(200).json({
                    status: "success",
                    article: articleUpdated
                });
    
            } catch (err) {
                fs.unlink(file_path, () => {}); // eliminar imagen nueva por si hubo error
                return response.status(500).json({
                    status: "error",
                    message: "Error al actualizar el artículo",
                    error: err.message
                });
            }
    
        } else {
            // Borrar archivo subido si no es imagen válida
            fs.unlink(file_path, (error) => {
                if (error) {
                    return response.status(500).json({
                        status: "error",
                        message: "Error al borrar archivo inválido: " + error.message
                    });
                }
                return response.status(200).json({
                    status: "error",
                    message: "Formato de archivo no válido, archivo eliminado."
                });
            });
        }
    },

    getImage: async (request, response) => {
        try{
            const file = request.params.image;
            const path_file = './upload/articles/' + file;

            if (!file){
                return response.status(404).json({
                    status: "error",
                    message: "Archivo no existe"
                });
            }

            fs.access(path_file, fs.constants.F_OK, (error) => {
                if (error){
                    return response.status(404).json({
                        status: "error",
                        message: "La imagen no existe: " + error.message
                    });
                }
                //console.log("res: " + response.sendFile(path.resolve(path_file))); //resuelve la ruta de archivo
                return response.sendFile(path.resolve(path_file)); //envia el archivo
            });
        }
        catch (error) {
            return response.status(500).json({
                status: "error",
                message: "Error al procesar: " + error.message
            });
        }
    },

    search: async (request, response) => {
        try {
            // obtener string a buscar
            const search_string = escapeRegex(request.params.search);
            // search or
            const articles = await Article.find(
                {'$or': [
                {"title": {$regex: search_string, "$options": "i"}}, // i es sin importar mayusculas
                {"content": {$regex: search_string, "$options": "i"}}
                ]})
            .sort([['date', 'descending']]).lean();

            if (!articles || articles.length == 0 || search_string == null){
                return response.status(404).json({
                    status: "error",
                    message: "La busqueda: " + "'" + search_string + "'" +  " no generó ningún resultado!"
                });
            }

            return response.status(200).json({
                status: "success",
                articles
            });

        } catch (error) {
            return response.status(500).json({
                status: "error",
                message: "Error al procesar: " + error.message
            });
        }
    }

}; //END de controller
module.exports = controller;

'use strict'

//cargar modulos de node para cargar el servidor
var express = require('express');
var bodyParser = require('body-parser'); //recibir peticiones

//Ejecutar express HTTP
var app = express();

//cargar ficheros (rutas)
var article_routes = require('./routes/article');


//Middlewares procesaa datos antes de ejecutar la ruta
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//cargar el CORS
app.use((request, response, next) => {
    response.header('Access-Control-Allow-Origin', '*');
    response.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
    response.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    response.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
    next();
});


//Añadir prefijos a rutas o cargar rutas
app.use('/api', article_routes);

//ruta o metodo de prueba para el api
//Se comenta porque se mueve al controller 
/*
app.post('/datos-curso', (request, response) => {
    var hola = request.body.hola;
    return response.status(200).send({
        curso: "Master en Frameworks",
        autor: "David Eduardo",
        url: "www.google.com",
        x: "yes",
        hola
    });
});
*/
//Exportar modulo(fichero actual)
module.exports = app;
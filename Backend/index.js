'use strict'

var mongoose = require('mongoose'); //var de conexion a db
var app = require('./app');
var port = 3900;

mongoose.Promise = global.Promise; //promesa de conexion mongoose
mongoose.connect('mongodb://localhost:27017/api_rest_blog', {useNewUrlParser: true} )
    .then(()=>{
        console.log("\x1b[35m ---> \x1b[34mLa conexion a base de datos se realizó \x1b[32mCorrectamente!");

        //Crear servidor y escuchar peticiones http
        app.listen(port, () => {
            console.log("Servidor corriendo en http://localhost:" + port)
        });
});

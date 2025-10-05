'use strict'

var express = require('express');
var articleController = require('../controllers/article');

var router = express.Router();
const multiparty = require('connect-multiparty');
const md_upload = multiparty({uploadDir: './upload/articles'}); //middleware de subir archivos

//rutas de prueba
router.post('/datos', articleController.datosCurso);
router.get('/test-de-controlador', articleController.test);

//rutas utiles
router.post('/save', articleController.saveArticle);
router.get('/articles/:last?', articleController.getArticles);
router.get('/article/:id', articleController.getArticle);
router.put('/article/:id', articleController.updateArticle);
router.delete('/article/:id', articleController.deleteArticle);
router.post('/upload-image/:id', md_upload, articleController.uploadImage);
router.get('/get-image/:image', articleController.getImage);
router.get('/search/:search', articleController.search);


module.exports = router; //exportar el modulo para usarlo en app.js //cargar ficheros rutas
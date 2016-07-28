var questionsController = require('./controllers/questionsController.js');
var videosController = require('./controllers/videosController.js');
var homeController = require('./controllers/homeController.js');
var authController = require('./controllers/authController.js');
var router = require('express').Router();
var db = require('./db/db.js');
var bcrypt = require('bcrypt')

var session = require('express-session')

var saltRounds = 10

router.get('/api/questions', questionsController.getQuestions);
router.post('/api/questions', questionsController.createQuestion);

router.get('/api/presigned', videosController.generatePreSignedUrl);
router.get('/api/videos', videosController.getVideo);
router.post('/api/videos', videosController.createVideo);

router.post('/api/signup', authController.signup)
router.post('/api/login', authController.login)

//Send homepage when users route to videos or record endpoint
//React Router will handle showing the appropriate views
router.get('/videos/*', homeController.sendHome);
router.get('/record', homeController.sendHome);
router.get('/login', homeController.sendHome);
router.get('/signup', homeController.sendHome);

//TODO
//Handle unknown routes;
//router.get(*, errorHandler);

module.exports = router;

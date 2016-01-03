var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
})
.get('/chat', function(req, res, next) {
	res.render('chat/index');
})
.get('/room', function(req, res, next) {
	res.render('room/index');
});

module.exports = router;

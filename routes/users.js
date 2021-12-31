var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/info', function(req, res, next) {
  // res.send('respond with a resource');
  res.render('user', { user_message: "Hello User!!!"});
});

module.exports = router;

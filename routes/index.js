var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/home/:id/:name', function(req, res, next) {
  console.log("hello world!");
  res.send(req.params);
  
});

module.exports = router;

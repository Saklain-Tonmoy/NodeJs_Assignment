var express = require('express');
var router = express.Router();
var axios = require("axios").default;
const fs = require('fs');

/* GET home page. */
router.get('/home/:id/:name', function (req, res, next) {
  console.log("hello world!");
  res.send(req.params);

});

/* GET weather data from api */
router.get('/all/weather/:country/:city', function (req, res, next) {
  // Extracting URL parameters
  var country = req.params.country;
  var city = req.params.city;

  axios.get('http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912' + '&q=' + country + '&q=' + city + '&dt=2021-12-28' + '&aqi=no')
    .then(function (response) {
      var jsonObject = JSON.stringify(response.data);
      var object = JSON.parse(jsonObject);

      // File path where data is to be written
      // Here, we assume that the file to be in
      // the same location as the .js file
      var path = 'api-data.json';

      // Declare a buffer and write the
      // data in the buffer
      let buffer = new Buffer.from(jsonObject);

      // The fs.open() method takes a "flag"
      // as the second argument. If the file
      // does not exist, an empty file is
      // created. 'a' stands for append mode
      // which means that if the program is
      // run multiple time data will be
      // appended to the output file instead
      // of overwriting the existing data.
      fs.open(path, 'r+', function (err, fd) {

        // If the output file does not exists
        // an error is thrown else data in the
        // buffer is written to the output file
        if (err) {
          console.log('Cant open file');
        } else {
          fs.write(fd, buffer, 0, buffer.length,
            null, function (err, writtenbytes) {
              if (err) {
                console.log('Cant write to file');
              } else {
                console.log(writtenbytes +
                  ' characters added to file');
              }
            });
          fs.close(fd, function (err) {
            if (err) {
              console.log(err);
            } else {
              console.log('File closed successfully');
            }
          });
        }
      });



      try {
        if (fs.existsSync(path)) {
          console.log('file exists');
          fs.readFile('api-data.json', 'utf8', function(err, data) {
            if(err) { 
              console.log(err);
            } else {
              console.log(data.length);
              if(data.length != 0) {
                var test = JSON.parse(data);

                var totalKeys = Object.keys(test);
                var locationsFromFile = new Object();
                var forecastFromFile = new Object();

                console.log(totalKeys);

                for (var i = 0; i < totalKeys.length; i++) {
                  var index = totalKeys[i];
                  if (index == 'location') {
                    locationsFromFile = test[index];
                  } else if (index == 'forecast') {
                    forecastFromFile = test[index].forecastday;
                  }
                  // console.log(test[index]);
                }

                console.log(locationsFromFile);
                console.log(forecastFromFile[0].hour[0]);
              } else {
                console.log('File does not have any content.');
              }
            }
          })
        }
      } catch (err) {
        console.log(err);
      }




      // fs.readFile('api-data.json', 'utf-8', function (err, data) {

      //   // Check for errors
      //   if (err) {
      //     console.log(err);
      //   } else {
      //     // Converting to JSON
      //     // console.log(data);

      //     // console.log(JSON.parse(data));

      //     var test = JSON.parse(data);

      //     var totalKeys = Object.keys(test);
      //     var locationsFromFile = new Object();
      //     var forecastFromFile = new Object();

      //     console.log(totalKeys);

      //     for(var i = 0; i < totalKeys.length; i++) {
      //       var index = totalKeys[i];
      //       if(index == 'location') {
      //         locationsFromFile = test[index];
      //       } else if(index == 'forecast') {
      //         forecastFromFile = test[index].forecastday;
      //       }
      //       // console.log(test[index]);
      //     }

      //     console.log(locationsFromFile);
      //     console.log(forecastFromFile[0].hour[0]);
      //   }
      // });




      // var keysArray = Object.keys(object);

      // var location = new Object();
      // var forecast = new Object();

      // for (var i = 0; i < keysArray.length; i++) {
      //   var key = keysArray[i];
      //   if (key === 'location') {
      //     location = object[key];
      //   } else if (key === 'forecast') {
      //     forecast = object[key].forecastday;
      //     console.log(forecast.length);
      //     console.log(forecast[0].date);
      //     console.log(forecast[0].day.maxtemp_c);
      //     console.log(object[key].forecastday.length);
      //     console.log(object[key].forecastday[0].day);
      //     console.log(object[key].forecastday[0].astro);
      //     console.log(object[key].forecastday[0].hour.length);
      //     console.log(object[key].forecastday[0].hour[0]);
      //   }

      // }

      res.render('index', { title: "Saklain" });
    })
    .catch(function (err) {
      console.log(err);
    })
})

module.exports = router;

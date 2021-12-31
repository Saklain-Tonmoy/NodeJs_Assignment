var express = require("express");
var router = express.Router();
var axios = require("axios").default;
const fs = require("fs");

const path = 'api-data.json';

router.get('/', function (req, res) {
  res.render('index', {title: 'HOME Page'});
})

/* GET weather data from api */
router.get("/all/:country/:city", function (req, res) {
  // Extracting URL parameters
  var country = req.params.country.toLowerCase();
  var city = req.params.city.toLowerCase();
  // var isoDate = new Date().toISOString();
  var todayInMilliseconds = new Date();
  var today = todayInMilliseconds.toISOString().slice(0,10);
  console.log(today);

  oneDayInMilliseconds = 86400000; //number of milliseconds in a day
  sixDaysAgo = new Date(todayInMilliseconds - (6*oneDayInMilliseconds)).toISOString().slice(0,10);
  console.log(sixDaysAgo);

  var totalKeys = null;
  var locationsFromFile = new Object();
  var forecastFromFile = new Object();

  try {
    if (fs.existsSync(path)) {
      console.log("file exists");
      fs.stat("api-data.json", function (err, stats) {
        if (err) {
          console.log(err);
        } else {
          // console.log(stats);
          // console.log(stats.size);
          if (stats.size != 0) {
            fs.readFile(
              "api-data.json",
              { encoding: "utf8", flag: "r" },
              function (err, data) {

                var test = JSON.parse(data);
    
                totalKeys = Object.keys(test);
    
                // console.log(totalKeys);
    
                for (var i = 0; i < totalKeys.length; i++) {
                  var index = totalKeys[i];
                  if (index == "location") {
                    locationsFromFile = test[index];
                  } else if (index == "forecast") {
                    forecastFromFile = test[index].forecastday;
                  }
                }
    
                if (
                  locationsFromFile.country.toLowerCase() === country &&
                  locationsFromFile.name.toLowerCase() === city
                ) {

                  var forecastDay = forecastFromFile[0].day;
                  var forecastAstro = forecastFromFile[0].astro;
                  var forecastHour = forecastFromFile[0].hour;
                  // console.log(forecastDay);
                  // console.log(forecastAstro);
                  // console.log(forecastHour);
                  // send data from localStorage
                  console.log("data served from localStorage");
                  // console.log(locationsFromFile);
                  // console.log(forecastFromFile);
                  // console.log(forecastFromFile.length);
                  // for(var i in forecastFromFile) {
                  //   console.log("Max Temp in celcius = " + forecastFromFile[i].day.maxtemp_c);
                  //   console.log("Max Temp in fahrenheit = " + forecastFromFile[i].day.maxtemp_f);
                  //   console.log("Min Temp in celcius = " + forecastFromFile[i].day.mintemp_c);
                  //   console.log("Min Temp in fahrenheit = " + forecastFromFile[i].day.mintemp_f);
                  //   console.log("Avg Temp in celcius = " + forecastFromFile[i].day.avgtemp_c);
                  //   console.log("Avg Temp in fahrenheit = " + forecastFromFile[i].day.avgtemp_f);
                  //   console.log("Max Wind in mph = " + forecastFromFile[i].day.maxwind_mph);
                  //   console.log("Max Wind in kph = " + forecastFromFile[i].day.maxwind_kph);
                  //   console.log("Avg Humidity = " + forecastFromFile[i].day.avghumidity);
                  //   console.log("Condition = " + forecastFromFile[i].day.condition.text);
                  //   console.log("Sunrise time = " + forecastFromFile[i].astro.sunrise);
                  //   console.log("Sunset time = " + forecastFromFile[i].astro.sunset);
                  //   for(var j in forecastFromFile[i].hour) {
                  //     console.log(forecastFromFile[i].hour[j]);
                  //   }
                  // }
                  res.render("weather-report", { locationsFromFile, forecastDay, forecastAstro, forecastHour });
                  // res.render("loop", {locationsFromFile, forecastFromFile });
                } else {
                  // send axios request
                  axios
                    .get(
                      "http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" +
                        "&q=" +
                        country +
                        "&q=" +
                        city +
                        "&dt=" +
                        sixDaysAgo +
                        "&end_dt=" +
                        today +
                        "&aqi=no"
                    )
                    .then(function (response) {
                      var jsonObject = JSON.stringify(response.data);
                      // console.log(typeof(jsonObject));
                      var object = JSON.parse(jsonObject);
                      console.log("http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" + "&q=" + country + "&q=" + city + "&dt=" + sixDaysAgo + "&end_dt=" + today + "&aqi=no");
    
                      fs.writeFile("api-data.json", jsonObject, (err) => {
                        if (err) {
                          console.error(err);
                        } else {
                          console.log("File written successfully.");
                        }
                      });
    
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
    
                      res.render("index", { title: "Data Served From Api." });
                    })
                    .catch(function (err) {
                      console.log(err);
                    });
                }
    
                // console.log(locationsFromFile.name);
                // console.log(forecastFromFile[0].hour[0]);
              }
            );
          } else {
            // send axios request
            axios
              .get(
                "http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" +
                "&q=" +
                country +
                "&q=" +
                city +
                "&dt=2021-12-28" +
                "&aqi=no"
              )
              .then(function (response) {
                var jsonObject = JSON.stringify(response.data);
                // console.log(typeof(jsonObject));
                var object = JSON.parse(jsonObject);

                fs.writeFile("api-data.json", jsonObject, (err) => {
                  if (err) {
                    console.error(err);
                  } else {
                    console.log("File written successfully.");
                  }
                });

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

                res.render("index", { title: "Data Served From Api." });
              })
              .catch(function (err) {
                console.log(err);
              });
          }
        }
      });

    }
  } catch (err) {
    console.log(err);
  }

  // fs.stat("api-data.json", function (err, stats) {
  //   if (err) {
  //     console.log(err);
  //   } else {
  //     console.log(stats);
  //     // console.log(stats.size);
  //     if (stats.size != 0) {
  //       fs.readFile(
  //         "api-data.json",
  //         { encoding: "utf8", flag: "r" },
  //         function (err, data) {
  //           // if (err) {
  //           //   console.log(err);
  //           // }
  //           //else {
  //           console.log(data.length);
  //           var test = JSON.parse(data);

  //           totalKeys = Object.keys(test);

  //           console.log(totalKeys);

  //           for (var i = 0; i < totalKeys.length; i++) {
  //             var index = totalKeys[i];
  //             if (index == "location") {
  //               locationsFromFile = test[index];
  //             } else if (index == "forecast") {
  //               forecastFromFile = test[index].forecastday;
  //             }
  //           }

  //           if (
  //             locationsFromFile.country.toLowerCase() === country &&
  //             locationsFromFile.name.toLowerCase() === city
  //           ) {
  //             // send data from localStorage
  //             console.log("data served from localStorage");
  //             res.render("index", { title: "Data Served From LocalStorage." });
  //           } else {
  //             // send axios request
  //             axios
  //               .get(
  //                 "http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" +
  //                   "&q=" +
  //                   country +
  //                   "&q=" +
  //                   city +
  //                   "&dt=2021-12-28" +
  //                   "&aqi=no"
  //               )
  //               .then(function (response) {
  //                 var jsonObject = JSON.stringify(response.data);
  //                 // console.log(typeof(jsonObject));
  //                 var object = JSON.parse(jsonObject);

  //                 fs.writeFile("api-data.json", jsonObject, (err) => {
  //                   if (err) {
  //                     console.error(err);
  //                   } else {
  //                     console.log("File written successfully.");
  //                   }
  //                 });

  //                 // var keysArray = Object.keys(object);

  //                 // var location = new Object();
  //                 // var forecast = new Object();

  //                 // for (var i = 0; i < keysArray.length; i++) {
  //                 //   var key = keysArray[i];
  //                 //   if (key === 'location') {
  //                 //     location = object[key];
  //                 //   } else if (key === 'forecast') {
  //                 //     forecast = object[key].forecastday;
  //                 //     console.log(forecast.length);
  //                 //     console.log(forecast[0].date);
  //                 //     console.log(forecast[0].day.maxtemp_c);
  //                 //     console.log(object[key].forecastday.length);
  //                 //     console.log(object[key].forecastday[0].day);
  //                 //     console.log(object[key].forecastday[0].astro);
  //                 //     console.log(object[key].forecastday[0].hour.length);
  //                 //     console.log(object[key].forecastday[0].hour[0]);
  //                 //   }

  //                 // }

  //                 res.render("index", { title: "Data Served From Api." });
  //               })
  //               .catch(function (err) {
  //                 console.log(err);
  //               });
  //           }

  //           // console.log(locationsFromFile.name);
  //           // console.log(forecastFromFile[0].hour[0]);
  //         }
  //       );
  //     }
  //   }
  // });

  //     // try {
  //     //   if (fs.existsSync(path)) {
  //     //     console.log('file exists');
  //     //     // Calling the fs.readFileSync() method
  //     //     // for reading file
  //     //     // const data = fs.readFileSync(path, { encoding: 'utf8', flag: 'r' });

  //     //     // Display data
  //     //     // console.log(data);

  //     //   }
  //     // } catch (err) {
  //     //   console.log(err);
  //     // }

  //     // var keysArray = Object.keys(object);

  //     // var location = new Object();
  //     // var forecast = new Object();

  //     // for (var i = 0; i < keysArray.length; i++) {
  //     //   var key = keysArray[i];
  //     //   if (key === 'location') {
  //     //     location = object[key];
  //     //   } else if (key === 'forecast') {
  //     //     forecast = object[key].forecastday;
  //     //     console.log(forecast.length);
  //     //     console.log(forecast[0].date);
  //     //     console.log(forecast[0].day.maxtemp_c);
  //     //     console.log(object[key].forecastday.length);
  //     //     console.log(object[key].forecastday[0].day);
  //     //     console.log(object[key].forecastday[0].astro);
  //     //     console.log(object[key].forecastday[0].hour.length);
  //     //     console.log(object[key].forecastday[0].hour[0]);
  //     //   }

  //     // }

  //     res.render('index', { title: "Saklain" });
  //   })
  //   .catch(function (err) {
  //     console.log(err);
  //   })
});


router.get('/all/:country', function(req, res) {
  res.render("index", {title: "Only Country Route Hits."});
});

module.exports = router;

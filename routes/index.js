var express = require("express");
var router = express.Router();
var axios = require("axios").default;
const fs = require("fs");

const path = 'api-data.json';

const todayInMilliseconds = new Date();
const today = todayInMilliseconds.toISOString().slice(0,10);
console.log(today);

const oneDayInMilliseconds = 86400000; //number of milliseconds in a day
const sixDaysAgo = new Date(todayInMilliseconds - (6*oneDayInMilliseconds)).toISOString().slice(0,10);
console.log(sixDaysAgo);

var maxAvgTemperatureCelcius = maxAvgTemperatureFahrenheit = minAvgTemperatureCelcius = minAvgTemperatureFahrenheit = null;

// function fetchFromApi(country, city) {
//   var url = "https://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" 
//               + "&q=" + country + 
//               + "&q=" + city + 
//               "&dt=" + 2021-12-27 + 
//               "&end_dt=" + 2021-12-31 + "&aqi=no";

//   var data = null;
  
//   axios.get(url)
//         .then(function(response) {
//           data = response.data;
//         })
//         .catch(function(err) {
//           console.log(err);
//         });

//   console.log(data);

//   return JSON.stringify(data);
// };

router.get('/', function (req, res) {
  res.render('index', {title: 'HOME Page'});
})

/* GET weather data from api */
router.get("/all/:country/:city", function (req, res) {
  // Extracting URL parameters
  var country = req.params.country.toLowerCase();
  var city = req.params.city.toLowerCase();

  //var totalKeys = null;
  // var locationsFromFile = new Object();
  // var forecastFromFile = new Object();

  try {
    if(fs.existsSync(path)) {
      const data = fs.readFileSync(path, {encoding: "utf8", flag: "r"});
      // console.log(data);
      // console.log(data.length);
      if(data.length != 0) {
        const jsonData = JSON.parse(data);
        const lastIndex = (jsonData.forecast.forecastday.length) - 1;
        //const dataKeys = Object.keys(jsonData);
        if(jsonData.location.country.toLowerCase() === country && jsonData.location.name.toLowerCase() === city && jsonData.forecast.forecastday[lastIndex].date === today) {
          // loading file data
          const dataKeys = Object.keys(jsonData);
          var locationsFromFile = forecastFromFile = new Object();
          for (var i = 0; i < dataKeys.length; i++) {
            var index = dataKeys[i];
            if (index == "location") {
              locationsFromFile = jsonData[index];
            } else if (index == "forecast") {
              forecastFromFile = jsonData[index].forecastday;
            }
          }

          var forecastOfToday = forecastFromFile[lastIndex];
            // console.log(forecastOfToday);

            var forecastDay = forecastOfToday.day;
            var forecastAstro = forecastOfToday.astro;
            var forecastHour = forecastOfToday.hour;
            
            console.log("data served from localStorage");

            let maxtempSum_c = mintempSum_c = maxtempSum_f = mintempSum_f = 0;
            // let maxArrayCelcius = minArrayCelcius = maxArrayFahrenheit = minArrayFahrenheit = [];

            for(var i in forecastFromFile) {
              maxtempSum_c += forecastFromFile[i].day.maxtemp_c;
              console.log(forecastFromFile[i].day.maxtemp_c);
              mintempSum_c += forecastFromFile[i].day.mintemp_c;
              maxtempSum_f += forecastFromFile[i].day.maxtemp_f;
              mintempSum_f += forecastFromFile[i].day.mintemp_f;
              // maxArrayCelcius.push(parseFloat(forecastFromFile[i].day.maxtemp_c));
              // minArrayCelcius.push(parseFloat(forecastFromFile[i].day.mintemp_c));
              // maxArrayFahrenheit.push(parseFloat(forecastFromFile[i].day.maxtemp_f));
              // minArrayFahrenheit.push(parseFloat(forecastFromFile[i].day.mintemp_f));
            }

            // console.log(maxArrayFahrenheit);
            // console.log(Math.min(minArrayFahrenheit));

            // let highestTempCelcius = Math.max(maxArrayCelcius);
            // let highestTempFahrenheit = Math.max(maxArrayFahrenheit);
            // let lowestTempCelcius = Math.min(minArrayCelcius); 
            // let lowestTempFahrenheit = Math.min(minArrayFahrenheit);

            // console.log(highestTempCelcius, lowestTempCelcius);
            // console.log(highestTempFahrenheit, lowestTempFahrenheit);

            var maxAvgTempCelcius = (maxtempSum_c / forecastFromFile.length).toFixed(2);
            var maxAvgTemperatureFahrenheit = (maxtempSum_f / forecastFromFile.length).toFixed(2);
            var minAvgTemperatureCelcius = (mintempSum_c / forecastFromFile.length).toFixed(2);
            var minAvgTemperatureFahrenheit = (mintempSum_f / forecastFromFile.length).toFixed(2);

            console.log(maxAvgTempCelcius, maxAvgTemperatureFahrenheit, minAvgTemperatureCelcius, minAvgTemperatureFahrenheit);
            

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
            res.render("weather-report", { locationsFromFile, forecastDay, forecastAstro, forecastHour, today });

        } else {
          // fetch from api
          // let apiData = fetchFromApi(country, city);
          // console.log(apiData);
          // res.render('index', {title: 'Weather'});

          // send axios request
          axios
          .get(
            "https://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" +
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
            // console.log("http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" + "&q=" + country + "&q=" + city + "&dt=" + sixDaysAgo + "&end_dt=" + today + "&aqi=no");

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
    } else {
      // fetch from api
      // let apiData = fetchFromApi(country, city);
      // console.log(apiData);
      res.render("index", { title: "Rendered when there is no data in Local Storage."})
    }
  } catch (err) {
    console.log(err);
  }



  // try {
  //   if (fs.existsSync(path)) {
  //     console.log("file exists");
  //     fs.stat("api-data.json", function (err, stats) {
  //       if (err) {
  //         console.log(err);
  //       } else {
  //         // console.log(stats);
  //         // console.log(stats.size);
  //         if (stats.size != 0) {
  //           fs.readFile(
  //             "api-data.json",
  //             { encoding: "utf8", flag: "r" },
  //             function (err, data) {

  //               var test = JSON.parse(data);
    
  //               totalKeys = Object.keys(test);
    
  //               // console.log(totalKeys);

  //               console.log(test.location.country);
  //               console.log(test.forecast.forecastday[6].date);
    
  //               for (var i = 0; i < totalKeys.length; i++) {
  //                 var index = totalKeys[i];
  //                 if (index == "location") {
  //                   locationsFromFile = test[index];
  //                 } else if (index == "forecast") {
  //                   forecastFromFile = test[index].forecastday;
  //                 }
  //               }

  //               var lastIndex = forecastFromFile.length - 1;
    
  //               if (locationsFromFile.country.toLowerCase() === country && locationsFromFile.name.toLowerCase() === city && forecastFromFile[lastIndex].date === today) {

  //                 var forecastOfToday = forecastFromFile[lastIndex];
  //                 // console.log(forecastOfToday);

  //                 console.log(forecastOfToday.day);
  //                 console.log(forecastOfToday.astro);
  //                 console.log(forecastOfToday.hour[0]);

  //                 var forecastDay = forecastOfToday.day;
  //                 var icon = forecastDay.condition.icon.slice(2);
  //                 console.log(icon);
  //                 var forecastAstro = forecastOfToday.astro;
  //                 var forecastHour = forecastOfToday.hour;
                  
  //                 // console.log(forecastDay);
  //                 // console.log(forecastAstro);
  //                 // console.log(forecastHour);
  //                 // send data from localStorage
  //                 console.log("data served from localStorage");

  //                 //let 

  //                 for(var i in forecastFromFile) {

  //                 }
  //                 // console.log(locationsFromFile);
  //                 // console.log(forecastFromFile);
  //                 // console.log(forecastFromFile.length);
  //                 // for(var i in forecastFromFile) {
  //                 //   console.log("Max Temp in celcius = " + forecastFromFile[i].day.maxtemp_c);
  //                 //   console.log("Max Temp in fahrenheit = " + forecastFromFile[i].day.maxtemp_f);
  //                 //   console.log("Min Temp in celcius = " + forecastFromFile[i].day.mintemp_c);
  //                 //   console.log("Min Temp in fahrenheit = " + forecastFromFile[i].day.mintemp_f);
  //                 //   console.log("Avg Temp in celcius = " + forecastFromFile[i].day.avgtemp_c);
  //                 //   console.log("Avg Temp in fahrenheit = " + forecastFromFile[i].day.avgtemp_f);
  //                 //   console.log("Max Wind in mph = " + forecastFromFile[i].day.maxwind_mph);
  //                 //   console.log("Max Wind in kph = " + forecastFromFile[i].day.maxwind_kph);
  //                 //   console.log("Avg Humidity = " + forecastFromFile[i].day.avghumidity);
  //                 //   console.log("Condition = " + forecastFromFile[i].day.condition.text);
  //                 //   console.log("Sunrise time = " + forecastFromFile[i].astro.sunrise);
  //                 //   console.log("Sunset time = " + forecastFromFile[i].astro.sunset);
  //                 //   for(var j in forecastFromFile[i].hour) {
  //                 //     console.log(forecastFromFile[i].hour[j]);
  //                 //   }
  //                 // }
  //                 res.render("weather-report", { locationsFromFile, forecastDay, forecastAstro, forecastHour, today, icon });
  //                 // res.render("loop", {locationsFromFile, forecastFromFile });
  //               } else {
  //                 // send axios request
  //                 axios
  //                   .get(
  //                     "http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" +
  //                       "&q=" +
  //                       country +
  //                       "&q=" +
  //                       city +
  //                       "&dt=" +
  //                       sixDaysAgo +
  //                       "&end_dt=" +
  //                       today +
  //                       "&aqi=no"
  //                   )
  //                   .then(function (response) {
  //                     var jsonObject = JSON.stringify(response.data);
  //                     // console.log(typeof(jsonObject));
  //                     var object = JSON.parse(jsonObject);
  //                     console.log("http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" + "&q=" + country + "&q=" + city + "&dt=" + sixDaysAgo + "&end_dt=" + today + "&aqi=no");
    
  //                     fs.writeFile("api-data.json", jsonObject, (err) => {
  //                       if (err) {
  //                         console.error(err);
  //                       } else {
  //                         console.log("File written successfully.");
  //                       }
  //                     });
    
  //                     // var keysArray = Object.keys(object);
    
  //                     // var location = new Object();
  //                     // var forecast = new Object();
    
  //                     // for (var i = 0; i < keysArray.length; i++) {
  //                     //   var key = keysArray[i];
  //                     //   if (key === 'location') {
  //                     //     location = object[key];
  //                     //   } else if (key === 'forecast') {
  //                     //     forecast = object[key].forecastday;
  //                     //     console.log(forecast.length);
  //                     //     console.log(forecast[0].date);
  //                     //     console.log(forecast[0].day.maxtemp_c);
  //                     //     console.log(object[key].forecastday.length);
  //                     //     console.log(object[key].forecastday[0].day);
  //                     //     console.log(object[key].forecastday[0].astro);
  //                     //     console.log(object[key].forecastday[0].hour.length);
  //                     //     console.log(object[key].forecastday[0].hour[0]);
  //                     //   }
    
  //                     // }
    
  //                     res.render("index", { title: "Data Served From Api." });
  //                   })
  //                   .catch(function (err) {
  //                     console.log(err);
  //                   });
  //               }
    
  //               // console.log(locationsFromFile.name);
  //               // console.log(forecastFromFile[0].hour[0]);
  //             }
  //           );
  //         } else {
  //           // send axios request
  //           axios
  //             .get(
  //               "http://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" +
  //                 "&q=" +
  //                 country +
  //                 "&q=" +
  //                 city +
  //                 "&dt=" +
  //                 sixDaysAgo +
  //                 "&end_dt=" +
  //                 today +
  //                 "&aqi=no"
  //             )
  //             .then(function (response) {
  //               var jsonObject = JSON.stringify(response.data);
  //               // console.log(typeof(jsonObject));
  //               var object = JSON.parse(jsonObject);

  //               fs.writeFile("api-data.json", jsonObject, (err) => {
  //                 if (err) {
  //                   console.error(err);
  //                 } else {
  //                   console.log("File written successfully.");
  //                 }
  //               });

  //               // var keysArray = Object.keys(object);

  //               // var location = new Object();
  //               // var forecast = new Object();

  //               // for (var i = 0; i < keysArray.length; i++) {
  //               //   var key = keysArray[i];
  //               //   if (key === 'location') {
  //               //     location = object[key];
  //               //   } else if (key === 'forecast') {
  //               //     forecast = object[key].forecastday;
  //               //     console.log(forecast.length);
  //               //     console.log(forecast[0].date);
  //               //     console.log(forecast[0].day.maxtemp_c);
  //               //     console.log(object[key].forecastday.length);
  //               //     console.log(object[key].forecastday[0].day);
  //               //     console.log(object[key].forecastday[0].astro);
  //               //     console.log(object[key].forecastday[0].hour.length);
  //               //     console.log(object[key].forecastday[0].hour[0]);
  //               //   }

  //               // }

  //               res.render("index", { title: "Data Served From Api." });
  //             })
  //             .catch(function (err) {
  //               console.log(err);
  //             });
  //         }
  //       }
  //     });

  //   }
  // } catch (err) {
  //   console.log(err);
  // }

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

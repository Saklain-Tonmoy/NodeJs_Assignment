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

// var maxAvgTemperatureCelcius = maxAvgTemperatureFahrenheit = minAvgTemperatureCelcius = minAvgTemperatureFahrenheit = null;

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
  // var forecast = new Object();

  //console.log(fs.existsSync(path));

  try {
    // if(fs.existsSync(path)) {
      var fileData = fs.readFileSync(path, {encoding: "utf8", flag: "r"});
      console.log(fileData.length);
      // console.log(data);
      // console.log(data.length);
      if(fileData.length != 0) {
        let jsonData = JSON.parse(fileData);
        let lastIndexFromFile = (jsonData.forecast.forecastday.length) - 1;
        //const dataKeys = Object.keys(jsonData);
        if(jsonData.location.country.toLowerCase() === country && jsonData.location.name.toLowerCase() === city && jsonData.forecast.forecastday[lastIndexFromFile].date === today) {

          // loading file data
          let dataKeys = Object.keys(jsonData);
          var locations = forecast = new Object();
          for (var i = 0; i < dataKeys.length; i++) {
            var index = dataKeys[i];
            if (index == "location") {
              locations = jsonData[index];
            } else if (index == "forecast") {
              forecast = jsonData[index].forecastday;
            }
          }

          var forecastOfToday = forecast[lastIndexFromFile];
            // console.log(forecastOfToday);

            var forecastDay = forecastOfToday.day;
            var forecastAstro = forecastOfToday.astro;
            var forecastHour = forecastOfToday.hour;
            
            console.log("data served from localStorage");

            var maxtempSum_c = mintempSum_c = maxtempSum_f = mintempSum_f = 0;
            var maxArrayCelcius = []; 
            var minArrayCelcius = []; 
            var maxArrayFahrenheit = []; 
            var minArrayFahrenheit = [];

            for(var i = 0; i < forecast.length; i++) {
              maxtempSum_c += forecast[i].day.maxtemp_c;
              console.log(forecast[i].day.maxtemp_c);
              mintempSum_c += forecast[i].day.mintemp_c;
              maxtempSum_f += forecast[i].day.maxtemp_f;
              mintempSum_f += forecast[i].day.mintemp_f;
              maxArrayCelcius.push(parseFloat(forecast[i].day.maxtemp_c));
              minArrayCelcius.push(parseFloat(forecast[i].day.mintemp_c));
              maxArrayFahrenheit.push(parseFloat(forecast[i].day.maxtemp_f));
              minArrayFahrenheit.push(parseFloat(forecast[i].day.mintemp_f));
            }

            // Max and Min temperature of 7 days including today
            let highestTempCelcius = Math.max(...maxArrayCelcius);
            let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
            let lowestTempCelcius = Math.min(...minArrayCelcius); 
            let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

            console.log(highestTempCelcius, lowestTempCelcius);
            console.log(highestTempFahrenheit, lowestTempFahrenheit);

            // Average temperature of 7 days including today
            var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
            var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
            var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
            var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);
            
            res.render("weather-report", { locations, forecastDay, forecastAstro, forecastHour, today, highestTempCelcius, highestTempFahrenheit, lowestTempCelcius, lowestTempFahrenheit, maxAvgTempCelcius, maxAvgTempFahrenheit, minAvgTempCelcius, minAvgTempFahrenheit});

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
            console.log(response.data.location.country.toLowerCase());
            console.log(response.data.location.name.toLowerCase());

            if(response.data.location.country.toLowerCase() === country && response.data.location.name.toLowerCase() === city) {
              // store data and render a view
              var stringifiedData = JSON.stringify(response.data);
              //var jsonObject = JSON.parse(stringifiedData);

              fs.writeFile("api-data.json", stringifiedData, (err) => {
                if (err) {
                  console.error(err);
                } else {
                  console.log("File written successfully.");
                }
              });

              console.log(Object.keys(response.data));

              let dataKeys = Object.keys(response.data);
              var locations = forecast = new Object();
              for (var i = 0; i < dataKeys.length; i++) {
                var index = dataKeys[i];
                if (index == "location") {
                  locations = response.data[index];
                } else if (index == "forecast") {
                  forecast = response.data[index].forecastday;
                }
              }

              let lastIndex = (forecast.length) - 1;
              var forecastOfToday = forecast[lastIndex];
                // console.log(forecastOfToday);

                var forecastDay = forecastOfToday.day;
                var forecastAstro = forecastOfToday.astro;
                var forecastHour = forecastOfToday.hour;

                var maxtempSum_c = mintempSum_c = maxtempSum_f = mintempSum_f = 0;
                var maxArrayCelcius = []; 
                var minArrayCelcius = []; 
                var maxArrayFahrenheit = []; 
                var minArrayFahrenheit = [];

                for(var i = 0; i < forecast.length; i++) {
                  maxtempSum_c += forecast[i].day.maxtemp_c;
                  console.log(forecast[i].day.maxtemp_c);
                  mintempSum_c += forecast[i].day.mintemp_c;
                  maxtempSum_f += forecast[i].day.maxtemp_f;
                  mintempSum_f += forecast[i].day.mintemp_f;
                  maxArrayCelcius.push(parseFloat(forecast[i].day.maxtemp_c));
                  minArrayCelcius.push(parseFloat(forecast[i].day.mintemp_c));
                  maxArrayFahrenheit.push(parseFloat(forecast[i].day.maxtemp_f));
                  minArrayFahrenheit.push(parseFloat(forecast[i].day.mintemp_f));
                }

                // Max and Min temperature of 7 days including today
                let highestTempCelcius = Math.max(...maxArrayCelcius);
                let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
                let lowestTempCelcius = Math.min(...minArrayCelcius); 
                let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

                console.log(highestTempCelcius, lowestTempCelcius);
                console.log(highestTempFahrenheit, lowestTempFahrenheit);

                // Average temperature of 7 days including today
                var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
                var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
                var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
                var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);
                
                console.log("Data served from Api");
                res.render("weather-report", { locations, forecastDay, forecastAstro, forecastHour, today, highestTempCelcius, highestTempFahrenheit, lowestTempCelcius, lowestTempFahrenheit, maxAvgTempCelcius, maxAvgTempFahrenheit, minAvgTempCelcius, minAvgTempFahrenheit});

              // res.render("index", { title: "Data Served From Api." });
            } else {
              res.render("index", { title: "Wrong URL parameter." });
            }

          })
          .catch(function (err) {
            console.log(err);
          });
        }
      } else {
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
          console.log(response.data.location);

          if(response.data.location.country.toLowerCase() === country && response.data.location.name.toLowerCase() === city) {
            // store data and render a view
            var stringifiedData = JSON.stringify(response.data);
            //var jsonObject = JSON.parse(stringifiedData);

            fs.writeFile("api-data.json", stringifiedData, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log("File written successfully.");
              }
            });

            console.log(Object.keys(response.data));

            let dataKeys = Object.keys(response.data);
            var locations = forecast = new Object();
            for (var i = 0; i < dataKeys.length; i++) {
              var index = dataKeys[i];
              if (index == "location") {
                locations = response.data[index];
              } else if (index == "forecast") {
                forecast = response.data[index].forecastday;
              }
            }

            let lastIndex = (forecast.length) - 1;
            var forecastOfToday = forecast[lastIndex];
              // console.log(forecastOfToday);

              var forecastDay = forecastOfToday.day;
              var forecastAstro = forecastOfToday.astro;
              var forecastHour = forecastOfToday.hour;

              var maxtempSum_c = mintempSum_c = maxtempSum_f = mintempSum_f = 0;
              var maxArrayCelcius = []; 
              var minArrayCelcius = []; 
              var maxArrayFahrenheit = []; 
              var minArrayFahrenheit = [];

              for(var i = 0; i < forecast.length; i++) {
                maxtempSum_c += forecast[i].day.maxtemp_c;
                console.log(forecast[i].day.maxtemp_c);
                mintempSum_c += forecast[i].day.mintemp_c;
                maxtempSum_f += forecast[i].day.maxtemp_f;
                mintempSum_f += forecast[i].day.mintemp_f;
                maxArrayCelcius.push(parseFloat(forecast[i].day.maxtemp_c));
                minArrayCelcius.push(parseFloat(forecast[i].day.mintemp_c));
                maxArrayFahrenheit.push(parseFloat(forecast[i].day.maxtemp_f));
                minArrayFahrenheit.push(parseFloat(forecast[i].day.mintemp_f));
              }

              // Max and Min temperature of 7 days including today
              let highestTempCelcius = Math.max(...maxArrayCelcius);
              let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
              let lowestTempCelcius = Math.min(...minArrayCelcius); 
              let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

              console.log(highestTempCelcius, lowestTempCelcius);
              console.log(highestTempFahrenheit, lowestTempFahrenheit);

              // Average temperature of 7 days including today
              var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
              var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
              var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
              var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);
              
              console.log("Data served from Api");
              res.render("weather-report", { locations, forecastDay, forecastAstro, forecastHour, today, highestTempCelcius, highestTempFahrenheit, lowestTempCelcius, lowestTempFahrenheit, maxAvgTempCelcius, maxAvgTempFahrenheit, minAvgTempCelcius, minAvgTempFahrenheit});

            // res.render("index", { title: "Data Served From Api." });
          } else {
            res.render("index", { title: "Wrong URL parameter." });
          }

        })
        .catch(function (err) {
          console.log(err);
        });
      }
    // } else {
    //   // fetch from api and create file
    //   // let apiData = fetchFromApi(country, city);
    //   // console.log(apiData);
    //   // fs.closeSync(fs.openSync(filepath, 'a'));
    //   res.render("index", { title: "Rendered when the file does not exist." });
    // }
  } catch (err) {
    console.log(err);
  }

});


router.get('/all/:country', function(req, res) {
  res.render("index", {title: "Only Country Route Hits."});
});

module.exports = router;

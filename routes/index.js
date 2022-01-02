var express = require("express");
var router = express.Router();
var axios = require("axios").default;
const fs = require("fs");

const path = "api-data.json";

const todayInMilliseconds = new Date();
const today = todayInMilliseconds.toISOString().slice(0, 10);
console.log(today);

const oneDayInMilliseconds = 86400000; //number of milliseconds in a day
const sixDaysAgo = new Date(todayInMilliseconds - 6 * oneDayInMilliseconds)
  .toISOString()
  .slice(0, 10);
console.log(sixDaysAgo);

router.get("/", function (req, res) {
  res.render("index", { title: "Welcome to Express Weather App.", today });
});

/* GET weather data from api */
router.get("/all/:country/:city", function (req, res) {
  // Extracting URL parameters
  var country = req.params.country.toLowerCase();
  var city = req.params.city.toLowerCase();

  console.log(country, city);

  try {
    var fileData = fs.readFileSync(path, { encoding: "utf8", flag: "r" });

    if (fileData.length != 0) {
      let jsonData = JSON.parse(fileData);
      let lastIndexFromFile = jsonData.forecast.forecastday.length - 1;
      if (
        jsonData.location.country.toLowerCase() === country &&
        jsonData.location.name.toLowerCase() === city &&
        jsonData.forecast.forecastday[lastIndexFromFile].date === today
      ) {
        // loading file data
        let dataKeys = Object.keys(jsonData);

        // that's how to declare and assign multiple variables at a time
        var locations = (forecast = new Object());

        for (var i = 0; i < dataKeys.length; i++) {
          var index = dataKeys[i];
          if (index == "location") {
            locations = jsonData[index];
          } else if (index == "forecast") {
            forecast = jsonData[index].forecastday;
          }
        }

        var forecastOfToday = forecast[lastIndexFromFile];

        var forecastDay = forecastOfToday.day;
        var forecastAstro = forecastOfToday.astro;
        var forecastHour = forecastOfToday.hour;

        console.log("data served from localStorage");

        // that's how to declare and assign multiple variables at a time
        var maxtempSum_c = (mintempSum_c = maxtempSum_f = mintempSum_f = 0);

        var maxArrayCelcius = [];
        var minArrayCelcius = [];
        var maxArrayFahrenheit = [];
        var minArrayFahrenheit = [];

        for (var i = 0; i < forecast.length; i++) {
          maxtempSum_c += forecast[i].day.maxtemp_c;
          mintempSum_c += forecast[i].day.mintemp_c;
          maxtempSum_f += forecast[i].day.maxtemp_f;
          mintempSum_f += forecast[i].day.mintemp_f;
          maxArrayCelcius.push(parseFloat(forecast[i].day.maxtemp_c));
          minArrayCelcius.push(parseFloat(forecast[i].day.mintemp_c));
          maxArrayFahrenheit.push(parseFloat(forecast[i].day.maxtemp_f));
          minArrayFahrenheit.push(parseFloat(forecast[i].day.mintemp_f));
        }

        console.log(maxtempSum_c);
        console.log(maxArrayCelcius);

        // Max and Min temperature of 7 days including today.
        // this (...) 3 dots extracts the values from array.
        // it's called Array/Object spread operator
        let highestTempCelcius = Math.max(...maxArrayCelcius);
        let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
        let lowestTempCelcius = Math.min(...minArrayCelcius);
        let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

        // Average temperature of 7 days including today
        var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
        var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
        var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
        var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);

        res.render("weather-report", {
          locations,
          forecastDay,
          forecastAstro,
          forecastHour,
          today,
          highestTempCelcius,
          highestTempFahrenheit,
          lowestTempCelcius,
          lowestTempFahrenheit,
          maxAvgTempCelcius,
          maxAvgTempFahrenheit,
          minAvgTempCelcius,
          minAvgTempFahrenheit,
        });
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
            console.log(response.data.location.country.toLowerCase());
            console.log(response.data.location.name.toLowerCase());
            console.log(response.data);
            if (
              response.data.location.country.toLowerCase() === country &&
              response.data.location.name.toLowerCase() === city
            ) {
              // store data and render a view
              var stringifiedData = JSON.stringify(response.data);

              fs.writeFile("api-data.json", stringifiedData, (err) => {
                if (err) {
                  console.error(err);
                } else {
                  console.log("File written successfully.");
                }
              });

              let dataKeys = Object.keys(response.data);

              // that's how to declare and assign multiple variables at a time
              var locations = (forecast = new Object());

              for (var i = 0; i < dataKeys.length; i++) {
                var index = dataKeys[i];
                if (index == "location") {
                  locations = response.data[index];
                } else if (index == "forecast") {
                  forecast = response.data[index].forecastday;
                }
              }

              let lastIndex = forecast.length - 1;
              var forecastOfToday = forecast[lastIndex];

              var forecastDay = forecastOfToday.day;
              var forecastAstro = forecastOfToday.astro;
              var forecastHour = forecastOfToday.hour;

              // that's how to declare and assign multiple variables at a time
              var maxtempSum_c =
                (mintempSum_c =
                maxtempSum_f =
                mintempSum_f =
                  0);

              var maxArrayCelcius = [];
              var minArrayCelcius = [];
              var maxArrayFahrenheit = [];
              var minArrayFahrenheit = [];

              for (var i = 0; i < forecast.length; i++) {
                maxtempSum_c += forecast[i].day.maxtemp_c;
                mintempSum_c += forecast[i].day.mintemp_c;
                maxtempSum_f += forecast[i].day.maxtemp_f;
                mintempSum_f += forecast[i].day.mintemp_f;
                maxArrayCelcius.push(parseFloat(forecast[i].day.maxtemp_c));
                minArrayCelcius.push(parseFloat(forecast[i].day.mintemp_c));
                maxArrayFahrenheit.push(parseFloat(forecast[i].day.maxtemp_f));
                minArrayFahrenheit.push(parseFloat(forecast[i].day.mintemp_f));
              }

              console.log(maxtempSum_c);
              console.log(maxArrayCelcius);

              // Max and Min temperature of 7 days including today.
              // this (...) 3 dots extracts the values from array.
              // it's called Array/Object spread operator
              let highestTempCelcius = Math.max(...maxArrayCelcius);
              let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
              let lowestTempCelcius = Math.min(...minArrayCelcius);
              let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

              // Average temperature of 7 days including today
              var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
              var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
              var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
              var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);

              console.log("Data served from Api");
              res.render("weather-report", {
                locations,
                forecastDay,
                forecastAstro,
                forecastHour,
                today,
                highestTempCelcius,
                highestTempFahrenheit,
                lowestTempCelcius,
                lowestTempFahrenheit,
                maxAvgTempCelcius,
                maxAvgTempFahrenheit,
                minAvgTempCelcius,
                minAvgTempFahrenheit,
              });

              // res.render("index", { title: "Data Served From Api." });
            } else {
              res.render("not-found", {
                message: "Data not found. Wrong URL parameter.",
              });
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

          if (
            response.data.location.country.toLowerCase() === country &&
            response.data.location.name.toLowerCase() === city
          ) {
            // store data and render a view
            var stringifiedData = JSON.stringify(response.data);

            fs.writeFile("api-data.json", stringifiedData, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log("File written successfully.");
              }
            });

            let dataKeys = Object.keys(response.data);
            var locations = (forecast = new Object());
            for (var i = 0; i < dataKeys.length; i++) {
              var index = dataKeys[i];
              if (index == "location") {
                locations = response.data[index];
              } else if (index == "forecast") {
                forecast = response.data[index].forecastday;
              }
            }

            let lastIndex = forecast.length - 1;
            var forecastOfToday = forecast[lastIndex];

            var forecastDay = forecastOfToday.day;
            var forecastAstro = forecastOfToday.astro;
            var forecastHour = forecastOfToday.hour;

            // that's how to declare and assign multiple variables at a time
            var maxtempSum_c = (mintempSum_c = maxtempSum_f = mintempSum_f = 0);

            var maxArrayCelcius = [];
            var minArrayCelcius = [];
            var maxArrayFahrenheit = [];
            var minArrayFahrenheit = [];

            for (var i = 0; i < forecast.length; i++) {
              maxtempSum_c += forecast[i].day.maxtemp_c;
              mintempSum_c += forecast[i].day.mintemp_c;
              maxtempSum_f += forecast[i].day.maxtemp_f;
              mintempSum_f += forecast[i].day.mintemp_f;
              maxArrayCelcius.push(parseFloat(forecast[i].day.maxtemp_c));
              minArrayCelcius.push(parseFloat(forecast[i].day.mintemp_c));
              maxArrayFahrenheit.push(parseFloat(forecast[i].day.maxtemp_f));
              minArrayFahrenheit.push(parseFloat(forecast[i].day.mintemp_f));
            }

            console.log(maxtempSum_c);
            console.log(maxArrayCelcius);

            // Max and Min temperature of 7 days including today.
            // this (...) 3 dots extracts the values from array.
            // it's called Array/Object spread operator
            let highestTempCelcius = Math.max(...maxArrayCelcius);
            let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
            let lowestTempCelcius = Math.min(...minArrayCelcius);
            let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

            // Average temperature of 7 days including today
            var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
            var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
            var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
            var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);

            console.log("Data served from Api");
            res.render("weather-report", {
              locations,
              forecastDay,
              forecastAstro,
              forecastHour,
              today,
              highestTempCelcius,
              highestTempFahrenheit,
              lowestTempCelcius,
              lowestTempFahrenheit,
              maxAvgTempCelcius,
              maxAvgTempFahrenheit,
              minAvgTempCelcius,
              minAvgTempFahrenheit,
            });
          } else {
            res.render("not-found", {
              message: "Data not found. Wrong URL parameter.",
            });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/all/:place", function (req, res) {
  // Extracting URL parameters
  var place = req.params.place.toLowerCase();
  console.log(place);

  try {
    var fileData = fs.readFileSync(path, { encoding: "utf8", flag: "r" });
    console.log(fileData.length);

    if (fileData.length != 0) {
      let jsonData = JSON.parse(fileData);
      let lastIndexFromFile = jsonData.forecast.forecastday.length - 1;

      if (
        (jsonData.location.country.toLowerCase() === place ||
          jsonData.location.name.toLowerCase() === place) &&
        jsonData.forecast.forecastday[lastIndexFromFile].date === today
      ) {
        // loading file data
        let dataKeys = Object.keys(jsonData);
        var locations = (forecast = new Object());
        for (var i = 0; i < dataKeys.length; i++) {
          var index = dataKeys[i];
          if (index == "location") {
            locations = jsonData[index];
          } else if (index == "forecast") {
            forecast = jsonData[index].forecastday;
          }
        }

        var forecastOfToday = forecast[lastIndexFromFile];

        var forecastDay = forecastOfToday.day;
        var forecastAstro = forecastOfToday.astro;
        var forecastHour = forecastOfToday.hour;

        console.log("data served from localStorage");

        // that's how to declare and assign multiple variables at a time
        var maxtempSum_c = (mintempSum_c = maxtempSum_f = mintempSum_f = 0);

        var maxArrayCelcius = [];
        var minArrayCelcius = [];
        var maxArrayFahrenheit = [];
        var minArrayFahrenheit = [];

        for (var i = 0; i < forecast.length; i++) {
          maxtempSum_c += forecast[i].day.maxtemp_c;
          mintempSum_c += forecast[i].day.mintemp_c;
          maxtempSum_f += forecast[i].day.maxtemp_f;
          mintempSum_f += forecast[i].day.mintemp_f;
          maxArrayCelcius.push(parseFloat(forecast[i].day.maxtemp_c));
          minArrayCelcius.push(parseFloat(forecast[i].day.mintemp_c));
          maxArrayFahrenheit.push(parseFloat(forecast[i].day.maxtemp_f));
          minArrayFahrenheit.push(parseFloat(forecast[i].day.mintemp_f));
        }

        console.log(maxtempSum_c);
        console.log(maxArrayCelcius);

        // Max and Min temperature of 7 days including today
        let highestTempCelcius = Math.max(...maxArrayCelcius);
        let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
        let lowestTempCelcius = Math.min(...minArrayCelcius);
        let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

        // Average temperature of 7 days including today
        var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
        var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
        var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
        var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);

        res.render("weather-report", {
          locations,
          forecastDay,
          forecastAstro,
          forecastHour,
          today,
          highestTempCelcius,
          highestTempFahrenheit,
          lowestTempCelcius,
          lowestTempFahrenheit,
          maxAvgTempCelcius,
          maxAvgTempFahrenheit,
          minAvgTempCelcius,
          minAvgTempFahrenheit,
        });
      } else {
        console.log("Hit this condition.");
        // send axios request
        axios
          .get(
            "https://api.weatherapi.com/v1/history.json?key=18163b2b531c4d2097941247212912" +
              "&q=" +
              place +
              "&dt=" +
              sixDaysAgo +
              "&end_dt=" +
              today +
              "&aqi=no"
          )
          .then(function (response) {
            if (
              response.data.location.country.toLowerCase() === place ||
              response.data.location.name.toLowerCase() === place
            ) {
              // store data and render a view
              var stringifiedData = JSON.stringify(response.data);
              fs.writeFile("api-data.json", stringifiedData, (err) => {
                if (err) {
                  console.error(err);
                } else {
                  console.log("File written successfully.");
                }
              });

              let dataKeys = Object.keys(response.data);

              // that's how to declare and assign multiple variables at a time
              var locations = (forecast = new Object());

              for (var i = 0; i < dataKeys.length; i++) {
                var index = dataKeys[i];
                if (index == "location") {
                  locations = response.data[index];
                } else if (index == "forecast") {
                  forecast = response.data[index].forecastday;
                }
              }

              let lastIndex = forecast.length - 1;
              var forecastOfToday = forecast[lastIndex];

              var forecastDay = forecastOfToday.day;
              var forecastAstro = forecastOfToday.astro;
              var forecastHour = forecastOfToday.hour;

              // that's how to declare and assign multiple variables at a time'
              var maxtempSum_c =
                (mintempSum_c =
                maxtempSum_f =
                mintempSum_f =
                  0);

              var maxArrayCelcius = [];
              var minArrayCelcius = [];
              var maxArrayFahrenheit = [];
              var minArrayFahrenheit = [];

              for (var i = 0; i < forecast.length; i++) {
                maxtempSum_c += forecast[i].day.maxtemp_c;
                mintempSum_c += forecast[i].day.mintemp_c;
                maxtempSum_f += forecast[i].day.maxtemp_f;
                mintempSum_f += forecast[i].day.mintemp_f;
                maxArrayCelcius.push(parseFloat(forecast[i].day.maxtemp_c));
                minArrayCelcius.push(parseFloat(forecast[i].day.mintemp_c));
                maxArrayFahrenheit.push(parseFloat(forecast[i].day.maxtemp_f));
                minArrayFahrenheit.push(parseFloat(forecast[i].day.mintemp_f));
              }

              console.log(maxtempSum_c);
              console.log(maxArrayCelcius);

              // Max and Min temperature of 7 days including today.
              // this (...) 3 dots extracts the values from array.
              // it's called Array/Object spread operator
              let highestTempCelcius = Math.max(...maxArrayCelcius);
              let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
              let lowestTempCelcius = Math.min(...minArrayCelcius);
              let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

              // Average temperature of 7 days including today
              var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
              var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
              var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
              var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);

              console.log("Data served from Api");
              res.render("weather-report", {
                locations,
                forecastDay,
                forecastAstro,
                forecastHour,
                today,
                highestTempCelcius,
                highestTempFahrenheit,
                lowestTempCelcius,
                lowestTempFahrenheit,
                maxAvgTempCelcius,
                maxAvgTempFahrenheit,
                minAvgTempCelcius,
                minAvgTempFahrenheit,
              });
            } else {
              res.render("not-found", {
                message: "Data not found. Wrong URL parameter.",
              });
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
            place +
            "&dt=" +
            sixDaysAgo +
            "&end_dt=" +
            today +
            "&aqi=no"
        )
        .then(function (response) {
          if (
            response.data.location.country.toLowerCase() === place ||
            response.data.location.name.toLowerCase() === city
          ) {
            // store data and render a view
            var stringifiedData = JSON.stringify(response.data);

            fs.writeFile("api-data.json", stringifiedData, (err) => {
              if (err) {
                console.error(err);
              } else {
                console.log("File written successfully.");
              }
            });

            let dataKeys = Object.keys(response.data);

            // that's how to declare and assign multiple variables at a time
            var locations = (forecast = new Object());
            for (var i = 0; i < dataKeys.length; i++) {
              var index = dataKeys[i];
              if (index == "location") {
                locations = response.data[index];
              } else if (index == "forecast") {
                forecast = response.data[index].forecastday;
              }
            }

            let lastIndex = forecast.length - 1;
            var forecastOfToday = forecast[lastIndex];

            var forecastDay = forecastOfToday.day;
            var forecastAstro = forecastOfToday.astro;
            var forecastHour = forecastOfToday.hour;

            // that's how to declare and assign multiple variables at a time
            var maxtempSum_c = (mintempSum_c = maxtempSum_f = mintempSum_f = 0);

            var maxArrayCelcius = [];
            var minArrayCelcius = [];
            var maxArrayFahrenheit = [];
            var minArrayFahrenheit = [];

            for (var i = 0; i < forecast.length; i++) {
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

            console.log(maxtempSum_c);
            console.log(maxArrayCelcius);

            // Max and Min temperature of 7 days including today.
            // this (...) 3 dots extracts the values from array.
            // it's called Array/Object spread operator
            let highestTempCelcius = Math.max(...maxArrayCelcius);
            let highestTempFahrenheit = Math.max(...maxArrayFahrenheit);
            let lowestTempCelcius = Math.min(...minArrayCelcius);
            let lowestTempFahrenheit = Math.min(...minArrayFahrenheit);

            // Average temperature of 7 days including today
            var maxAvgTempCelcius = (maxtempSum_c / forecast.length).toFixed(2);
            var maxAvgTempFahrenheit = (maxtempSum_f / forecast.length).toFixed(2);
            var minAvgTempCelcius = (mintempSum_c / forecast.length).toFixed(2);
            var minAvgTempFahrenheit = (mintempSum_f / forecast.length).toFixed(2);

            console.log("Data served from Api");
            res.render("weather-report", {
              locations,
              forecastDay,
              forecastAstro,
              forecastHour,
              today,
              highestTempCelcius,
              highestTempFahrenheit,
              lowestTempCelcius,
              lowestTempFahrenheit,
              maxAvgTempCelcius,
              maxAvgTempFahrenheit,
              minAvgTempCelcius,
              minAvgTempFahrenheit,
            });
          } else {
            res.render("not-found", {
              message: "Data not found. Wrong URL parameter.",
            });
          }
        })
        .catch(function (err) {
          console.log(err);
        });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

var express = require("express");
var router = express.Router();
var axios = require("axios").default;
const fs = require("fs");


// requiring express-rate-limit. this must be below the ### var app = express() or var express = require("express");
const rateLimit = require('express-rate-limit');

// this function is handling what will happen when the limit is reached
const limitReached = (req, res) => {
  res.render('forbidden', { message: "Too many requests. You can request once in 10 seconds." });
};

// initializing express-rate-limit
const apiRequestLimiter = rateLimit({
  windowMs: 10 * 1000, // 10 seconds
  max: 1, // limit each IP to 1 requests per windowMs
  handler: limitReached,
});

// path for storing data locally
const path = "api-data.json";

// calculating today's date
const todayInMilliseconds = new Date();
const today = todayInMilliseconds.toISOString().slice(0, 10);
console.log(today);

// calculating the date SIX days ago from today
const oneDayInMilliseconds = 86400000; //number of milliseconds in a day
const sixDaysAgo = new Date(todayInMilliseconds - 6 * oneDayInMilliseconds).toISOString().slice(0, 10);
console.log(sixDaysAgo);

// manipulating and returning required data for rendering
function serveData(jsonData, lastIndex) {
  console.log("Data Served From Function");

  // Object.keys() method returns an array containing the keys from the Object
  let dataKeys = Object.keys(jsonData);

  // that's how to declare and assign multiple variables at a time
  var locations = (forecast = new Object());

  // seperating the values from Object based on keys
  for (var i = 0; i < dataKeys.length; i++) {
    var index = dataKeys[i];
    if (index == "location") {
      locations = jsonData[index];
    } else if (index == "forecast") {
      forecast = jsonData[index].forecastday;
    }
  }

  // extracting today's weather forecast data
  var forecastOfToday = forecast[lastIndex];
  var forecastDay = forecastOfToday.day;
  var forecastAstro = forecastOfToday.astro;
  var forecastHour = forecastOfToday.hour;

  // that's how to declare and assign multiple variables at a time
  var maxtempSum_c = (mintempSum_c = maxtempSum_f = mintempSum_f = 0);

  // If we assign multiple arrays in a single line, then it's occur error. that's why we have declare and assign it seperately
  var maxArrayCelcius = [];
  var minArrayCelcius = [];
  var maxArrayFahrenheit = [];
  var minArrayFahrenheit = [];

  // calculating SUM of Max, and Min values. And storing data inside array.
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

  // returning data as Object
  return {
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
    minAvgTempFahrenheit
  };

}

// receiving Stringified data and storing it into File.
function storeData(data) {
  fs.writeFile("api-data.json", data, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log("File written successfully.");
    }
  });
}

// home route
router.get("/", function (req, res) {
  res.render("index", { title: "Welcome to Express Weather App.", today });
});

/* GET weather data from api */
router.get("/all/:country/:city", apiRequestLimiter, function (req, res) {
  // Extracting URL parameters
  var country = req.params.country.toLowerCase();
  var city = req.params.city.toLowerCase();

  console.log(country, city);

  try {
    // reading data from file
    var fileData = fs.readFileSync(path, { encoding: "utf8", flag: "r" });

    if (fileData.length != 0) {
      let jsonData = JSON.parse(fileData);
      let lastIndex = jsonData.forecast.forecastday.length - 1;

      // checking if the requested parameters does match with the locally stored data
      // also checking if the locally stored data does contain the weather report of today
      if (
        jsonData.location.country.toLowerCase() === country &&
        jsonData.location.name.toLowerCase() === city &&
        jsonData.forecast.forecastday[lastIndex].date === today
      ) {

        console.log("data served from localStorage");

        // at first, sending Data in JSON format with lastIndex and then receiving the data.
        // lastIndex is required to check if stored data has the weather report of today
        var receivedData = serveData(jsonData, lastIndex);
        // console.log(receivedData);

        res.render("weather-report", {...receivedData});

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

            // checking if the requested parameters does match with the response data
            if (
              response.data.location.country.toLowerCase() === country &&
              response.data.location.name.toLowerCase() === city
            ) {
              
              // storing data into localStorage
              storeData(JSON.stringify(response.data));

              console.log("data served from API");

              // at first, sending (response.data) which is in JSON format with lastIndex and then receiving the data.
              // lastIndex is required to check if stored data has the weather report of today
              let lastIndex = response.data.forecast.forecastday.length - 1;
              var receivedData = serveData(response.data, lastIndex);

              res.render("weather-report", {...receivedData});

            } else {
              res.render("not-found", {
                message: "Data not found. Wrong URL parameter.",
              });
            }
          })
          .catch(function (err) {
            // console.log(err);
            console.log(err.response.status);
            if(err.response.status === 400) {
              res.render("error", {message: "Bad Request. This message was shown from API and did not serve any data."});
            }
          });
      }
    } else {
      console.log("File is empty. That's why data served from API");
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

          // checking if the requested parameters does match with the response data
          if (
            response.data.location.country.toLowerCase() === country &&
            response.data.location.name.toLowerCase() === city
          ) {
            
            // storing data into localStorage
            storeData(JSON.stringify(response.data));

            // at first, sending (response.data) which is in JSON format with lastIndex and then receiving the data.
            // lastIndex is required to check if stored data has the weather report of today
            let lastIndex = response.data.forecast.forecastday.length - 1;
            var receivedData = serveData(response.data, lastIndex);

            res.render("weather-report", {...receivedData});

          } else {
            res.render("not-found", {
              message: "Data not found. Wrong URL parameter.",
            });
          }
        })
        .catch(function (err) {
          // console.log(err);
          console.log(err.response.status);
          if(err.response.status === 400) {
            res.render("error", {message: "Bad Request. This message was shown from API and did not serve any data."});
          }
        });
    }
  } catch (err) {
    console.log(err);
  }
});

router.get("/all/:place", apiRequestLimiter, function (req, res) {
  // Extracting URL parameters
  var place = req.params.place.toLowerCase();
  console.log(place);

  try {
    var fileData = fs.readFileSync(path, { encoding: "utf8", flag: "r" });
    console.log(fileData.length);

    if (fileData.length != 0) {
      let jsonData = JSON.parse(fileData);
      let lastIndex = jsonData.forecast.forecastday.length - 1;

      // checking if the requested parameters does match with the locally stored data
      // also checking if the locally stored data does contain the weather report of today
      if (
        (jsonData.location.country.toLowerCase() === place ||
          jsonData.location.name.toLowerCase() === place) &&
        jsonData.forecast.forecastday[lastIndex].date === today
      ) {
        console.log("Data Served from LocalStorage.");

        // at first, sending Data in JSON format with lastIndex and then receiving the data.
        // lastIndex is required to check if stored data has the weather report of today
        var receivedData = serveData(jsonData, lastIndex);

        res.render("weather-report", {...receivedData});

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

            // checking if the requested parameters does match with the response data
            if (
              response.data.location.country.toLowerCase() === place ||
              response.data.location.name.toLowerCase() === place
            ) {
              // storing data into localStorage
              storeData(JSON.stringify(response.data));

              // at first, sending (response.data) which is in JSON format with lastIndex and then receiving the data.
              // lastIndex is required to check if stored data has the weather report of today
              let lastIndex = response.data.forecast.forecastday.length - 1;
              var receivedData = serveData(response.data, lastIndex);

              res.render("weather-report", {...receivedData});

            } else {
              res.render("not-found", {
                message: "Data not found. Wrong URL parameter.",
              });
            }
          })
          .catch(function (err) {
            // console.log(err);
            console.log(err.response.status);
            if(err.response.status === 400) {
              res.render("error", {message: "Bad Request. This message was shown from API and did not serve any data."});
            }
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

          // checking if the requested parameters does match with the response data
          if (
            response.data.location.country.toLowerCase() === place ||
            response.data.location.name.toLowerCase() === place
          ) {
            // storing data into localStorage
            storeData(JSON.stringify(response.data));

            // at first, sending (response.data) which is in JSON format with lastIndex and then receiving the data.
            // lastIndex is required to check if stored data has the weather report of today
            let lastIndex = response.data.forecast.forecastday.length - 1;
            var receivedData = serveData(response.data, lastIndex);

            res.render("weather-report", {...receivedData});

          } else {
            res.render("not-found", {
              message: "Data not found. Wrong URL parameter.",
            });
          }
        })
        .catch(function (err) {
          //console.log(err);
          console.log(err.response.status);
          if(err.response.status === 400) {
            res.render("error", {message: "Bad Request. This message was shown from API and did not serve any data."});
          }
        });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

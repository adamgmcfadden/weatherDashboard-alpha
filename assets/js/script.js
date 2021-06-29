"use strict";

//open weather current weather end point
var currentEndPoint = "https://api.openweathermap.org/data/2.5/weather?";
// open weather oneCall end
var oneCallEndPoint = "https://api.openweathermap.org/data/2.5/onecall?";
//my open weather API key
var apiKey = "&appid=20e4aa0aac33df74711bb16dd0d7a2b9";

//history of cities searched
var cityHistory = [];
var distinctCities = {};
//search button on click
$("#search-btn").on("click", function (event) {
  event.preventDefault();
  //push input value to array
  var cityName = $("#search-input").val();
  cityHistory.push(cityName);
  for (let i of cityHistory) {
    distinctCities[i] = true;
  }
  saveSearches();
  //fetch request for current weather  by city name (using only for lat and lon to search in onecall endpoint)
  fetch(currentEndPoint + "q=" + cityName + "&units=metric" + apiKey)
    //convert response to JSON
    .then(function (response) {
      return response.json();
    })
    //fetch oneCall endpoint with lat and lon provided from first fetch
    .then(function (response) {
      console.log(response);
      fetch(
        oneCallEndPoint +
          "lat=" +
          response.coord.lat +
          "&lon=" +
          response.coord.lon +
          "&units=metric" +
          apiKey
      )
        //convert response to JSON
        .then(function (newResponse) {
          return newResponse.json();
        })
        .then(function (newResponse) {
          console.log(newResponse);

          /*---------------------
          CURRENT WEATHER SECTION
          ---------------------*/
          //reference weather-div id
          var currentWeatherDiv = $("#weather-div")
            .addClass("row border border-dark ml-1")
            .css("width", "97%");
          //check if positive or negative timeZone offset
          if (Math.sign(newResponse.timezone_offset) === -1) {
            var date = moment(
              newResponse.current.dt * 1000 - newResponse.timezone_offset * 1000
            ).format("MM/DD/YYYY");
          } else {
            var date = moment(
              newResponse.current.dt * 1000 + newResponse.timezone_offset * 1000
            ).format("MM/DD/YYYY");
          }
          // create <h2> element to hold City name and date
          var currentWeatherEl = $("<h2></h2>").text(
            response.name + " (" + date + ")"
          );
          // create icon image
          var iconImg = $("<img></img>")
            .attr(
              "src",
              "http://openweathermap.org/img/w/" +
                response.weather[0].icon +
                ".png"
            )
            .addClass("icon");
          //append <h2> and <img> to parent <div>
          currentWeatherDiv.append(currentWeatherEl, iconImg);

          //create <h3> element to hold current temperature
          var currentTemp = $("<h3></h3>").text(
            "Temp: " + newResponse.current.temp + "°C"
          );

          //create <h3> element to hold current wind speed
          var currentWindSpeed = $("<h3></h3>").text(
            "Wind: " +
              Math.round(newResponse.current.wind_speed * 3.6 * 100) / 100 +
              " km/h"
          );

          //create <h3> element to hold current humidity
          var currentHumidity = $("<h3></h3>").text(
            "Humidity: " + newResponse.current.humidity + " %"
          );

          //create <h3> element to hold current UV index
          var currentUviIndex = $("<h3></h3>").text("UV Index: ");

          //create span inside h3 element to hold uv index data
          var uvSpan = $("<span></span>")
            .text(newResponse.current.uvi)
            .addClass("badge badge-pill");
          //append span to UVI details
          currentUviIndex.append(uvSpan);

          if (newResponse.current.uvi >= 0 && newResponse.current.uvi <= 2) {
            uvSpan.addClass("favourable");
          } else if (
            newResponse.current.uvi > 2 &&
            newResponse.current.uvi <= 5
          ) {
            uvSpan.addClass("moderate");
          } else if (
            newResponse.current.uvi > 5 &&
            newResponse.current.uvi <= 7
          ) {
            uvSpan.addClass("high");
          } else if (
            newResponse.current.uvi > 7 &&
            newResponse.current.uvi <= 10
          ) {
            uvSpan("severe");
          } else {
            uvSpan.addClass("extreme");
          }
          //append current information to <h2> element
          currentWeatherEl.append(
            currentTemp,
            currentWindSpeed,
            currentHumidity,
            currentUviIndex
          );

          /*---------------------
          forecasted time section
          ---------------------*/
          //reference forecasted time element in html file
          var forecastWeatherDiv = $("#forecast-div");
          //create h2 element for 5 day forecast title
          var forecastWeatherEl = $("<h2></h2>")
            .addClass("forecast-title")
            .text("5-Day Forecast:");

          //append title to parent element
          forecastWeatherDiv.append(forecastWeatherEl);

          //create div to hold all card elements
          var cardDiv = $("<div></div>").addClass("row card-container");

          //append div to forecast title
          forecastWeatherEl.append(cardDiv);

          //index 0 is current weather information, so to start on tomorrow, need index 1
          var currentIndexNumber = 1;
          for (let i = currentIndexNumber; i <= 5; i++) {
            //create card
            var cardEl = $("<div></div>").addClass("card-style");
            // apply correct time offset
            if (Math.sign(newResponse.timezone_offset) === -1) {
              var date = moment(
                newResponse.daily[i].dt * 1000 -
                  newResponse.timezone_offset * 1000
              ).format("MM/DD/YYYY");
            } else {
              var date = moment(
                newResponse.daily[i].dt * 1000 +
                  newResponse.timezone_offset * 1000
              ).format("MM/DD/YYYY");
            }

            //create date element at top of card
            var cardDate = $("<h2></h2>").addClass("card-date").text(date);
            //create icon image inside card
            var cardIcon = $("<img></img")
              .attr(
                "src",
                "http://openweathermap.org/img/w/" +
                  newResponse.daily[i].weather[0].icon +
                  ".png"
              )
              .addClass("icon-card");

            //create <h3> element to hold forecasted temperature  (used max temperature)
            var forecastTemp = $("<h3></h3>")
              .text("Temp: " + newResponse.daily[i].temp.max + "°C")
              .addClass("card-text");

            //create <h3> element to hold forecasted wind speed
            var forecastWindSpeed = $("<h3></h3>")
              .text(
                "Wind: " +
                  Math.round(newResponse.daily[i].wind_speed * 3.6 * 100) /
                    100 +
                  " km/h"
              )
              .addClass("card-text");

            //create <h3> element to hold forecasted humidity
            var forecastHumidity = $("<h3></h3>")
              .text("Humidity: " + newResponse.daily[i].humidity + " %")
              .addClass("card-text");

            //append card items to card element
            cardEl.append(
              cardDate,
              cardIcon,
              forecastTemp,
              forecastWindSpeed,
              forecastHumidity
            );

            //append card el to card div
            cardDiv.append(cardEl);

            //increase index number to create next card
            currentIndexNumber++;
          }
        });
    });
});

var saveSearches = function () {
  console.log(cityHistory);
  console.log(distinctCities);
  let cityKeys = Object.keys(distinctCities);
  console.log(cityKeys);
};

// DEPENDENCIES
var inputCity = $("#input-city");
var submitButton = $("#submit-button");
var cityList = $("#city-list");
var forecastContainer = $("#forecast-container");
var yourLocation = $("#your-location");

// DATA
var priorityList = ["6", "2", "5", "3", "7", "8"];

// FUNCTIONS
// tries to get user's current location using geolocation API in browser, in terms of latitude and longitude
function getCurrentLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            lookupCurrentForecast(position.coords.latitude, position.coords.longitude);
            lookupWeatherForecast(position.coords.latitude, position.coords.longitude);
            yourLocation.attr("lat", position.coords.latitude);
            yourLocation.attr("lon", position.coords.longitude);
        });
    } 
    else {
    
    }
}

// pulls previously searched cities from local storage and calls makeButtonGroup to add them to the list
function getExistingCities() {
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    for (k = 0; k < storedCities.length; k++) {
        makeButtonGroup(storedCities[k].storedCityName, storedCities[k].storedCityLat, storedCities[k].storedCityLon);
    }
    setActive(yourLocation);
}

// makes a button group for a given city in the list, attaching the latitude and longitude as attributes
// Also creates a delete button with an x to remove a place from local storage and the list
// sets the new city as active with setActive function
function makeButtonGroup(name, lat, lon) {
    var newGroup = $(document.createElement("div"));
    var newButton = $(document.createElement("button"));
    var newX = $(document.createElement("button"));
    newGroup.addClass("btn-group");
    newGroup.attr("role", "group");
    newButton.addClass("list-group-item list-group-item-action text-center");
    newButton.attr("lat", lat);
    newButton.attr("lon", lon);
    newButton.text(name);
    newX.addClass("btn btn-secondary rounded-0 delete");
    newX.text("X");
    newGroup.append(newButton);
    newGroup.append(newX);
    cityList.append(newGroup);
    setActive(newButton);
}

// removes city button group from list and local storage
// if the deleted group was active, the user's location becomes active
function deleteGroup(target) {
    // switches to user location if deleted group is active
    if ($(target).parent().children().eq(0).hasClass("active")) {
        if (yourLocation.attr("lat") && yourLocation.attr("lon")) {
            lookupCurrentForecast(yourLocation.attr("lat"), yourLocation.attr("lon"));
            lookupWeatherForecast(yourLocation.attr("lat"), yourLocation.attr("lon"));
            setActive(yourLocation);    
        }
        else {
            setActive(yourLocation);
            getCurrentLocation();
        }    
    }
    // removes group from list and local storage
    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
    for (p = 0; p < storedCities.length; p++) {
        if (storedCities[p].storedCityName === $(target).parent().children().eq(0).text()) {
            storedCities.splice(p, 1);
        }
    }
    localStorage.setItem("cities", JSON.stringify(storedCities));
   $(target).parent().remove();
}

// uses Open Weather's geo API to look up a city name and return information about the city
// then calls functions to lookup current and future weather
// if the city is new, adds it to local storage and the list
function lookupCity(city) {
    var requestURLCity = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=f53b5109b06704799e5260e2dda10bda";
    fetch(requestURLCity)
        .then(function (responseCity) {
            return responseCity.json();
        })
        .then(function (dataCity) {
            if (dataCity.length > 0) {
                var latitude = $(dataCity).eq(0).attr("lat");
                var longitude = $(dataCity).eq(0).attr("lon");
                var cityName = $(dataCity).eq(0).attr("name");
                // gets current weather/forecast info
                lookupCurrentForecast(latitude, longitude);
                lookupWeatherForecast(latitude, longitude);
                // checks if city is new and adds it to list/local storage if so
                var newCity = true;
                var existingIndex = -1;
                for (i = 0; i < cityList.children().length; i++) {
                    if (cityName === cityList.children().eq(i).children().eq(0).text()) {
                        newCity = false;
                        existingIndex = i;
                    }
                }
                if (newCity) {
                    makeButtonGroup(cityName, latitude, longitude);
                    var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
                    var newStoredCity = {
                        storedCityName: cityName,
                        storedCityLat: latitude,
                        storedCityLon: longitude
                    };
                    storedCities.push(newStoredCity);
                    localStorage.setItem("cities", JSON.stringify(storedCities));
                }
                else {
                    setActive(cityList.children().eq(existingIndex).children().eq(0));
                }
            }
            else {
                console.log("City not found - please try again.");
            }
        });
}

// makes the selected button active, and removes active class from all others
function setActive(button) {
    for (i = 0; i < cityList.children().length; i++) {
        cityList.children().eq(i).children().eq(0).removeClass("active");
    }
    $(button).addClass("active");
}

// gets current forecaast info from Open Weather given latitude and longitude
// then calls updateCurrentInfo to update details displayed
function lookupCurrentForecast(latitude, longitude) {
    var requestURLCurrent = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=f53b5109b06704799e5260e2dda10bda";
    fetch(requestURLCurrent)
        .then(function (responseCurrent) {
            return responseCurrent.json();
        })
        .then(function (dataCurrent) {
            updateCurrentInfo(dataCurrent);
        });
}

// displays given current weather data on the page
function updateCurrentInfo(data) {
    console.log(data);
    var displayDate = dayjs.unix(data.dt);
    $("#current-weather").text(data.name + ": " + displayDate.format("MMM D[, ]YYYY"));
    $("#weather-icon").attr("src", "https://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png");
    $("#weather-icon").attr("alt", data.weather[0].description);
    $("#current-temp").text("Temp: " + Math.floor((((Number(data.main.temp) - 273.15) * 1.8) + 32)) + " °F");
    $("#current-wind").text("Wind: " + data.wind.speed + " mph");
    $("#current-humid").text("Humidity: " + data.main.humidity + "%");
    $("#current-temp").removeClass("d-none");
    $("#current-wind").removeClass("d-none");
    $("#current-humid").removeClass("d-none");
}

// uses Open Weather API to look up 5 day forecast data for a given location
// then calls updateForecastInfo function to display
function lookupWeatherForecast(latitude, longitude) {
    var requestURLWeather = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=f53b5109b06704799e5260e2dda10bda";
    fetch(requestURLWeather)
        .then(function (responseWeather) {
            return responseWeather.json();
        })
        .then(function (dataWeather) {
            updateForecastInfo(dataWeather);
        });
}

// displays given 5 day forecast data on the page
function updateForecastInfo(data) {
    for (i = 0; i < forecastContainer.children().length; i++) {
        // takes an average over each day to condense the 8 data points per day into one for the display
        var weatherCode = 800;
        var iconCode = "01d";
        var altText = "clear sky";
        var tempMin = 10000;
        var tempMax = 0;
        var windSum = 0;
        var humidSum = 0;
        for (j = i * 8; j < (i + 1) * 8; j++) {
            // uses priority list to determine which icon to use to depict the day's weather (on average)
            codeSymbol = data.list[j].weather[0].id.toString().charAt(0);
            if (priorityList.indexOf(codeSymbol) < priorityList.indexOf(weatherCode.toString().charAt(0))) {
                weatherCode = data.list[j].weather[0].id;
                iconCode = data.list[j].weather[0].icon;
                altText = data.list[j].weather[0].description;
            }
            else if (priorityList.indexOf(codeSymbol) === priorityList.indexOf(weatherCode.toString().charAt(0)) && codeSymbol === "8") {
                if (Number(data.list[j].weather[0].id) > Number(weatherCode)) {
                    weatherCode = data.list[j].weather[0].id;
                    iconCode = data.list[j].weather[0].icon;
                    altText = data.list[j].weather[0].description;
                }
            }
            // keeps track of min temperature
            if (data.list[j].main.temp_min < tempMin) {
                tempMin = data.list[j].main.temp_min;
            }
            // keeps track of max temperature
            if (data.list[j].main.temp_max > tempMax) {
                tempMax = data.list[j].main.temp_max;
            }
            // adds on to sum of wind speed and humidity for taking average
            windSum = windSum + data.list[j].wind.speed;
            humidSum = humidSum + data.list[j].main.humidity;
        }
        iconCode = iconCode.slice(0, 2) + "d";
        tempMin = Math.floor((((Number(tempMin) - 273.15) * 1.8) + 32));
        tempMax = Math.floor((((Number(tempMax) - 273.15) * 1.8) + 32));
        var windAvg = Math.floor(windSum / 8);
        var humidAvg = Math.floor(humidSum / 8);
        var currentDate = dayjs.unix(data.list[i * 8].dt);
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(0).text(currentDate.format("MMM D"));
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(1).attr("src", "https://openweathermap.org/img/wn/" + iconCode + "@2x.png");
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(1).attr("alt", altText);
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(2).text("Temp: " + tempMin + " / " + tempMax + " °F");
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(3).text("Wind: " + windAvg + " mph");
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(4).text("Humidity: " + humidAvg + "%");
        $("#forecast" + (i + 1).toString()).removeClass("d-none");
    }
}

// called when a new city name is submitted - calls lookupCity function
// clears search bar after submission
function handleSubmit(event) {
    event.preventDefault();
    var citySearch = $(event.target).parent().children().eq(0).children().eq(1).val();
    lookupCity(citySearch);
    $(event.target).parent().children().eq(0).children().eq(1).val("");
}

// handles selecting a previously existing city from the list
// if "your location" is selected but was blocked, it will prompt again
function handleSelect(event) {
    var target = $(event.target);
    if (target.hasClass("delete")) {
        deleteGroup(target);
    }
    else {
        if (target.attr("lat") && target.attr("lon")) {
            lookupCurrentForecast(target.attr("lat"), target.attr("lon"));
            lookupWeatherForecast(target.attr("lat"), target.attr("lon"));
            setActive(target);    
        }
        else {
            setActive(yourLocation);
            $("#current-weather").text("Please select a location.");
            $("#current-temp").addClass("d-none");
            $("#current-wind").addClass("d-none");
            $("#current-humid").addClass("d-none");
            $("#weather-icon").attr("src", "");
            $("#weather-icon").attr("alt", "");
            for (i = 0; i < forecastContainer.children().length; i++) {
                forecastContainer.children().eq(i).addClass("d-none");
            }
            getCurrentLocation();
        }
    }
}

// USER INTERACTIONS
submitButton.on("click", handleSubmit);
cityList.on("click", "button", handleSelect);

// INITIALIZATIONS
getCurrentLocation()
getExistingCities();
// DEPENDENCIES
var inputCity = $("#input-city");
var submitButton = $("#submit-button");
var cityList = $("#city-list");
var forecastContainer = $("#forecast-container");

// DATA
var priorityList = ["6", "2", "5", "3", "7", "8"];

// FUNCTIONS
function getCurrentLocation() {
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(function (position) {
            lookupCurrentForecast(position.coords.latitude, position.coords.longitude);
            lookupWeatherForecast(position.coords.latitude, position.coords.longitude);
        });
    } 
    else {
        console.log("not available");
    }
}

function getExistingCities() {

}

function lookupCity(city) {
    var requestURLCity = "https://api.openweathermap.org/geo/1.0/direct?q=" + city + "&limit=1&appid=f53b5109b06704799e5260e2dda10bda";
    fetch(requestURLCity)
        .then(function (responseCity) {
            return responseCity.json();
        })
        .then(function (dataCity) {
            var latitude = $(dataCity).eq(0).attr("lat");
            var longitude = $(dataCity).eq(0).attr("lon");
            lookupCurrentForecast(latitude, longitude);
            lookupWeatherForecast(latitude, longitude);
        });
}

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

function updateCurrentInfo(data) {
    $("#weather-icon").attr("src", "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png");
    $("#weather-icon").attr("alt", data.weather[0].description);
    $("#current-temp").text("Temperature: " + Math.floor((((Number(data.main.temp) - 273.15) * 1.8) + 32)) + " °F");
    $("#current-wind").text("Wind Speed: " + data.wind.speed + " mph");
    $("#current-humid").text("Humidity: " + data.main.humidity + "%");
}

function lookupWeatherForecast(latitude, longitude) {
    var requestURLWeather = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=f53b5109b06704799e5260e2dda10bda";
    fetch(requestURLWeather)
        .then(function (responseWeather) {
            return responseWeather.json();
        })
        .then(function (dataWeather) {
            console.log(dataWeather);
            updateForecastInfo(dataWeather);
        });
}

//$("#weather-icon").attr("src", "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png");
//$("#weather-icon").attr("alt", data.weather[0].description);
//$("#current-temp").text("Temperature: " + Math.floor((((Number(data.main.temp) - 273.15) * 1.8) + 32)) + " °F");
//$("#current-wind").text("Wind Speed: " + data.wind.speed + " mph");
//$("#current-humid").text("Humidity: " + data.main.humidity + "%");

function updateForecastInfo(data) {
    for (i = 0; i < forecastContainer.children().length; i++) {
        var weatherCode = 800;
        var iconCode = "01d";
        var altText = "clear sky";
        var tempMin = 10000;
        var tempMax = 0;
        var windSum = 0;
        var humidSum = 0;
        for (j = i * 8; j < (i + 1) * 8; j++) {
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
            if (data.list[j].main.temp_min < tempMin) {
                tempMin = data.list[j].main.temp_min;
            }
            if (data.list[j].main.temp_max > tempMax) {
                tempMax = data.list[j].main.temp_max;
            }
            windSum = windSum + data.list[j].wind.speed;
            humidSum = humidSum + data.list[j].main.humidity;
        }
        iconCode = iconCode.slice(0, 2) + "d";
        console.log(iconCode);
        tempMin = Math.floor((((Number(tempMin) - 273.15) * 1.8) + 32));
        tempMax = Math.floor((((Number(tempMax) - 273.15) * 1.8) + 32));
        var windAvg = Math.floor(windSum / 8);
        var humidAvg = Math.floor(humidSum / 8);
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(1).attr("src", "http://openweathermap.org/img/wn/" + iconCode + "@2x.png");
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(1).attr("alt", altText);
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(2).text("Temperature: " + tempMin + " / " + tempMax + " °F");
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(3).text("Wind Speed: " + windAvg + " mph");
        $("#forecast" + (i + 1).toString()).children().eq(0).children().eq(4).text("Humidity: " + humidAvg + "%");
        console.log($("#forecast" + (i + 1).toString()));
    }
}

function handleSubmit(event) {
    event.preventDefault();
    console.log("submit");
    var citySearch = $(event.target).parent().children().eq(0).children().eq(1).val();
    lookupCity(citySearch);
}

// USER INTERACTIONS
// search bar for cities - on submit, add city to list and loadWeather(new City)
// delete city button - remove city from list and search history
// click on city - load Weather for that city
submitButton.on("click", handleSubmit);

// INITIALIZATIONS
getCurrentLocation()
getExistingCities();
// load weather for top city
//loadWeather("top city");
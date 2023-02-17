// DEPENDENCIES
var inputCity = $("#input-city");
var submitButton = $("#submit-button");
var cityList = $("#city-list");

// DATA

// FUNCTIONS
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
            lookupWeather(latitude, longitude);
        });
}

function lookupWeather(latitude, longitude) {
    var requestURLWeather = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=f53b5109b06704799e5260e2dda10bda";
    fetch(requestURLWeather)
        .then(function (responseWeather) {
            return responseWeather.json();
        })
        .then(function (dataWeather) {
            console.log(dataWeather);
        });
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
getExistingCities();
// load weather for top city
//loadWeather("top city");
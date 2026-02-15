const axios = require("axios");

const API_KEY = "1aa3b3a2a30479c44d2b14e77bed9a07";
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather?appid=" 
+ API_KEY + "&units=metric&lang=fr&q=";

function getWeatherData(city, callback) {
    const url = BASE_URL + city;

    axios.get(url)
    .then((res) => callback(null, res.data))   
    .catch((error) => callback(error, null));
}

function printWeather(city){
    getWeatherData(city, (error, weatherData) => { 
        
        if(error){
            console.log(error);
            return;
        }

        console.log(weatherData.weather[0].description);
        console.log(weatherData.main.temp);

    });
}

printWeather("Sousse");

function RandomUser(){
$.ajax({
  url: 'https://randomuser.me/api/',
  dataType: 'json',
  success: function(data) {
    console.log(data);
  }
});

}
RandomUser();
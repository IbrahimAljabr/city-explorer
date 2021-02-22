'use strict';

const { query } = require('express');

let express = require('express');
const cors = require('cors');

let app = express();
app.use(cors());
require('dotenv').config();

const PORT = process.env.PORT;

app.get('/location', handleLocatioin);
app.get('/weather', handleWeather);

function handleLocatioin(req, res) {
    console.log(req.query);
    let searchQuery = req.query.city;
    let newObject = getData(searchQuery);
    res.status(200).send(newObject);

}
function handleWeather(req, res) {
    console.log(req.query);
    let searchQuery = req.query;
    let newObject = getWeatherData(searchQuery,res);
    res.status(200).send(newObject);

}
function getData(searchQ) {

    try {

        let locationData = require('./data/location.json');
        let longitude = locationData[0].lon;
        let latitude = locationData[0].lat;
        let displayName = locationData[0].display_name;
        let responseObject = new Citylocation(searchQ, displayName, latitude, longitude);

        return responseObject;

    } catch (error) {
        res.status(500).send('Sorry, something want wrong ...' + error);
    }

}
function getWeatherData(searchQW,res) {

    try {

        let newArrWeather = [];
        let weather = require('./data/weather.json');
        console.log(weather);

        // let forecast = weather.data.map((val, idx) => val.weather.description);
        // let time = weather.data.map((val,idx)=>val.datetime);
        // Cityweather.map((val,idx)=>)
        
        weather.data.map(element => {

            let forecast = element.weather.description;
            let time = element.datetime;

            const event = new Date(time);
            const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            let newTime = event.toLocaleDateString('en-US', options);

            newArrWeather.push(new Cityweather(forecast, newTime));
        });

        // for (let index = 0; index < weather.data.length; index++) {
            // let forecast = weather.data[index].weather.description;
            // let time = weather.data[index].datetime;
            // const event = new Date(time);
            // const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
            // let newTime = event.toLocaleDateString('en-US', options);
            // newArrWeather.push(new Cityweather(forecast, newTime));

        // }
        return newArrWeather;

    } catch (error) {
        res.status(500).send('Sorry, something want wrong ...' + error);
    }

}


function Citylocation(searchQ, diplayName, lat, lon) {
    this.search_query = searchQ;
    this.formatted_query = diplayName;
    this.latitude = lat;
    this.longitude = lon;

}

function Cityweather(weather, time) {
    this.forecast = weather;
    this.time = time;
}

app.listen(PORT, () => {
    console.log('the app is here at', PORT);
});



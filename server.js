'use strict';


let longitude=[];
let latitude =[];

const { query } = require('express');

let express = require('express');
const cors = require('cors');
let superagent = require('superagent');
const { get } = require('superagent');

let app = express();
app.use(cors());
require('dotenv').config();

const PORT = process.env.PORT;

app.get('/location', handleLocatioin);
app.get('/weather', handleWeather);
app.get('*',handleError)

function handleError(req,res) {

    res.status(404).send(`Page Not Found`);

}

function handleLocatioin(req, res) {
    let searchQuery = req.query.city;
    getData(searchQuery,res).then(data=>{
        res.status(200).send(data);
    });
    
}

function handleWeather(req, res) {
    
    let searchQuery = req.query;
    getWeatherData(searchQuery,res).then(data=>{
        res.status(200).send(data);
    });
}

function getData(searchQ,res) {

    const query = {
        key: process.env.GEOCODE_API_KEY,
        q: searchQ,
        limit: 1,
        format: 'json'
      };

    let url=`https://us1.locationiq.com/v1/search.php`
    return superagent.get(url).query(query).then(data=>{

        try {

            
            // let locationData = require('./data/location.json');
            longitude = data.body[0].lon;
            latitude = data.body[0].lat;
            let displayName = data.body[0].display_name;
            let responseObject = new Citylocation(searchQ, displayName, latitude, longitude);
            
           
            return responseObject;
            
        } catch (error) {
            res.status(500).send('Sorry, something want wrong ...' + error);
        }
    }).catch(error =>{
        res.status(500).send('No data from the server ... ' + error);
    });

   

}

function getWeatherData(searchQW,res) {

    const query = {
        key: process.env.WEATHER_API_KEY,
        lon:longitude,
        lat:latitude
      };
    let url ='https://api.weatherbit.io/v2.0/forecast/daily';
    return superagent.get(url).query(query).then(val=>{
            
        try {

            let newArrWeather = [];
    
                let forecast = val.body.data[0].weather.description;
                let time = val.body.data[0].datetime;
               
                const event = new Date(time);
                const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
                let newTime = event.toLocaleDateString('en-US', options);
                
                newArrWeather.push(new Cityweather(forecast, newTime));
            
            return newArrWeather;
    
        } catch (error) {
            res.status(500).send('Sorry, something want wrong ...' + error);
        }
    }).catch(error =>{
        res.status(500).send('No data from the server ... ' + error);
    });

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



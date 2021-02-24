'use strict';


//=========Imports=========\\

const { query } = require('express');

let express = require('express');
const cors = require('cors');
let superagent = require('superagent');
const pg = require('pg');

const { get } = require('superagent');

//=========Config=========\\

let app = express();
app.use(cors());
require('dotenv').config();
const client = new pg.Client({ connectionString: process.env.DATABASE_URL,   ssl: { rejectUnauthorized: false } });

const PORT = process.env.PORT;

//=========Routes=========\\

app.get('/location', handleLocatioin);
app.get('/weather', handleWeather);
app.get('/parks',handlePark);
app.get('/movies',handleMovies);
app.get('*',handleError)


//=========Handlers=========\\


function handleError(req,res) {

    res.status(404).send(`Page Not Found`);
}

function handleLocatioin(req, res) {
    let searchQuery = req.query.city;
    
    getData(searchQuery,res).then(data=>{
        res.status(200).send(data);

    });
    
}

function handlePark(req,res) {

    let search = req.query.search_query;
    getPark(search,res).then(data=>{
        res.status(200).send(data);
    });
    
    
}

function handleWeather(req, res) {
    
    let searchQuery = req.query;
    getWeatherData(searchQuery,res).then(data=>{
    res.status(200).send(data);
    });
}

function handleMovies(params) {
    
}


//=========Get Data=========\\

//----park----\\
function getPark(search,res) {

    const query = {
        api_key: process.env.PARKS_API_KEY,
        q:search,
        limit:8
      };

    let url ='https://developer.nps.gov/api/v1/parks';
    return superagent.get(url).query(query).then(val=>{

        let newArrPark = [];
    try {
          val.body.data.map(ele=>{

            let name=ele.fullName;
            let address=ele.addresses[0];
            let fee=ele.fees;
            let description=ele.directionsInfo;
            let url=ele.directionsUrl;

            newArrPark.push(new Parks(name,address,fee,description,url));

        });
            return newArrPark;
    
        } catch (error) {
            res.status(500).send('Sorry, something want wrong in the parks  ==> ' + error);
        }
    }).catch(error =>{
        res.status(500).send('No data from the server  ==> ' + error);
    });
}

//----location----\\
function getData(searchQ,res) {

    let chech='select * from city where city_name=$1';
    let safeVal=[searchQ];
    
    return client.query(chech,safeVal).then((data)=>{
        

        if (data.rowCount !==0) {
            
            let localdb=data.rows[0];
            let localObj=new Citylocation(searchQ,localdb.city_name,localdb.lat,localdb.lon);
            
            console.log('data from database  ==> ',localObj);
            return localObj;
        }

        else{
            console.log('data from API  ==> ',data.rows);
            const query = {
                key: process.env.GEOCODE_API_KEY,
                q: searchQ,
                limit: 1,
                format: 'json'
            };
        
            let url=`https://us1.locationiq.com/v1/search.php`
            return superagent.get(url).query(query).then(data=>{
        
                try {
                        
                    let longitude = data.body[0].lon;
                    let latitude = data.body[0].lat;
                    let displayName = data.body[0].display_name;
                    let responseObject = new Citylocation(searchQ, displayName, latitude, longitude);
                    
                    let dbQ=`INSERT INTO city(city_name,lon,lat) VALUES($1,$2,$3) RETURNING *`
                    let safevalues=[searchQ,longitude,latitude];
        
                    client.query(dbQ,safevalues).then((data)=>{
                        console.log('data from database ==> ',data.rowCount);
                    }).catch(error =>{
                        console.log(' client query error ==> '+ error);
                    })
                    return responseObject;
                    
                } catch (error) {
                    res.status(500).send('Sorry, something want wrong in the location  ==> ' + error);
                }
            }).catch(error =>{
                res.status(500).send('No data from the server  ==> ' + error);
            }); 
        }    
    }).catch(error=>{
        console.log('No select stat  ==> '+error);
    });

      

}

//----weather----\\
function getWeatherData(searchQW,res) {

    const query = {
        key: process.env.WEATHER_API_KEY,
        lon:searchQW.longitude,
        lat:searchQW.latitude
      };
    let url ='https://api.weatherbit.io/v2.0/forecast/daily';
    return superagent.get(url).query(query).then(val=>{
            
        try {

            let newArrWeather = [];
          
            val.body.data.map(ele=>{
                
                    let forecast = ele.weather.description;
                    let time = ele.datetime;

                    const event = new Date(time);
                    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
                    let newTime = event.toLocaleDateString('en-US', options);
                    
                    newArrWeather.push(new Cityweather(forecast, newTime));
            });
    
            return newArrWeather;
    
        } catch (error) {
            res.status(500).send('Sorry, something want wrong in the weather  ==> ' + error);
        }
    }).catch(error =>{
        res.status(500).send('No data from the server  ==> ' + error);
    });
}


//=========Constructors=========\\

//----location----\\
function Citylocation(searchQ, diplayName, lat, lon) {

    this.search_query = searchQ;
    this.formatted_query = diplayName;
    this.latitude = lat;
    this.longitude = lon;
}

//----weather----\\
function Cityweather(weather, time) {
    this.forecast = weather;
    this.time = time;
}

//----park----\\
function Parks(name,address,fee,description,url) {
    
    this.name=name;
    this.address=address;
    this.fee=fee;
    this.description=description;
    this.url=url;
}



client.connect().then(()=>{

    app.listen(PORT, () => {
        console.log('the app is here at ==> ', PORT);
    });

}).catch(error=>{
    console.log('client connect error is ==> '+ error);
});


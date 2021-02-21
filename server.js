'use strict';

const { query } = require('express');

let express = require('express');
const cors = require('cors');

let app = express();
app.use(cors());
require('dotenv').config();

const PORT = process.env.PORT;

app.get('/location',handleLocatioin);

function handleLocatioin(req,res) {
    console.log(req.query);
    let searchQuery = req.query.city;
    let newObject =getData(searchQuery);
    res.status(200).send(newObject);
    
}
function getData(searchQ) {

    let locationData= require('./data/location.json');
    let longitude=locationData[0].lon;
    let latitude=locationData[0].lat;
    let displayName=locationData[0].display_name;
    let responseObject = new Citylocation(searchQ,displayName,latitude,longitude);

    return responseObject;
}

function Citylocation(searchQ, diplayName, lat ,lon) {
    this.search_query=searchQ;
    this.formatted_query=diplayName;
    this.latitude=lat;
    this.longitude=lon;
    
}

app.listen(PORT, () => {
    console.log('the app is here at',PORT);
});



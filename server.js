const express = require('express');
const MongoClient = require('mongodb');
const bodyParser = require('body-parser');
var db = require('./config/db');
var app = express();

const port = 8000;

app.use(bodyParser.json());


MongoClient.connect(db.url,{ useNewUrlParser: true }, (err, database) => {
    if (err) return console.log(err);


    db = database.db("shoppinglist");
    require('./app/routes')(app, db);



    app.listen(process.env.PORT ||port, () => {

        console.log("Express server listening on port %d in %s mode - We Are lIVE!",port, app.settings.env);
    });

});
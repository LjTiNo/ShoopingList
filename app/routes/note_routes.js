module.exports = function (app, db) {
    const ObjectID = require('mongodb').ObjectID;
    const CURRENT = " - Current";
    const OLD = " - Old";

    function getCurrentTime(){
        let ts = Date.now();

        let date_ob = new Date(ts);
        let date = date_ob.getDate();
        let month = date_ob.getMonth() + 1;
        let year = date_ob.getFullYear();
        let hour = date_ob.getHours();
        let minute = date_ob.getMinutes();
        let second = date_ob.getSeconds();

// returns date & time in DD-MM-YYYY_HH:MM:SS format
        return(date + "-" + month + "-" + year + "_" + hour + ":" +  minute + ":" + second);
    }

    app.post('/registerfamily', (req, res) => {
        const familyname = req.body.name.toLowerCase();
        const check = {name: familyname};


        db.collection('Families').findOne(check, function (err, familyresult) {
            if (err) throw err;
            if (familyresult === null) {
                db.collection('Families').insert(check, (err, result) => {
                    console.log("Family " + familyname + " added successfully");
                    db.createCollection(familyname + CURRENT);
                    db.createCollection(familyname + OLD);
                    if (err) {
                        res.send({'error': 'An error has occurred in Post /registerFamily.'});
                    } else {
                        //Send back to front.
                        res.send({'message': "Family added successfully"});
                    }
                });
            } else {
                res.send({'message': "There is already a Family with this name " + familyname});
                console.log("There is already a Family with this name " + familyname);

            }

        });

    });

    app.get('/getallfamilies', (req, res) => {
        db.collection('Families').find({}).toArray(function (err, result) {
            if (err) {
                res.send({'error': 'An error has occurred in Get /getallfamilies.'});
            } else {
                //Send back to front.
                console.log("Get All Families Sent: ");
                console.log(result);
                res.send(result);
            }
        });
    });

    app.post('/registermember', (req, res) => {
        const user = {
            id: req.body.id,
            name: req.body.name,
            family: req.body.family.toLowerCase()
        };
        const check = {'id': req.body.id};
        db.collection('Clients').findOne(check, function (err, userresult) {
            if (err) throw err;
            if (userresult === null) { // if there is no userid with the same id.
                db.collection('Clients').insertOne(user, (err, result) => {
                    if (err) {
                        res.send({'error': 'An error has occurred in Post /registerMember.'});
                    } else {
                        //Send back to front.
                        console.log("User " + user.name + " added successfully");
                        res.send({'message': "User " + user.name + " added successfully"});
                    }
                });

            } else {
                res.send({'message': "There is already a user with this userid " + req.body.id});
                console.log("There is already a user with this userid " + req.body.id);

            }
        });

    });

    app.post('/updatecurrent/:id/:family', (req, res) => {
        const id = req.params.id;
        const family = req.params.family.toLowerCase();

        const note = {
            products: req.body.products
        };


        const check = {'id': id};
        db.collection('Clients').findOne(check, function (err, result) {
            if (err) throw err;

            if (result !== null && result.family === family) { //if userid is part of the family.
                db.collection(family + CURRENT).deleteMany();
                db.collection(family + CURRENT).insertOne(note, (err, result) => {
                    if (err) {
                        res.send({'error': 'An error has occurred in Post /updatecurrent.'});
                    } else {
                        //Send back to front.
                        console.log(family + " current list updated added successfully");
                        res.send({'message': family + " current list updated added successfully"});
                    }
                });


            } else {
                console.log("The user id:" + id + " is not a part of the family '" + family + "'!");
                res.send({'error': "The user id:" + id + " is not a part of the family '" + family + "'!"});
            }
        });


    });


    app.get('/getcurrent/:id/:family', (req, res) => {
        const id = req.params.id;
        const family = req.params.family.toLowerCase();


        const check = {'id': id};
        db.collection('Clients').findOne(check, function (err, result) {
            if (err) throw err;

            if (result !== null && result.family === family) { //if userid is part of the family.
                db.collection(family + CURRENT).find({}).toArray(function (err, result) {
                    if (err) {
                        res.send({'error': 'An error has occurred in Get /getcurrent.'});
                    } else {
                        //Send back to front.
                        console.log("current list in family " + family + " requested by userid " + id + " sent!");
                        if (result[0] == null)
                            res.send("{}");
                        else
                            res.send(result[0]);
                    }
                });

            } else {
                console.log("The user id:" + id + " is not a part of the family '" + family + "'!");
                res.send({'error': "The user id:" + id + " is not a part of the family '" + family + "'!"});
            }
        });


    });

    app.post('/savecurrent/:id/:family', (req, res) => {
        const id = req.params.id;
        const family = req.params.family.toLowerCase();


        const check = {'id': id};
        db.collection('Clients').findOne(check, function (err, result) {
            if (err) throw err;

            if (result !== null && result.family === family) { //if userid is part of the family.
                db.collection(family + CURRENT).find({}).toArray(function (err, result) {
                    if (err) {
                        res.send({'error': 'An error has occurred in Post /savecurrent.'});
                    } else {
                        //Send back to front.
                        let currentTime = getCurrentTime();
                        console.log(currentTime);
                        let myresult = result[0];
                        myresult["timestamp"] = currentTime;
                        console.log("current list in family " + family + " requested by userid " + id + " sent! - SaveCurrent");
                        if (result[0] == null)
                            res.send({'error': 'Cant save an empty list.'});
                        else {
                            db.collection(family + OLD).insertOne(myresult, (err, result) => {
                                if (err) {
                                    res.send({'error': 'An error has occurred in Post /savecurrent.' + err});
                                } else {
                                    //Send back to front.
                                    console.log(family + " current list saved successfully");
                                    res.send({'message': family + " current list saved successfully",
                                                    'data': myresult});
                                }
                            });
                            //res.send(myresult);
                        }
                    }
                });

            } else {
                console.log("The user id:" + id + " is not a part of the family '" + family + "'!");
                res.send({'error': "The user id:" + id + " is not a part of the family '" + family + "'!"});
            }
        });


    });

    app.get('/getold/:id/:family', (req, res) => {
        const id = req.params.id;
        const family = req.params.family.toLowerCase();


        const check = {'id': id};
        db.collection('Clients').findOne(check, function (err, result) {
            if (err) throw err;

            if (result !== null && result.family === family) { //if userid is part of the family.
                db.collection(family + OLD).find({}).toArray(function (err, result) {
                    if (err) {
                        res.send({'error': 'An error has occurred in Get /getcurrent.'});
                    } else {
                        //Send back to front.
                        console.log("old lists in family " + family + " requested by userid " + id + " sent!");
                        res.send(result);
                    }
                });

            } else {
                console.log("The user id:" + id + " is not a part of the family '" + family + "'!");
                res.send({'error': "The user id:" + id + " is not a part of the family '" + family + "'!"});
            }
        });


    });

};

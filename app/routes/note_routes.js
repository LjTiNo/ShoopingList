module.exports = function (app, db) {
    const ObjectID = require('mongodb').ObjectID;

    app.post('/register', (req, res) => {
        const user = {
            id: req.body.id,
            name: req.body.name,
            family: req.body.family
        };


        db.collection('Clients').insertOne(user, (err, result) => {
            if (err) {
                res.send({'error': 'An error has occurred in Post /register.'});
            } else {
                //Send back to front.
                console.log("User " + user.name + " added successfully");
                res.send({'message': "User " + user.name + " added successfully"});
            }
        });

    });

};

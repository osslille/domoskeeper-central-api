var express = require('express')
const MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var app = express()
var bodyParser = require("body-parser");

var routePrefix = '/v1'
var appInfos = {
    name: 'Domoskeeper API',
    version: '1.0',
    author: 'Domoskeeper Corp.'
}

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

MongoClient.connect('mongodb://localhost:27017/domoskeeper', (err, db) => {
    assert.equal(null, err);
    console.log("Connected to MongoDB database");

    // Route root
    app.get(routePrefix, function (req, res) {
        res.send(appInfos)
    })

    // Route root
    app.get(routePrefix + '/file', function (req, res) {
        res.sendfile("/home/chavalc/Images/Webcam/2017-04-0415:20:57.jpg")
    })

    // Route post event
    app.post(routePrefix + '/setup', (req, res) => {
        assert.notEqual(null, req.body.name)
        console.log(req.body)
        require('crypto').randomBytes(48, function(err, buffer) {
          var token = buffer.toString('hex');
            req.body.token = token
            db.collection('keeper').save(req.body)
            resp = {
                id: req.body._id,
                token: token,
                msg: "keeper registered"
            }
            res.status(201).json(resp)
        });
    })

    // Route get events
    app.get(routePrefix + '/event', (req, res) => {
        events = db.collection('domoskeeper').find({}).toArray((err, docs) => {
            console.log(docs)
            res.send(docs)
        })
    })

    // Route post event
    app.post(routePrefix + '/event', (req, res) => {
        assert.notEqual(null, req.body.date)
        assert.notEqual(null, req.body.image)
        db.collection('event').save(req.body)
        console.log(req.body)
        resp = {
            msg: "event saved"
        }
        res.status(201)
        res.send(resp)
    })
    
    app.listen(3000, () => {
    console.log('Listening on port 3000...')
  })
})
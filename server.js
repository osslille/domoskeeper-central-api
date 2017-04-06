var express = require('express')
const MongoClient = require('mongodb').MongoClient
var assert = require('assert')
var app = express()
var bodyParser = require("body-parser")
var mongo = require('mongodb');

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

    // Route d'affichage d'une image
    app.get(routePrefix + '/file', function (req, res) {
        res.sendfile("images/Image0.jpg")
    })

    // Route post setup
    app.post(routePrefix + '/setup', (req, res) => {
        // Le nom de la cam sera l'id donné par mongoDB
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
        assert.notEqual(null, req.body.keeper_id)
        req.body.keeper_id = new mongo.ObjectID(req.body.keeper_id)
        assert.notEqual(null, req.body.image)
        assert.notEqual(null, req.body.keeper_token)
        console.log(req.body)
        console.log(db.collection('keeper').find({_id:req.body.keeper_id,token:req.body.keeper_token}).count())
        db.collection('keeper').find({_id:req.body.keeper_id,token:req.body.keeper_token}).count(function(err,count){
            assert.equal(1,count);
            delete req.body.keeper_token
            db.collection('event').save(req.body)
            console.log(req.body)
            resp = {
                id: req.body._id,
                msg: "event saved"
            }
            res.status(201)
            res.send(resp)
        }) 
        
    })

    // Requete de recherche avec l'id de la cam en paramètre
    app.get(routePrefix + '/search/:id', (req, res) => {
        // on recherche un id dans la base mongo: il faut convertir la string en ObjectID mongo
        events = db.collection('keeper').find({_id:new mongo.ObjectID(req.params.id)}).toArray((err, docs) => {
            console.log(docs)
            res.send(docs)
        })
    })

    
    app.listen(3000, () => {
    console.log('Listening on port 3000...')
  })
})
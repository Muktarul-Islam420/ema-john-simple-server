const express = require('express')
const port = 5000;
const bodyParser = require('body-parser');
const cors = require('cors');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();

const app = express()
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Server is running!')
  })

var uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.gqyzv.mongodb.net:27017,cluster0-shard-00-01.gqyzv.mongodb.net:27017,cluster0-shard-00-02.gqyzv.mongodb.net:27017/${process.env.DB_NAME}?ssl=true&replicaSet=atlas-k1o8mv-shard-0&authSource=admin&retryWrites=true&w=majority`;
MongoClient.connect(uri,{useNewUrlParser:true, useUnifiedTopology: true },  function(err, client) {
  const productsCollection = client.db("ema-john-store").collection("products");
  const ordersCollection = client.db("ema-john-store").collection("orders");
    app.post('/addProduct',(req, res) => {
        const products = req.body;
        productsCollection.insertMany(products)
        .then(result => {
            console.log(result.insertedCount);
            res.send(result.insertedCount)
        })
    })

    app.get('/products',(req, res) => {
        productsCollection.find({})
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.get('/products/:key',(req, res) =>{
        productsCollection.find({key: req.params.key})
        .toArray((err, documents) =>{
            res.send(documents[0])
        })
    })

    app.post('/productsByKeys',(req, res) =>{
        const productsKeys = req.body;
        productsCollection.find({key: {$in: productsKeys} })
        .toArray((err, documents) => {
            res.send(documents)
        })
    })

    app.post('/addOrder', (req, res) => {
        const order = req.body;
        ordersCollection.insertOne(order)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })
//   console.log('database collection successfully')
});



app.listen(process.env.PORT || port);
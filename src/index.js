const mongoClient = require('mongodb').MongoClient;
const bodyParser = require("body-parser");
require('dotenv').config()

const express = require('express');
const app = express();
const dbName = 'graph';
const url = `mongodb://${process.env.MONGODB_DOMAIN}:${process.env.MONGODB_PORT}/`;
// ${process.env.MONGO_ROOT_USER}:${process.env.MONGO_ROOT_PASSWORD}@
const port = process.env.SERVER_PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.listen(port, () => {
    mongoClient.connect(url, { useNewUrlParser: true }, (error, client) => {
        if(error) {
            throw error;
        }
        database = client.db(dbName);
        collection = database.collection(dbName);
        console.log("Connected to `" + dbName + "`!");
    });
});

app.get("/graph", (request, response) => {
    collection.find({}).toArray((error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});

app.post("/graph", (request, response) => {
    collection.insertOne(request.body, (error, result) => {
        if(error) {
            return response.status(500).send(error);
        }
        response.send(result);
    });
});
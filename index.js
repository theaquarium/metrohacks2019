const express = require('express');
const CookieParser = require('cookie-parser');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const utils = require('./utils');
const path = require('path');
const app = express();
const port = 5849;

const url = 'mongodb://localhost:27017/environment-userdb';

app.use(express.json());
app.use(express.static('frontend'));
app.use(CookieParser('9442b610-c141-4de5-9928-f1cc63dbdc72')); // Cookie Secret (SECRET)

MongoClient.connect(url, function(err, db) {
    assert.equal(null, err);
    console.log("Connected successfully to server");
    
    app.get('/', (req, res) => {
        res.redirect('/sign-in');
    });
    
    app.post('/report-powerstrip', (req, res) => {
        const json = res.json(req.body);

    });

    app.get('/sign-in', (req, res) => {
        res.sendFile(path.resolve('frontend/sign.html'));
    });

    app.post('/verify-user', (req, res) => {
        const json = res.json(req.body);
        let token;
        if (json.google_token) {
            token = utils.verifyUser(db, json.google_token);
            if (!token) {
                token = utils.addUser(db, google_token);
            }
        }
        if (token) {
            res.cookie('token', token, { path: '/', secure: true });
            res.sendStatus(200);
        } else {
            res.sendStatus(500);
        }
    });

    app.get('/profile', (req, res) => {
        res.sendFile(path.resolve('./frontend/stuff.html'));
    });

    app.listen(port, () => console.log(`Server running on port ${port}...`));

    // Exit handlers
    process.on('exit', db.close);
    process.on('SIGINT', db.close);
    process.on('SIGUSR1', db.close);
    process.on('SIGUSR2', db.close);
    process.on('uncaughtException', db.close);
});

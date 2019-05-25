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
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
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
        console.log(json);
    });

    app.get('/sign-in', (req, res) => {
        res.sendFile(path.resolve('frontend/sign.html'));
    });

    app.post('/verify-user', (req, res) => {
        console.log('fjaskl');
        const json = req;
        console.log(json);
        let user;
        if (json.google_token) {
            console.log('faaff');
            user = utils.verifyUser(db, json.google_token);
            console.log('mem', user);
            if (!user) {
                user = utils.addUser(db, google_token);
            }
            console.log('mem2', user);
        }
        if (user) {
            console.log('dass');
            res.cookie('token', user.token, { path: '/', secure: true });
            res.cookie('id', user.id, { path: '/', secure: true });
            res.redirect('/profile');
        } else {
            console.log('fdjs');
            res.sendStatus(500);
        }
    });

    app.get('/profile', (req, res) => {
        const userId = req.signedCookies.id;
        const userToken = req.signedCookies.token;
        if (userId && userToken) {
            const userData = utils.getUserData(db, userId, userToken);
            if (userData) {
                res.render(
                    path.resolve('./frontend/profile.ejs'),
                    {
                        user: userData,
                    });
            } else {
                res.redirect('/sign-in');
            }
        } else {
            res.redirect('/sign-in');
        }
    });

    app.listen(port, () => console.log(`Server running on port ${port}...`));

    // Exit handlers
    process.on('exit', db.close);
    process.on('SIGINT', db.close);
    process.on('SIGUSR1', db.close);
    process.on('SIGUSR2', db.close);
    process.on('uncaughtException', db.close);
});

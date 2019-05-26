const express = require('express');
const session = require('express-session');
const fs = require('fs');
const utils = require('./utils');
const path = require('path');
const app = express();
const port = 5849;

let users = {};
let google_to_id = {};
let events = [];
let hourlyPower = [];
let powerstripCounter = 0;

users = JSON.parse(fs.readFileSync('climateconnections_users.json'));
google_to_id = JSON.parse(fs.readFileSync('climateconnections_googletoid.json'));
events = JSON.parse(fs.readFileSync('climateconnections_events.json'));
hourlyPower = JSON.parse(fs.readFileSync('climateconnections_hourlypower.json'));

app.use(express.json());
app.set('view engine', 'ejs');
app.use(express.static('frontend'));
app.use(session({
    secret: '9442b610-c141-4de5-9928-f1cc63dbdc72', // Cookie Secret (SECRET)
    cookie: {
        path: '/',
        maxAge: 1000 * 60 * 24,
    }
}));
    
app.get('/', (req, res) => {
    res.redirect('/sign-in');
});

app.post('/report-powerstrip', (req, res) => {
    const json = req.body;
    if (json) {
        const userData = users[json.id];
        if (userData.token == json.token) {
            const event = {
                "event_type": "powerstrip",
                "current": json.current,
                "timestamp": Date.now(),
                "id": json.id,
            };
            events.push(event);
            fs.writeFile('climateconnections_events.json', JSON.stringify(events), (err) => {
                if (err) throw err;
                console.log('Events Saved');
            });
            res.sendStatus(200);
            powerstripCounter++;
            if (powerstripCounter == 360) {
                hourlyPower.push(event);
                fs.writeFile('climateconnections_hourlypower.json', JSON.stringify(hourlyPower), (err) => {
                    if (err) throw err;
                    console.log('Hourly Saved');
                });
                const newUser = utils.addPowerStripPoints(hourlyPower, users[json.id], json.current);
                users[json.id] = newUser;
                powerstripCounter = 0;
            }
        }
    }
});

app.get('/sign-in', (req, res) => {
    res.sendFile(path.resolve('frontend/sign.html'));
});

app.post('/verify-user', (req, res) => {
    const json = req.body;
    if (json.google_token) {
        const id = google_to_id[json.google_token];
        if (id) {
            const user = users[id];
            if (user) {
                req.session.token = user.token;
                req.session.uid = user.id;
                res.sendStatus(200);
                console.log('found');
            }
        } else {
            const newUId = utils.generateToken();
            const newUserToken = utils.generateToken();
            google_to_id[json.google_token] = newUId;
            users[newUId] = {
                id: newUId,
                google_token: json.google_token,
                token: newUserToken,
                level: 1,
                name: json.name,
                email: json.email,
                profileImgUrl: json.imgUrl,
                points: 0,
                levelpoints: 0,
                friends: {},
            };
            fs.writeFile('climateconnections_users.json', JSON.stringify(users), (err) => {
                if (err) throw err;
                console.log('Users Saved');
            });
            fs.writeFile('climateconnections_googletoid.json', JSON.stringify(google_to_id), (err) => {
                if (err) throw err;
                console.log('ID Saved');
            });
            req.session.token = newUserToken;
            req.session.uid = newUId;
            res.sendStatus(200);
        }
    }
});

app.get('/profile', (req, res) => {
    const userId = req.session.uid;
    const userToken = req.session.token;
    if (userId && userToken) {
        const userData = users[userId];
        if (userData.token == userToken) {
            res.render(path.resolve('./frontend/profile.ejs'),
                {
                    user: userData,
                });
        }
    } else {
        res.location('/sign-in');
    }
});

app.get('/dashboard', (req, res) => {
    /* const userId = req.session.uid;
    const userToken = req.session.token;
    if (userId && userToken) {
        const userData = users[userId];
        if (userData.token == userToken) {
            res.render(path.resolve('./frontend/dashboard.html'),
                {
                    user: userData,
                });
        }
    } else {
        res.location('/sign-in');
    } */
    res.sendFile(path.resolve('./frontend/dash.html'));
});

app.get('/report-compostedtoday', (req, res) => {
    console.log('421');
    const userId = req.session.uid;
    const userToken = req.session.token;
    console.log(userId, userToken);
    if (userId && userToken) {
        console.log('1');
        const userData = users[userId];
        if (userData.token == userToken) {
            console.log('2');
            if (utils.checkForEventOnDate) {
                const event = {
                    "event_type": "compostedtoday",
                    "date": new Date().toISOString().substring(0, 10),
                    "id": userId,
                };
                console.log('hi');
                events.push(event);
                fs.writeFile('climateconnections_events.json', JSON.stringify(events), (err) => {
                    if (err) throw err;
                    console.log('Events Saved');
                });
                const newUser = utils.addCompostPoints(userData);
                console.log(newUser);
                users[userId] = newUser;
                res.sendStatus(200);
            } else {
                res.sendStatus(500);
            }
        }
    } else {
        res.location('/sign-in');
    }
});

app.get('/report-zerowasteday', (req, res) => {
    const userId = req.session.uid;
    const userToken = req.session.token;
    if (userId && userToken) {
        const userData = users[userId];
        if (userData.token == userToken) {
            if (utils.checkForEventOnDate) {
                const event = {
                    "event_type": "zerowasteday",
                    "date": new Date().toISOString().substring(0, 10),
                    "id": userId,
                };
                events.push(event);
                fs.writeFile('climateconnections_events.json', JSON.stringify(events), (err) => {
                    if (err) throw err;
                    console.log('Events Saved');
                });
                const newUser = utils.addZeroWastePoints(userData);
                users[userId] = newUser;
                res.sendStatus(200);
            } else {
                res.sendStatus(500);
            }
        }
    } else {
        res.location('/sign-in');
    }
});

app.listen(port, () => console.log(`Server running on port ${port}...`));

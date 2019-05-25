const express = require('express');
const CookieParser = require('cookie-parser');
const path = require('path');
const app = express();
const port = 5849;

app.use(express.json());
app.use(express.static('frontend'));
app.use(CookieParser('9442b610-c141-4de5-9928-f1cc63dbdc72')); // Cookie Secret (SECRET)

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
    console.log(json.google_token);
    /*let token;
    if (json.google_token) {
        console.log(json.google_token);
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
    }*/
});

app.get('/profile', (req, res) => {
    res.render(
        path.resolve('./frontend/profile.ejs'),
        {
            user: {
                level: 1,
                name: 'Johna Morandaons',
                points: 100,
                watts: 124,
                rank: 2521,
                oldRank: 21894,
                profileImgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Circle_-_black_simple.svg/1024px-Circle_-_black_simple.svg.png",
            },
        }
    );
});

app.listen(port, () => console.log(`Server running on port ${port}...`));

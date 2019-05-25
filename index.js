const express = require('express');
const path = require('path');
const app = express();
const port = 5849;

app.use(express.static('frontend'));

app.get('/', (req, res) => {
    res.sendFile(path.resolve('./frontend/index.html'));
});

app.listen(port, () => console.log(`Server running on port ${port}...`));

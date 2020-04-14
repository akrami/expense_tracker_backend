const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const routes = require('./routes/et-routes');

const port = 9090;
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/api/expenses', routes);

mongoose.connect('mongodb://127.0.0.1:27017/expense', 
    {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
        app.listen(port, () => {
            console.log(`app is running on http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log(err);
    });
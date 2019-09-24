const express = require('express');
const app = express();
const io = app.io = require('socket.io')();

const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const chat = require('../namespace');

app.use(cors())
app.use(bodyParser.json());

app.use((req, res, next) => { 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
});

app.use(express.static(path.join(__dirname, '../dist')));
chat.createNameSpace(io)

module.exports = app;
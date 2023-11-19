//base requierments
const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.static('tic_tac_toe_ai_public_html'));
const fs = require('fs');
app.use(express.json());
const parser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(parser.json());
app.use(cookieParser());    

//where running
const hostname = '127.0.0.1';
const port = 80;


// listen
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
    });
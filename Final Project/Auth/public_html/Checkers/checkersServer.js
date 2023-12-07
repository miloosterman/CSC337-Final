/*
Joshua Andrews
This server connects to the main server, and uses a users username
to save their score after the game ends and add it to the leaderboard.
*/


const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.static('checkers_public_html'));
const fs = require('fs');
app.use(express.json());
const parser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(parser.json());
app.use(cookieParser());    

//where running
const hostname = '143.198.117.187';
const port = 80;


// listen
app.listen(port, () => {
    console.log(`App listening at http://143.198.117.187:${port}`)
    });
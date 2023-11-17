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


let sqXList = [];
let sqOList = [];
let board = [0,0,0,0,0,0,0,0,0];
let selected = 0;
let done_yet = 0;
let resetting = -1;
let reset_counter = 0;


function startOver() {
    board = [];
    selected = 0;
    done_yet = 0;
    resetting = -1;
    reset_counter = 0;
    for (let i = 0; i < 9; i++) {
        board.push(0);
    }
    sqXList.forEach(sq => {
        document.getElementById(sq).style.display = 'none';
    });
    sqOList.forEach(sq => {
        document.getElementById(sq).style.display = 'none';
    });
    document.getElementById('sqE').style.display = 'none';
}

function openSpots() {
    let spots = [];
    for (let i = 0; i < 9; i++) {
        if (board[i] == 0) {
            spots.push(i);
        }
    }
    console.log(spots.length);
    return spots;
}

function startOver() {
    board = [];
    selected = 0;
    done_yet = 0;
    resetting = -1;
    reset_counter = 0;
    for (let i = 0; i < 9; i++) {
        board.push(0);
    }
    sqXList.forEach(sq => {
        document.getElementById(sq).style.display = 'none';
    });
    sqOList.forEach(sq => {
        document.getElementById(sq).style.display = 'none';
    });
    document.getElementById('sqE').style.display = 'none';
}

function checkForDone() {
    let check = 1;
    if (board[0] == check && board[1] == check && board[2] == check) {
        return check;
    }
    if (board[3] == check && board[4] == check && board[5] == check) {
        return check;
    }
    if (board[6] == check && board[7] == check && board[8] == check) {
        return check;
    }
    if (board[0] == check && board[3] == check && board[6] == check) {
        return check;
    }
    if (board[1] == check && board[4] == check && board[7] == check) {
        return check;
    }
    if (board[2] == check && board[5] == check && board[8] == check) {
        return check;
    }
    if (board[0] == check && board[4] == check && board[8] == check) {
        return check;
    }
    if (board[2] == check && board[4] == check && board[6] == check) {
        return check;
    }
    check = 2;
    if (board[0] == check && board[1] == check && board[2] == check) {
        return check;
    }
    if (board[3] == check && board[4] == check && board[5] == check) {
        return check;
    }
    if (board[6] == check && board[7] == check && board[8] == check) {
        return check;
    }
    if (board[0] == check && board[3] == check && board[6] == check) {
        return check;
    }
    if (board[1] == check && board[4] == check && board[7] == check) {
        return check;
    }
    if (board[2] == check && board[5] == check && board[8] == check) {
        return check;
    }
    if (board[0] == check && board[4] == check && board[8] == check) {
        return check;
    }
    if (board[2] == check && board[4] == check && board[6] == check) {
        return check;
    }
    let spots = openSpots();
    if (spots.length == 0) {
        return 3;
    }
    return 0;
}

function update() {
    if (resetting > 0) {
        reset_counter--;
        if (reset_counter <= 0) {
            document.getElementById(sqXList[resetting]).style.display = 'none';
            document.getElementById(sqXList[resetting]).style.display = 'none';
            resetting--;
            reset_counter = 20;
        }
        if (resetting <= 0) {
            startOver();
        }
        return;
    }
    // ... translate the rest of the Update method here ...
}

function onTriggerEnter(other) {
    let test_selected = 0;
    if (other.id == "square1") {
        test_selected = 1;
    }
    // ... repeat for all conditions ...
    if (test_selected > 0 && board[test_selected-1] == 0) {
        selected = test_selected;
    }
}

app.post('/play/move/:LOCATION', (req, res) => {
    const movelocation = req.params.LOCATION;
    console.log('LOCATION');
    console.log(movelocation);
    let winner = -1; // game over state
    let aimove = -1; // no AI move
    if (done_yet == 0) {
    board[movelocation] = 1;
    sqXList.push(movelocation); // not sure if this is needed
    winner = checkForDone();  // should return 0 or 1
    if (winner == 1) {
      done_yet = 1;
    } else {
      let o = openSpots();
      if (o.length == 0) {
        winner = -1; // Nobody wins, AI no move (client needs to respond to no ai move winner 0)
        done_yet = -1;
       } else {
        let aipos = Math.floor(Math.random() * o.length);
        aimove = o[aipos];
        board[aimove] = 2;
        sqOList.push(aimove); // not sure if this is needed
        winner = checkForDone();
        if (winner == 2) {
           done_yet = 1;
        } else if (o.length == 1) {
           done_yet = 1;
           winner = -1;
         }
       }
    }
    }
    
    let retval = {"aimove":aimove, "winner":winner};
    console.log(retval);
    res.send(JSON.stringify(retval));
})

// Call startOver when the page loads
//window.onload = startOver;


// listen
app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
    });
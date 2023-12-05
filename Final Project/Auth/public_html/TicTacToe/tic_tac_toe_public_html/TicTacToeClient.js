/*
Keala Goodell
This Client-Side Code is used for Tic-Tac-Toe. 
Upon loading, the game is reset.
This code uses a series of three functions to 
run the game.
*/

//set player mode to plaver vs AI
let gamemode = 'pvp';
let gamerunning = false;
//moves are named using the html divs
const movenames = ["upleft", "upmid", "upright", "midleft", "midmid", "midright", "downleft", "downmid", "downright"];
let gameEnded = false; //flag to track if the game has ended

window.onload = function() {
    if (localStorage.getItem("hasCodeRunBefore")) {
        changeMode();
        return;
    }
    localStorage.setItem("hasCodeRunBefore", true);
    //reset the game
    ReplayTicTac();
    //listen for user input in the form of clicking on an element
    movenames.forEach((moveName, index) => {
        let moveElement = document.getElementById(moveName);
        moveElement.addEventListener('click', () => playerTurn('X', index));
    });

    //use user input to play a move in the game
    function playerTurn(piece, move) {
        if (gameEnded) {
            return; // If the game has ended, don't allow further moves
        }
        //get move location from user input
        player_e_id = movenames[move];
        console.log(piece, move, gamemode, player_e_id);
        console.log(localStorage.getItem("username"));
        let player = localStorage.getItem('username');
        let playerElement = document.getElementById(player_e_id);
        //make url to send to server
        let url = 'http://localhost:80/tictac/move/' + move + '/' + gamemode + '/' + player;
        fetch(url, { method: 'POST', body: move, gamemode, player })
            .then(response => response.json())
            .then(data => {
                /*
                if(gamemode == 'pve'){
                //get new board and winner from server reply
                let winner = data.winner;
                let board = data.board;
                //place X or O on board based on if location taken from player or AI
                for (let i = 0; i < board.length; i++) {
                    let playerpiece = '';
                    if (board[i] == 1) {
                        playerpiece = 'X';
                    } else if (board[i] == 2) {
                        playerpiece = 'O';
                    } else {
                        continue;
                    }
                    let e_id = movenames[i];
                    let aiElement = document.getElementById(e_id);
                    aiElement.innerHTML = playerpiece;
                }
                // if game over, end game, create a replay button, alert who won.
                if(winner != "") { 
                    alert('Game Over Winner Is: ' + winner);
                    var button = document.createElement("button");
                    button.id = "Replay";
                    button.innerHTML = "Replay";
                    button.onclick = function() {
                        //reset game
                        ReplayTicTac();
                    };
                    document.body.appendChild(button);
                    gameEnded = true; // Set the flag to true when the game ends
                }
    
            }
                */            
            })
            .catch( (error) => {
                console.log('Score not added');
                console.log(error);
            });
    }
  
}

    //send replay request to server to clear the board and winner
    function ReplayTicTac() {
        let player = localStorage.getItem('username');
        console.log('player', player);
        let url = 'http://localhost:80/reset/tictac/' + player;
        fetch(url, { method: 'POST', body: player })
            .then(data => {
                // Get the button element
                var button = document.getElementById("Replay");
                
                // Remove the button from the document
                if (button) {
                    button.parentNode.removeChild(button);
                }
                //set board to empty
                document.getElementById('upleft').innerHTML = '';
                document.getElementById('upmid').innerHTML = '';
                document.getElementById('upright').innerHTML = '';
                document.getElementById('midleft').innerHTML = '';
                document.getElementById('midmid').innerHTML = '';
                document.getElementById('midright').innerHTML = '';
                document.getElementById('downleft').innerHTML = '';
                document.getElementById('downmid').innerHTML = '';
                document.getElementById('downright').innerHTML = '';
                if(gamemode == 'pvp'){
                    changeMode();
                }
                //set to false to replay game.
                gameEnded = false;
            });
    }

//update board on both players sides. (note whoever hits play with strangers first is 'X')
function getBoard() {
    //grab player to find gameboard server side.
    let player = localStorage.getItem('username');
    fetch('http://localhost:80/tictac/board/' + gamemode + '/' + player)
        .then(response => response.json())
        .then(data => {
            console.log('getboard', data)
            // Update the board based on the server's response
            let board = data.board;
            for (let i = 0; i < board.length; i++) {
                let playerpiece = '';
                if (board[i] == 1) {
                    playerpiece = 'X';
                } else if (board[i] == 2) {
                    playerpiece = 'O';
                } else {
                    playerpiece = '';
                }
                let e_id = movenames[i];
                let element = document.getElementById(e_id);
                element.innerHTML = playerpiece;
            }
            if (data.winner == '') {
                gamerunning = true;
            }
            if(data.winner != '' && gamerunning){
                alert('Game Over Winner Is: ' + data.winner);
                var button = document.createElement("button");
                button.id = "Replay";
                button.innerHTML = "Replay";
                button.onclick = function() {
                    //reset game
                    ReplayTicTac();
                };
                document.body.appendChild(button);
                gameEnded = true; // Set the flag to true when the game ends
                gamerunning = false;
            }
        })
        .catch(error => {
            console.log('Error:', error);
        });
    //call getBoard every second
    setTimeout(getBoard, 1000);
}

//change mode between pvp and pve
function changeMode(){
    getBoard();
    var button = document.getElementById('friend');
    //change to player vs player
    if(gamemode == 'pve'){
        gamemode = 'pvp';
        //set server to call from function playvplay
        //begin update board on both client sides
        button.innerHTML = 'Play Alone!';
        let player = localStorage.getItem('username');
        let url = 'http://localhost:80/tictac/move/' + 100 + '/' + gamemode + '/' + player;
        fetch(url, { method: 'POST', body: 100, gamemode, player })
            .then(response => response.json())
            .then(data => {});
        //change to player vs ai
    } else if(gamemode == 'pvp'){
        gamemode = 'pve';
        button.innerHTML = 'Play with Strangers!';
    }
    console.log(gamemode)
}

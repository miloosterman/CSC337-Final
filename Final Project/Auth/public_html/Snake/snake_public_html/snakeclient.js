/*
Keala Goodell
This Client-Side Code is used for Snake. 
Upon loading, the game is reset.
This code uses a series of functions to 
run the game.
*/

//base game start. Set direction to right, clear board, set score to 0, put food in start position
let gameBoard = null;
let grid = [];
let gridSize = 10; // Change this to increase/decrease the size of the grid
let snakeboard = null;
let snakeboard_ctx = null;
let snake = [];
let food = {x: 200, y: 200};
let wait_ms = 300;
let gameover = true;
let direction = "R";
let score = 0;

//begin game. set starting snake size, direction, score, update food and board 
function initGameBoard()
{ 
    direction = "R";
    score = 0;
    document.getElementById('points').innerHTML = "Score: " + score;
    wait_ms = 300;
    snake = [{x: 200, y: 200},  {x: 200, y: 200},  {x: 200, y: 200},  {x: 200, y: 200},  {x: 200, y: 200},];
    gameBoard = document.getElementsByClassName('gameboard');
    snakeboard = document.getElementById("snakehome");
    snakeboard_ctx = snakeboard.getContext("2d");
    gameover = false;
    snake.forEach(drawSnakePart);
    updateFood();
    drawBoard();
}

//draw snake parts
function drawSnakePart(snakePart) 
{  
    snakeboard_ctx.fillStyle = 'darkgreen';  
    snakeboard_ctx.strokestyle = 'chartreuse';
    snakeboard_ctx.fillRect(snakePart.x, snakePart.y, gridSize, gridSize);  
    snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize);
}

//draw food block
function drawFood(foodPart) 
{  
    snakeboard_ctx.fillStyle = 'red';  
    snakeboard_ctx.strokestyle = 'white';
    snakeboard_ctx.fillRect(foodPart.x, foodPart.y, gridSize, gridSize);  
    snakeboard_ctx.strokeRect(foodPart.x, foodPart.y, gridSize, gridSize);
}

//erase block(make it the same as gameboard)
function eraseBlock(block)
{
    snakeboard_ctx.fillStyle = 'black';  
    snakeboard_ctx.strokestyle = 'mediumpurple';
    snakeboard_ctx.fillRect(block.x, block.y, gridSize, gridSize);  
    snakeboard_ctx.strokeRect(block.x, block.y, gridSize, gridSize);
}

//create board
function drawBoard()
{
    for (x=0; x < 400; x += gridSize) {
        for (y = 0; y < 400; y += gridSize) {
            eraseBlock({x: x, y: y});
        }
    }
}

//use arrow keys to move snake
document.onkeydown = SetDirection;

function SetDirection(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        direction = 'U';
    }
    else if (e.keyCode == '40') {
        // down arrow
        direction = 'D';
    }
    else if (e.keyCode == '37') {
       // left arrow
       direction = 'L';
    }
    else if (e.keyCode == '39') {
       // right arrow
       direction = 'R';
    }

}

//update food location then draw
function updateFood()
{
    eraseBlock(food);
    food.x = Math.floor(Math.random() * 39)*gridSize;
    food.y = Math.floor(Math.random() * 39)*gridSize;
    if (score == 0){
        food.x = 300;
        food.y = 200;
    }

    drawFood(food);
}

//update board as playing
function updateBoard()
{
    //check direction and set snake head
    let newhead = {x: snake[0].x, y: snake[0].y};
    if(direction == 'U'){
    newhead.y = newhead.y - gridSize;
    }
    else if(direction == 'D'){
        newhead.y = newhead.y + gridSize;
    }
    else if(direction == 'L'){
        newhead.x = newhead.x - gridSize;
    }
    else if(direction == 'R'){
        newhead.x = newhead.x + gridSize
    }
    //check if game over
    if(newhead.x > 390 || newhead.x < 0 || newhead.y > 390 || newhead.y < 0){
        gameover = true;
        alert('Game Over');
        sendScore(score)
        var button = document.createElement("button");
        button.id = "Replay";
        button.innerHTML = "Replay";
        button.onclick = function() {
          Replay();
        };
        document.body.appendChild(button)
    }
    //check if game over
    for(i = 0; i < snake.length; i++){
        if(newhead.x == snake[i].x && newhead.y == snake[i].y){
            gameover = true;
            alert('Game Over');
            sendScore(score)
            var button = document.createElement("button");
            button.id = "Replay";
            button.innerHTML = "Replay";
            button.onclick = function() {
              Replay();
            };
            document.body.appendChild(button)
        }
    }
    //move snake and update
    if(newhead.x == food.x && newhead.y == food.y){
        score += 1;
        document.getElementById('points').innerHTML = "Score: " + score;
        updateFood();
        if(wait_ms > 10){
            wait_ms = wait_ms - 10;
        }
    } else {  
        eb = snake.pop();
        eraseBlock(eb);
    }
    snake.unshift(newhead);
    drawSnakePart(newhead);
    drawFood(food);
}

//run game(make move faster as snake eats)
function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

//run game
async function startGame()
{
    while (!gameover) {
        updateBoard();
        await sleep(wait_ms);
    }
}

//repkay game
function Replay(){
    // Get the button element
    var button = document.getElementById("Replay");
    
    // Remove the button from the document
   if (button) {
        button.parentNode.removeChild(button);
    }
    initGameBoard();
    startGame();
}

//draw the snake 
function drawSnake() 
{
    initGameBoard();
    startGame();
}

//when game ends, send score to server
function sendScore(score) {
    console.log(localStorage.getItem("username"));
    let player = localStorage.getItem('username');
    let playerScore = score;
    //make url to send to server
    let url = 'http://localhost:80/snake/' + player +'/'+ playerScore;
    fetch(url, { method: 'POST', body: player, playerScore})
        .then(response => response.json())
        .catch( (error) => {
            console.log('Score not added');
            console.log(error);
        });
}
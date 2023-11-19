///*
let gameBoard = null;
let grid = [];
let gridSize = 10; // Change this to increase/decrease the size of the grid
let snakeboard = null;
let snakeboard_ctx = null;
let direction = "R";
let snake = [];
let food = {x: 200, y: 200};
let wait_ms = 300;
let gameover = true;
let score = 0;

function initGameBoard()
{ 
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

function drawSnakePart(snakePart) 
{  
    console.log("drawSnakePart");
    snakeboard_ctx.fillStyle = 'darkgreen';  
    snakeboard_ctx.strokestyle = 'chartreuse';
    snakeboard_ctx.fillRect(snakePart.x, snakePart.y, gridSize, gridSize);  
    snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, gridSize, gridSize);
}

function drawFood(foodPart) 
{  
    snakeboard_ctx.fillStyle = 'red';  
    snakeboard_ctx.strokestyle = 'white';
    snakeboard_ctx.fillRect(foodPart.x, foodPart.y, gridSize, gridSize);  
    snakeboard_ctx.strokeRect(foodPart.x, foodPart.y, gridSize, gridSize);
}

function eraseBlock(block)
{
    snakeboard_ctx.fillStyle = 'black';  
    snakeboard_ctx.strokestyle = 'mediumpurple';
    snakeboard_ctx.fillRect(block.x, block.y, gridSize, gridSize);  
    snakeboard_ctx.strokeRect(block.x, block.y, gridSize, gridSize);
}

function drawBoard()
{
    for (x=0; x < 400; x += gridSize) {
        for (y = 0; y < 400; y += gridSize) {
            eraseBlock({x: x, y: y});
        }
    }
}

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


function updateBoard()
{
    // this needs to be in the loop
    // move snake
    // if ateFood()
    //   updateFood()
    // else
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

    if(newhead.x > 390 || newhead.x < 0 || newhead.y > 390 || newhead.y < 0){
        gameover = true;
        alert('Game Over');
    }

    for(i = 0; i < snake.length; i++){
        console.log(snake[i].x,snake[i].y);
        if(newhead.x == snake[i].x && newhead.y == snake[i].y){
            gameover = true;
            alert('Game Over');
        }
    }
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

function sleep(ms)
{
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function startGame()
{
    while (!gameover) {
        console.log("1"); 
        updateBoard();
        await sleep(wait_ms);
        console.log("2"); 
    }
}

function drawSnake() 
{
    initGameBoard();
    startGame();
}

//*/
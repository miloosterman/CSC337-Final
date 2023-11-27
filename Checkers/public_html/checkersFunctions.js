/*
Title: checkersFunctions.js
Author: Joshua S. Andrews
Purpose: Houses all functions necessary for checkers.html
*/

/* 
Representation of a checker board as a 2D array.
-1 is Player 1, 1 is Player 2, 0 is no game piece
*/
{
	var TURN=0;
	var BOARD = [];
}

// Generates the backing initial array of a checkers game
function generateBoard() {
	if (TURN == 0) {
		for (var row=0;row<8;row++) {
			for (var col=0;col<8;col++){
				if (row<3) {
					if(row%2==0 && col%2!=0) {
						BOARD[row*8+col]=-1;
					} else if (row%2!=0 && col%2==0){
						BOARD[row*8+col]=-1;
					} else {
						BOARD[row*8+col]=0;
					}
				} else if (row>4) {
					if(row%2!=0 && col%2==0) {
						BOARD[row*8+col]=1;
					} else if (row%2==0 && col%2!=0) {
						BOARD[row*8+col]=1;
					} else {
						BOARD[row*8+col]=0;
					}
				} else {
					BOARD[row*8+col]=0
				}
			}
		}
	}
	console.log(BOARD);
}

function drawBoard() {
	const canvas = document.querySelector('canvas'); 
	const c = canvas.getContext('2d');

	const cWidth = 400;
	const cHeight = 400;

	canvas.width = cWidth;
	canvas.height = cHeight;
	
	for (var row = 0; row<8; row++) {
		for (var col = 0; col<8; col++) {
			if ((row%2==0 && col%2!=0) || (row%2!=0 && col%2==0)) {
				c.fillStyle = 'rgba(0,0,0,1.0)';
			} else {
				c.fillStyle = 'rgba(255,0,0,1.0)';
			}
			// draws checker pattern
			c.fillRect(((cWidth/8)*row),
						((cHeight/8)*col),
						(cWidth/8), 
						(cHeight/8));
			// put player pieces in
		}
	}
	console.log(canvas);
}

/*
Used to run all necessary functions of Checkers including on initial 
load
*/
function onLoad() {
	generateBoard();
	drawBoard();
}

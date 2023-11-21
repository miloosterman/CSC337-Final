/*
Title: checkersFunctions.js
Author: Joshua S. Andrews
Purpose: Houses all functions necessary for checkers.html
*/

/* 
Representation of a checker board as a 2D array.
-1 is Player 1, 1 is Player 2, 0 is no game piece
*/
{ var BOARD = [[]]; 
  var TURN = 0;}

/*
Draws an 8x8 grid for a checkers game where a -1 is a Player 1 piece, 0 is an 
empty square, and 1 is a Player 2 piece with numbers representing pieces
*/
function drawBoardInNumbers() {
	let table = document.getElementById("boardContainer");
	
	let htmlString = "";
	for (var r=0; r<8; r++) {
		htmlString += "<tr>";
		for (var c=0; c<8; c++) {
			htmlString += "<td>"+BOARD[r[c]]+"</td>";
		}
		htmlString+="</tr>"
	}
	table.innerHTML = htmlString;
}

// Initializes a new game Array for checkers
function newGame() {
	for (var r = 0; r < 8; r++) {
		for (var c = 0; c < 8; c++) {
			if (c%2 == 0) {
				if (r < 3) {
					BOARD[r[c]] = -1;
				} else if (r>5) {
					BOARD[r[c]] = 1;
				} else {
					BOARD[r[c]] = 0;
			} else {
				if (r == 1) {
					BOARD[r[c]] = -1;
				} else if (r == 5 || r == 7) {
					BOARD[r[c]] = 1;
				} else {
					BOARD[r[c]] = 0;
				}
			}
		}
	}
}

/*
Draws a Checker Board with the specified piece locations in the table
*/
function drawBoard() {
	game.innerHTML = "";
	
	for (let r = 0; r < 8; r++) {
		const gameRow = BOARD[r];
		let row = document.createElement('div');
		row.setAttribute('class', 'row');
		
		for (let j = 0; j < element.length; j++) {
			const elmnt = element[j]	
}

// Gets times current player has won

// Shows which Player's turn it is
function playerTurn() {
	let indicator = document.getElementById('turn');
	if (TURN < 0) {
		// Player 1
		indicator.innerHTML = "<p>Player 1's Turn</p>";
	} else if (TURN > 0) {
		indicator.innerHTML = "<p>Player 2's Turn</p>";
	} else {
		// No Game Running
		indicator.innerHTML = "";
}

/*
Used to run all necessary functions of Checkers including on initial 
load
*/
function onLoad() {
	newGame();
}
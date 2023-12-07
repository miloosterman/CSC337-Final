function onLoad() {
	// New Game Board
	var gameBoard = 
		[[0, 1, 0, 1, 0, 1, 0, 1],
		[1, 0, 1, 0, 1, 0, 1, 0],
		[0, 1, 0, 1, 0, 1, 0, 1],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0, 0, 0, 0],
		[2, 0, 2, 0, 2, 0, 2, 0],
		[0, 2, 0, 2, 0, 2, 0, 2],
		[2, 0, 2, 0, 2, 0, 2, 0]];
	var pieces = [];
	var squares = [];
	
	// Load Player Names and Data
	var playerData = function () {
		var players = document.getElementsByClassName('player');
		for (i in players) {
			console.log(i);
			players[i].innerHTML = 
				"<p id='player"+i+"data'>Player "+i+"</p>";
		}
	};
	
	playerData();
	
	// Player Piece's object class
	function Piece(element, position) {
		// Can move, not jump
		this.canMove = true;
		// element in DOM
		this.element = element;
		// location on board as [row, col]
		this.position = position;	
		// which player?
		this.player = '';
		// find which player by piece id
		if (this.element.attr('id') < 12) {
			this.player = 1;
		} else {
			this.player = 2;
		}
		// Upgrades piece to a king
		this.king = false;
		this.makeKing = function () {
			this.element.css('backgroundImage', "url('king" + this.player + '.png');
			this.king = true;
		}
		// movement
		this.move = function (square) {
			this.element.removeClass('selected');
			// can't do move, return false
			if (!Board.isValidMove(square.position[0], square.position[1])) {
				return false;
			}
			// Non-king cannot move backwards
			if (this.king == false) {
				if ((this.player == 1 && (square.position[0] < this.position[0])) ||
					(this.player == 2 && (square.position[0] > this.position[0]))) {
						return false;
					}
			}
			// Remove piece on Board
			Board.board[this.position[0]][this.position[1]] = 0;
			// add piece at new location
			Board.board[square.position[0]][square.position[1]]=this.player;
			// Update piece instance location
			this.position = [square.position[0], square.position[1]];
			// Mod CSS based off of dictionary
			this.element.css('top', Board.dictionary[this.position[0]]);
			this.element.css('left', Board.dictionary[this.position[1]]);
			// Promotes a piece if it hits opposing team's side
			if (!this.king && (this.position[0] == 0 || this.position[0] == 7)) {
				this.makeKing();
				return true;
		}};
		
		// Checks if able to capture enemy piece
		this.canJump = function () {
			return (this.canOppJump([this.position[0]+2, this.position[1]+2]) ||
				this.canOppJump([this.position[0]+2, this.position[1]-2]) ||
				this.canOppJump([this.position[0]-2, this.position[1]+2]) ||
				this.canOppJump([this.position[0]-2, this.position[1]-2]))
		};
		
		this.canOppJump = function (newPosition) {
			// location change amount
			var x = newPosition[1] - this.position[1];
			var y = newPosition[0] - this.position[0];
			// Not a backjump if not king
			if (!this.king) {
				if ((this.player == 1 && (newPosition[0] < this.position[0])) ||
					(this.player == 2 && (newPosition[0] > this.position[0]))) {
						return false;
					}
			}
			// Jump is on board
			if ((newPosition[0] > 7) || (newPosition[0] < 0) ||
				(newPosition[1] > 7) || (newPosition[1] < 0)) {
					return false;
			}
			// checks captured piece
			var squareX = this.position[1] + x/2;
			var squareY = this.position[0] + y/2;
			if ((squareX > 7) || (squareX < 0) || 
				(squareY > 7) || (squareY < 0)) {
					return false;
			}
			if (!Board.isValidMove(squareY, squareX) && 
				Board.isValidMove(newPosition[0], newPosition[1])) {
				// find piece at newPosition
				for (let i in pieces) {
					if (pieces[i].position[0] == squareY && 
						pieces[i].position[1] == squareX) {
						if (this.player != pieces[i].player) {
							// return the piece selected
							return pieces[i];
						}
					}
				}
			}
			return false;
		};
		this.oppJump = function (square) {
			var toRemove = this.canOppJump(square.position);
			// remove piece if exists
			if (toRemove) {
				toRemove.remove();
				return true;
			} else {
				return false;
			}
		};
		
		// remove piece
		this.remove = function () {
			// remove element from html display
			this.element.css('display', 'none');
			if (this.player == 1) {
				$('#player2').append("<div class='capturedPiece'></div>");
				Board.score.player2+=1;
			}
			if (this.player == 2) {
				$('#player1').append("<div class='capturedPiece'></div>");
				Board.score.player1+=1;
			}
			Board.board[this.position[0]][this.position[1]]=0;
			// reset position
			this.position = [];
			
			var playerWon = Board.checkWinner();
			if (playerWon) {
				$('#winner').html("Player " + playerWon + "has won!!!");
			}
		}
	}
	function Square(element, position) { 
		// linked element
		this.element = element;
		// position on board
		this.position = position;
		// if moveable from selected position
		this.inRange = function (piece) {
			// piece.position == from location
			// this.position == to location
			console.log("Piece Info: \n   canMove: " + 
				piece.canMove + "\n   element: " +
				piece.element + "\n   position: " +
				piece.position + "\n   player: " +
				piece.player + "\n   king: " +
				piece.king);
			console.log("This info: \n   Position: " + this.position);
			/*
			// Moving backwards, not if not king
			if (!piece.king && (
				(piece.player == 1 && (this.position[0] < piece.position[0])) ||
				(piece.player == 2 && (this.position[0] > piece.position[0])))) {
					return 'Out of Range';
			}
			*/
			for (let k of pieces) {
				// piece.position == from location
				// this.position == to location
				// k.position == a piece at a location on the board
				console.log('k pos: ' + k.position);
				// piece in selected spot to move to
				if (k.position[0] == this.position[0] && k.position[1] == this.position[1]) {
					return 'Out of Range';
				}
				// tried moving backwards with a non-king
				if (!piece.king &&  
						((piece.player == 1 && this.position[0] < piece.position[0]) ||
						(piece.player == 2 && this.position[0] > piece.position[0]))) {
						console.log("can't go backwards with non-king");
					return 'Out of Range';
				}
				// 
				
				if (
					// 1 row up
					((piece.position[0]-this.position[0] == -1) && 
						// left
						(piece.position[1]-this.position[1] == -1) ||
						// right
						(piece.position[1]-this.position[1] == 1)) ||
					// 1 row down
					((piece.position[0]-this.position[0] == 1) && 
						// left
						(piece.position[1]-this.position[1] == -1) ||
						// right
						(piece.position[1]-this.position[1] == 1))
						) {
					console.log('normal');
					return 'normal';
				}
				
				if (
					// 2 rows up
					((piece.position[0]-this.position[0] == -2) && 
						// 2 left
						(piece.position[1]-this.position[1] == -2) ||
						// 2 right
						(piece.position[1]-this.position[1] == 2)) ||
					// 2 rows down
					((piece.position[0]-this.position[0] == 2) && 
						// 2 left
						(piece.position[1]-this.position[1] == -2) ||
						// 2 right
						(piece.position[1]-this.position[1] == 2))
						) {
					//console.log('jump');
					return 'jump';
				}
				console.log('range didnt work');
			};
		}
	}
		
	// Board
	var Board = {
		board: gameBoard, 
		score: { player1: 0, player2: 0},
		playerTurn: 1,
		jumpExists: false,
		continuousJump: false,
		squaresElement: $('div.squares'),
		// spacing for a 100 pixel board on display
		dictionary: ['0vmin', '10vmin', '20vmin', '30vmin', '40vmin', '50vmin', '60vmin', '70vmin', '80vmin', '90vmin'],
		// initialize board
		init: function () {
			var countPieces = 0;
			var countSquares = 0;
			for (let row in this.board) {
				for (let col in this.board[row]) {
					if (row % 2 == 1) {
						if (col % 2 == 0) {
							countSquares = this.squareDraw(row,col, countSquares);
						}
					} else {
						if (col % 2 == 1) {
							countSquares = this.squareDraw(row,col, countSquares);
						}
					}
					if (this.board[row][col] == 1) {
						countPieces = this.playerDraw(1, row, col, countPieces);
					}
					if (this.board[row][col] == 2) {
						countPieces = this.playerDraw(2, row, col, countPieces);
					}
				}
			}
		},
		squareDraw: function (row, col, countSquares) {
			this.squaresElement.append("<div class='square' id='square" + 
				countSquares + "' style='top:" + 
				this.dictionary[row] + 
				";left:"+this.dictionary[col]+
				";'></div>");
			squares[countSquares]= new Square($("#square"+countSquares), 
				[parseInt(row), parseInt(col)]);
			return countSquares+1;
		},
		playerDraw: function (playerNum, row, col, countPieces) {
			/*
			console.log("<div class='piece' id='" +
				countPieces + "' style='top:" + this.dictionary[row] + 
				"; left:" + this.dictionary[col] + ";></div>");
			*/
			$(`.player${playerNum}pieces`).append("<div class='piece' id='" +
				countPieces + "' style='top:" + this.dictionary[row] + 
				"; left:" + this.dictionary[col] + ";'></div>");
			pieces[countPieces] = 
				new Piece($("#"+countPieces), [parseInt(row), parseInt(col)]);
			return countPieces+1;
		},
		// Check if location is part of game
		isValidMove: function (row, col) {
			// off board
			if (row < 0 || row > 7 || col < 0 || col > 7) {
				return false;
			} 
			if (this.board[row][col]==0) {
				return true;
			}
			return false;
		},
		// Change which player's turn it is
		changeTurn: function () {
			if (this.playerTurn == 1) {
				this.playerTurn = 2;
				// change css for active player
				$('.turn').css("background", "linear-gradient(to right, transparent 50%, #BEEE62 50%");
			} else {
				this.playerTurn = 1;
				$('.turn').css("background", "linear-gradient(to right, transparent 50%, #BEEE62 50%");
			}
			this.canJump();
			return;
		},
		checkWinner: function () {
			if (this.score.player1 == 12) {
				return 1;
			} else if (this.score.player2 == 12) {
				return 2;
			}
			return false;
		},
		// resets all game state data
		clear: function () {
			location.reload();
		},
		canJump: function () {
			this.jumpExists = false;
			this.continuousJump = false;
			for (let k of pieces) {
				k.canMove = false;
				// if there is a jump allowed, those pieces have their jump 
				// attribute set
				if (k.position.length != 0 && k.player == this.playerTurn && k.canJump()) {
					console.log('Board.canJump == true');
					this.jumpExists = true;
					k.canMove = true;
				}
			}
			// if no jump, can move any piece
			if (!this.jumpExists) {
				for (let k of pieces) {
					k.canMove = true;
				}
			}
		},
			/* 
			* Returns a String representation of the gameBoard for debugging and 
			* transferring through server
			*/
		board_toString: function () {
			ret = ""
			for (let i in this.board) {
				for (let j in this.board[i]) {
					var found = false
					for (let k of pieces) {
						if (k.position[0] == i && k.position[1] == j) {
							if (k.king) {
								ret += (this.board[i][j] + 2)
							} else {
								ret += this.board[i][j];
							}
						found = true
						break
						}
					}
					if (!found) {
						ret += '0'
					}
				}
			}
			return ret
		}
	} // End Board Object
	
	// Initialize the game
	Board.init();
	
	
	// Listeners
	
	// On click, select piece
	$('.piece').on('click', function () {
		var selected;
		var isPlayerTurn = ($(this).parent().attr("class").split(' ')[0] == "player" + Board.playerTurn + "pieces");
		
		if (isPlayerTurn) {
			if (!Board.continuousJump && pieces[$(this).attr("id")].canMove) {
				if ($(this).hasClass('selected')) {
					selected = true;
				}
				$('.piece').each(function (i) {
					$('.piece').eq(i).removeClass('selected');
				});
				if (!selected) {
					$(this).addClass('selected');
				}
			} else { 
				let exist = 'Cannot move that piece. Must move a piece that can jump';
				let cont = 'Piece must make all jumps available to it.';
				let msg = !Board.continuousJump ? exist : cont
				console.log(msg);
			}
		}
	});
	
	// Reset Button Working
	$('#cleargame').on("click", function() {
		Board.clear();
	});
	
	// Piece movement through clicks
	$('.square').on("click", function () {
		if ($('.selected').length != 0) {
			var squareID = $(this).attr("id").replace(/square/, '');
			var square = squares[squareID];
			// Piece clicked on
			var piece = pieces[$('.selected').attr('id')];
			// can be moved to
			var inRange = square.inRange(piece);
			console.log("Range: " + inRange);
			if (inRange != 'Out of Range') {
				// check for continuous jumps
				if (inRange == 'jump') {
					console.log('Jumps');
					if (piece.oppJump(square)) {
						piece.move(square);
						if (piece.canJump()) {
							// last player to move must make another jump
							// also, reselect last moved piece
							piece.element.addClass('selected');
							// can't deselect last piece
							Board.continuousJump = true;
						} else {
							Board.changeTurn();
						}
					}
				} else if (inRange == 'normal' && !Board.jumpExists) {
					if (!piece.canJump()) {
						piece.move(square);
						Board.changeTurn();
					} else {
						alert("If you can, you must jump!");
					}
				}
			}
			
		}
	});
}

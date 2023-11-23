const movenames = ["upleft", "upmid", "upright", "midleft", "midmid", "midright", "downleft", "downmid", "downright"];
function playerTurnUL(){
    playerTurn('X', 0);
}

function playerTurnUM(){
    playerTurn('X', 1);
}

function playerTurnUR(){
    playerTurn('X', 2);
}

function playerTurnML(){
    playerTurn('X', 3);
}

function playerTurnMM(){
    playerTurn('X', 4);
}

function playerTurnMR(){
    playerTurn('X', 5);
}

function playerTurnDL(){
    playerTurn('X', 6);
}

function playerTurnDM(){
    playerTurn('X', 7);
}

function playerTurnDR(){
    playerTurn('X', 8);
}

let gameEnded = false; // Add a flag to track if the game has ended

function playerTurn(piece, move) {
    if (gameEnded) {
        return; // If the game has ended, don't allow further moves
    }
    player_e_id = movenames[move];
    console.log(piece, move, player_e_id);
    let playerElement = document.getElementById(player_e_id);
    let url = 'http://localhost:80/play/move/' + move;
    fetch(url, { method: 'POST', body: move })
        .then(response => response.json())
        .then(data => {
            playerElement.innerHTML = piece;
            let winner = data.winner;
            if (winner != 1) {
                console.log(data);
                let aiMove = data.aimove;
                console.log(aiMove)
                let ai_e_id = movenames[aiMove];
                let aiElement = document.getElementById(ai_e_id);
                aiElement.innerHTML = 'O';
            } else {
                alert('Game Over');
                var button = document.createElement("button");
                button.id = "Replay";
                button.innerHTML = "Replay";
                document.body.appendChild(button)
                gameEnded = true; // Set the flag to true when the game ends
            }
        })
        .catch( (error) => {
            console.log('Item not added');
            console.log(error);
        });
}

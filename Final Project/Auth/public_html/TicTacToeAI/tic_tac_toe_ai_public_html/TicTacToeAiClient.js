window.onload = function() {

    let gameEnded = false; // Add a flag to track if the game has ended

    const movenames = ["upleft", "upmid", "upright", "midleft", "midmid", "midright", "downleft", "downmid", "downright"];

    //playerTurn('B', -1);
    ReplayTicTac();
    movenames.forEach((moveName, index) => {
        let moveElement = document.getElementById(moveName);
        moveElement.addEventListener('click', () => playerTurn('X', index));
    });


    function playerTurn(piece, move) {
        if (gameEnded) {
            return; // If the game has ended, don't allow further moves
        }
        player_e_id = movenames[move];
        console.log(piece, move, player_e_id);
        let mode = 'pve'
        let playerElement = document.getElementById(player_e_id);
        let url = 'http://localhost:80/play/move/' + move +'/'+ piece + '/' + mode;
        fetch(url, { method: 'POST', body: move, piece, mode })
            .then(response => response.json())
            .then(data => {
                playerElement.innerHTML = piece;
                let winner = data.winner;
                //if (winner == '') {
                    console.log(data);
                   // let aiMove = data.aimove;
                    let board = data.board;
                    console.log(board);
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
             //   } 
                if(winner != "") { 
                    alert('Game Over Winner Is: ' + winner);
                    var button = document.createElement("button");
                    button.id = "Replay";
                    button.innerHTML = "Replay";
                    button.onclick = function() {
                        ReplayTicTac();
                    };
                    document.body.appendChild(button);
                    gameEnded = true; // Set the flag to true when the game ends
                }
            })
            .catch( (error) => {
                console.log('Item not added');
                console.log(error);
            });
    }

    function ReplayTicTac() {
        let url = 'http://localhost:80/reset/tictac/';
        fetch(url, { method: 'POST' })
            .then(data => {
                // Get the button element
                var button = document.getElementById("Replay");
                
                // Remove the button from the document
                if (button) {
                    button.parentNode.removeChild(button);
                }
                document.getElementById('upleft').innerHTML = '';
                document.getElementById('upmid').innerHTML = '';
                document.getElementById('upright').innerHTML = '';
                document.getElementById('midleft').innerHTML = '';
                document.getElementById('midmid').innerHTML = '';
                document.getElementById('midright').innerHTML = '';
                document.getElementById('downleft').innerHTML = '';
                document.getElementById('downmid').innerHTML = '';
                document.getElementById('downright').innerHTML = '';
                gameEnded = false;
            });
    }
}
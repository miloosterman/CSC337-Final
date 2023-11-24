window.onload = function() {

    const movenames = ["upleft", "upmid", "upright", "midleft", "midmid", "midright", "downleft", "downmid", "downright"];

    movenames.forEach((moveName, index) => {
        let moveElement = document.getElementById(moveName);
        moveElement.addEventListener('click', () => playerTurn('X', index));
    });

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
                    button.onclick = function() {
                    ReplayTicTac();
                    };
                    document.body.appendChild(button)
                    gameEnded = true; // Set the flag to true when the game ends
                }
            })
            .catch( (error) => {
                console.log('Item not added');
                console.log(error);
            });
    }

    function  ReplayTicTac(){
        let url = 'http://localhost:80/reset/tictac/';
        // Get the button element
        var button = document.getElementById("Replay");
        
        // Remove the button from the document
        if (button) {
            button.parentNode.removeChild(button);
        }
    }
}
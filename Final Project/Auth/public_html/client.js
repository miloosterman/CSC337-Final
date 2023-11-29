document.addEventListener('DOMContentLoaded', () => {
    const scoresDisplay = document.getElementById('scores-display');
    const gameNamesSelect = document.getElementById('Game-names');
  
    function fetchScores(game) {
      fetch(`http://localhost/scores/${game}`)
        .then(response => response.json())
        .then(scores => {
          scoresDisplay.innerHTML = `
            <p>Username: ${scores.username}</p>
            <p>${game} Wins: ${scores[`${game}Wins`]}</p>
            <p>Snake Score: ${scores.SnakeScore}</p>
            <hr>
          `;
        })
        .catch(error => console.error(`Error fetching ${game} scores:`, error));
    }
  
    // Fetch scores for the initially selected game
    const initialGame = gameNamesSelect.value;
    fetchScores(initialGame);
  
    // Add an event listener for the onchange event of the gameNamesSelect
    gameNamesSelect.addEventListener('change', () => {
      const selectedGame = gameNamesSelect.value;
      fetchScores(selectedGame);
    });
  });
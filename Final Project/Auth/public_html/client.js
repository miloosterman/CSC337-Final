/*
Group Members:
Milo Osterman
Keala Goodell
Joshua Andrews
Ayden DaCosta

Course: CSC337

File: client.js

Purpose: Score handling JS file
*/
function fetchScores() {
  const scoresDisplay = document.getElementById('scores-display');
  const gameNamesSelect = document.getElementById('Game-names').value;
  console.log(gameNamesSelect)
  let game = "TicTac"
  if(gameNamesSelect == 'Tic'){
      game = 'TicTacWin'
  } else if(gameNamesSelect == 'Snake'){
      game = 'Snake'
  } else if(gameNamesSelect == 'Check'){
      game = 'CheckerWin'
  }
  console.log(game)
  let url = 'http://143.198.117.187:80/scores/' + game;
  fetch(url, { method: 'GET'})
  .then(response => response.json()) // Add this line to parse the response as JSON
  .then(scores => {
      console.log('scores');
      console.log(scores);
      if (scores != undefined) {
          let innerHTML = '';
          for (let i = 0; i < scores.length; i++) {
              let user = scores[i][0];
              let score = scores[i][1];
              innerHTML += `Username: ${user}, Score: ${score}<br>`;
          }
          scoresDisplay.innerHTML = innerHTML;
          console.log(scoresDisplay)
      }
  })
  .catch(error => console.error(`Error fetching ${game} scores:`, error));
}

// Fetch scores for the initially selected game
const gameNamesSelect = document.getElementById('Game-names').value; // Declare gameNamesSelect here
fetchScores(gameNamesSelect);

/*
Group Members:
Milo Osterman
Keala Goodell
Joshua Andrews
Ayden DaCosta

Course: CSC337

File: Hompage.js

Purpose: Client side handling for home page
*/

document.addEventListener('DOMContentLoaded', function() {
    const scoreboardButton = document.getElementById('Scoreboard');
    const rankingButton = document.getElementById('Ranking');

    scoreboardButton.addEventListener('click', function() {
        console.log("Scoreboard button clicked!");
        window.location.href = 'scoreboard.html';
    });

    rankingButton.addEventListener('click', function() {
        console.log("Ranking button clicked!");
        window.location.href = 'ranking.html';
    });
});
document.querySelectorAll('.game-link').forEach(item => {
    item.addEventListener('click', async event => {

      let gameName = event.target.getAttribute("id");

      console.log("click");
      try {
        const response = await fetch('/game-click', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ gameName: gameName })
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Server response:', data);

          // Handle the server response as needed
          if (data.favoriteGame) {
            console.log(`Favorite game: ${data.favoriteGame.gameName}, Total Clicks: ${data.favoriteGame.totalClicks}`);
          }

          try {
            const mostClickedResponse = await fetch('/most-clicked-game');
            if (mostClickedResponse.ok) {
                const mostClickedData = await mostClickedResponse.json();
                console.log(`Most clicked game: ${mostClickedData.gameName}, Total Clicks: ${mostClickedData.totalClicks}`);
            } else {
                console.error('Most clicked game request failed:', mostClickedResponse.statusText);
            }
        } catch (error) {
            console.error('Error during most clicked game fetch:', error);
        }

    } else {
        console.error('Server response not okay:', response.statusText);
    }
} catch (error) {
    console.error('Error during fetch:', error);
}
});
});
  document.addEventListener('DOMContentLoaded', async () => {
    const favoriteGameJSON = localStorage.getItem('favoriteGame');
    if (favoriteGameJSON) {
        const favoriteGame = JSON.parse(favoriteGameJSON);
        console.log(`Favorite game: ${favoriteGame.gameName}, Total Clicks: ${favoriteGame.totalClicks}`);
    } else {
        console.log('No favorite game found.');
    }
    try {
        const mostClickedResponse = await fetch('/most-clicked-game');
        if (mostClickedResponse.ok) {
            const mostClickedData = await mostClickedResponse.json();
            console.log(`Most clicked game: ${mostClickedData.gameName}, Total Clicks: ${mostClickedData.totalClicks}`);
            const mostClickedGameDiv = document.getElementById('mostClickedGame');
            const mostClickedGameInfo = document.getElementById('mostClickedGameInfo');
            mostClickedGameInfo.textContent = `Game: ${mostClickedData.gameName}, Clicks: ${mostClickedData.totalClicks}`;
        } else {
            console.error('Most clicked game request failed:', mostClickedResponse.statusText);
        }
    } catch (error) {
        console.error('Error during most clicked game fetch:', error);
    }
});

    
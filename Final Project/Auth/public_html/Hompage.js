// this is the client side of the main homepages
// Ayden DaCosta


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
      let gameName = event.target.getAttribute('data-game-name');
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

        } else {
          console.error('Server response not okay:', response.statusText);
        }
      } catch (error) {
        console.error('Error during fetch:', error);
      }
    });
  });


    
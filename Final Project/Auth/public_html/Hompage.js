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
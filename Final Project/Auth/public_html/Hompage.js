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
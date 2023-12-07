/*
Group Members:
Milo Osterman
Keala Goodell
Joshua Andrews
Ayden DaCosta

Course: CSC337

File: Auth.js

Purpose: Handle login form submissiion
*/
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('login-form').addEventListener('submit', login);
  document.getElementById('register-form').addEventListener('submit', register);

  function login(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Login failed');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        localStorage.setItem('username', data.username);
        window.location.href = 'Homepage.html';
      })
      .catch((error) => {
        console.error('Login error:', error);
        document.getElementById('login-error-message').textContent = 'Invalid credentials';
      });
  }

  function register(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch('/add/user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Registration failed');
        }
        return response.json();
      })
      .then((data) => {
        console.log(data);
        localStorage.setItem('username', data.username);
        window.location.href = 'Homepage.html'; // Redirect to home after registration
      })
      .catch((error) => {
        console.error('Registration error:', error);
       document.getElementById('register-error-message').textContent = 'Registration complete';
      });
  }
});
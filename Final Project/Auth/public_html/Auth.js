// Ayden DaCosta
// This is the authentication process JavaScript

// Handle the login form submission

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
      document.getElementById('login-error-message').textContent = error.message;
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
      document.getElementById('register-error-message').textContent = error.message;
    });
}


});
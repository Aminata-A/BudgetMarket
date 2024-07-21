// Exemple de vérification de l'état de l'utilisateur
let isLoggedIn = false; // Modifier cette variable pour simuler l'état de connexion

const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

function updateNav() {
  if (isLoggedIn) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
  }
}

// Appeler la fonction pour initialiser l'état des boutons
updateNav();

// Simuler la connexion/déconnexion
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  isLoggedIn = true;
  updateNav();
});

logoutBtn.addEventListener('click', (e) => {
  e.preventDefault();
  isLoggedIn = false;
  updateNav();
});
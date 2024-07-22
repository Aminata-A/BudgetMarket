import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://gtcacfzpieqklamuvbup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2FjZnpwaWVxa2xhbXV2YnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTQ2NzksImV4cCI6MjAzNjg5MDY3OX0.sk6pq5hqqrYMshpcgcMtO4yl2TBhFAqHsx1cdWeySSw';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');

  if (!loginBtn || !logoutBtn) {
    console.error('Les boutons loginBtn ou logoutBtn ne sont pas trouvés.');
    return;
  }

  try {
    // Vérifie si un utilisateur est connecté
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erreur lors de la récupération de la session:', error.message);
      return;
    }

    console.log('Session:', session); // Pour vérifier la session récupérée

    if (session) {
      // Utilisateur connecté
      loginBtn.style.display = 'none';
      logoutBtn.style.display = 'block';
    } else {
      // Aucun utilisateur connecté
      loginBtn.style.display = 'block';
      logoutBtn.style.display = 'none';
    }
  } catch (err) {
    console.error('Erreur dans la récupération de la session:', err);
  }

  // Gestion de la déconnexion
  logoutBtn.addEventListener('click', async () => {
    try {
      await supabase.auth.signOut();
      window.location.reload(); // Recharge la page après déconnexion
    } catch (err) {
      console.error('Erreur lors de la déconnexion:', err);
    }
  });
});

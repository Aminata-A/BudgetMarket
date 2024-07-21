import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://gtcacfzpieqklamuvbup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2FjZnpwaWVxa2xhbXV2YnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTQ2NzksImV4cCI6MjAzNjg5MDY3OX0.sk6pq5hqqrYMshpcgcMtO4yl2TBhFAqHsx1cdWeySSw';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signin-form');
  form.addEventListener('submit', handleSignIn);

  async function handleSignIn(event) {
    event.preventDefault();
    clearFieldErrors();
    clearFormError();

    const formData = new FormData(event.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          displayFormError('Identifiants de connexion invalides. Veuillez vérifier votre email et votre mot de passe.');
        } else if (error.message.includes('Email not confirmed')) {
          displayFormError('Votre email n\'a pas été confirmé. Veuillez vérifier votre boîte de réception pour le lien de confirmation.');
        } else {
          displayFormError('Erreur lors de la connexion: ' + error.message);
        }
        return;
      }

      // Connexion réussie, redirection ou autre action
      console.log('Connexion réussie:', data);
      window.location.href = '/shopping/home/home.html'; 
    } catch (error) {
      displayFormError('Une erreur est survenue: ' + error.message);
    }
  }

  function displayFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorSpan = field.nextElementSibling;
    if (errorSpan) {
      errorSpan.textContent = message;
    }
  }

  function clearFieldErrors() {
    const errorSpans = document.querySelectorAll('.form-group .error');
    errorSpans.forEach(span => span.textContent = '');
  }

  function clearFormError() {
    const formError = document.getElementById('form-error');
    if (formError) {
      formError.textContent = '';
      formError.style.display = 'none';
    }
  }

  function displayFormError(message) {
    clearFieldErrors();
    const formError = document.getElementById('form-error');
    if (formError) {
      formError.textContent = message;
      formError.style.display = 'block';
    }
  }
});

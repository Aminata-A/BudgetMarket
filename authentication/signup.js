const supabaseUrl = 'https://gtcacfzpieqklamuvbup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2FjZnpwaWVxa2xhbXV2YnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTQ2NzksImV4cCI6MjAzNjg5MDY3OX0.sk6pq5hqqrYMshpcgcMtO4yl2TBhFAqHsx1cdWeySSw';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('form');
  form.addEventListener('submit', handleSignUp);

  const inputs = form.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      validateField(input);
    });
  });

  async function handleSignUp(event) {
    event.preventDefault();
    clearFieldErrors();
    clearFormError();

    const formData = new FormData(event.target);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Vérification des champs
    if (!validateField(document.getElementById('name')) || 
        !validateField(document.getElementById('email')) || 
        !validateField(document.getElementById('password')) || 
        !validateField(document.getElementById('confirmPassword'))) {
      return;
    }

    // Vérification que les mots de passe correspondent
    if (password !== confirmPassword) {
      displayFieldError('confirmPassword', 'Les mots de passe ne correspondent pas');
      return;
    }

    try {
      // Inscription via Supabase
      const { user, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        displayFormError('Erreur lors de l\'inscription: ' + error.message);
        return;
      }

      // Insertion de l'utilisateur dans la table 'users'
      const { data, insertError } = await supabase.from('users').insert([{ id: user.id, name, email }]);
      if (insertError) {
        displayFormError('Erreur lors de l\'insertion dans la table users: ' + insertError.message);
        return;
      }

      // Redirection après inscription réussie
      console.log('Inscription réussie:', user);
      window.location.href = './signin.html';
    } catch (error) {
      displayFormError('Une erreur est survenue: ' + error.message);
    }
  }

  function validateField(field) {
    let valid = true;
    const value = field.value.trim();
    const errorSpan = field.nextElementSibling;

    switch (field.id) {
      case 'name':
        if (value.length < 3 || value.length > 15) {
          valid = false;
          errorSpan.textContent = 'Nom doit être entre 3 et 15 caractères';
        }
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          valid = false;
          errorSpan.textContent = 'Email invalide';
        }
        break;
      case 'password':
        if (value.length < 8) {
          valid = false;
          errorSpan.textContent = 'Mot de passe doit être au moins 8 caractères';
        }
        break;
      case 'confirmPassword':
        const password = document.getElementById('password').value;
        if (value !== password) {
          valid = false;
          errorSpan.textContent = 'Les mots de passe ne correspondent pas';
        }
        break;
      default:
        break;
    }

    if (valid) {
      errorSpan.textContent = '';
    }
    return valid;
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

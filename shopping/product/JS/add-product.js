import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://gtcacfzpieqklamuvbup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2FjZnpwaWVxa2xhbXV2YnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTQ2NzksImV4cCI6MjAzNjg5MDY3OX0.sk6pq5hqqrYMshpcgcMtO4yl2TBhFAqHsx1cdWeySSw'; // Remplacez par votre clé Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('add-product-form');

    addProductForm.addEventListener('submit', handleAddProduct);

    async function handleAddProduct(event) {
        event.preventDefault();
        clearFormError();

        // Vérifiez si l'utilisateur est connecté
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session Data:', sessionData);
        console.error('Session Error:', sessionError);

        if (sessionError) {
            displayFormError('Erreur lors de la récupération de la session: ' + sessionError.message);
            return;
        }

        const user = sessionData.session?.user;
        if (!user) {
            displayFormError('Vous devez être connecté pour ajouter un produit.');
            return;
        }

        const formData = new FormData(event.target);
        const productName = formData.get('product_name');
        const productPrice = parseFloat(formData.get('product_price'));
        const quantity = parseInt(formData.get('quantity'), 10);
        const date = formData.get('date');
        const userId = user.id; // Utilisez l'ID de l'utilisateur connecté

        const { data, error } = await supabase.from('shopping-list').insert([
            {
                user_id: userId,
                product_name: productName,
                product_price: productPrice,
                quantity: quantity,
                is_purchased: false,
                date: date,
                created_at: new Date().toISOString()
            }
        ]);

        if (error) {
            displayFormError('Erreur lors de l\'ajout du produit: ' + error.message);
        } else {
            displaySuccessMessage('Produit ajouté avec succès!');
            event.target.reset(); 

            // Rediriger l'utilisateur vers la page product.html avec la date spécifiée

            setTimeout(() => {
                window.location.href = `/shopping/product/HTML/product.html?date=${date}`;
            }); 
        }
    }

    function displayFormError(message) {
        const formError = document.getElementById('form-error');
        if (formError) {
            formError.textContent = message;
            formError.style.display = 'block';
        }
    }

    function displaySuccessMessage(message) {
        const successMessage = document.getElementById('form-success');
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            setTimeout(() => successMessage.style.display = 'none', 5000); // Masquer le message après 5 secondes
        }
    }

    function clearFormError() {
        const formError = document.getElementById('form-error');
        if (formError) {
            formError.textContent = '';
            formError.style.display = 'none';
        }
    }
});

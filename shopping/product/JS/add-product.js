// Importation de la bibliothèque Supabase depuis un CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Déclaration de l'URL et de la clé Supabase
const supabaseUrl = 'https://gtcacfzpieqklamuvbup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2FjZnpwaWVxa2xhbXV2YnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTQ2NzksImV4cCI6MjAzNjg5MDY3OX0.sk6pq5hqqrYMshpcgcMtO4yl2TBhFAqHsx1cdWeySSw'; // Remplacez par votre clé Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

// Exécution du code lorsque le document est entièrement chargé
document.addEventListener('DOMContentLoaded', () => {
    const addProductForm = document.getElementById('add-product-form'); // Sélection du formulaire d'ajout de produit

    // Ajout d'un écouteur d'événement pour le formulaire d'ajout de produit
    addProductForm.addEventListener('submit', handleAddProduct);

    // Fonction de gestion de l'ajout de produit
    async function handleAddProduct(event) {
        event.preventDefault(); // Empêche le rechargement de la page à la soumission du formulaire
        clearFormError(); // Efface les messages d'erreur précédents

        // Vérifie si l'utilisateur est connecté en récupérant la session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        console.log('Session Data:', sessionData);
        console.error('Session Error:', sessionError);

        // Affiche une alerte en cas d'erreur de récupération de la session
        if (sessionError) {
            console.error('Erreur lors de la récupération de la session: ' + sessionError.message);
            return;
        }

        const user = sessionData.session?.user; // Récupère l'utilisateur connecté
        // Affiche une alerte si l'utilisateur n'est pas connecté
        if (!user) {
            console.error('Vous devez être connecté pour ajouter un produit.');
            return;
        }

        // Récupère les données du formulaire
        const formData = new FormData(event.target);
        const productName = formData.get('product_name');
        const productPrice = parseFloat(formData.get('product_price'));
        const quantity = parseInt(formData.get('quantity'), 10);
        const date = formData.get('date');
        const userId = user.id; 

        // Vérifie que la date n'est pas antérieure à aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        if (date < today) {
            alert('La date ne peut pas être antérieure à aujourd\'hui.');
            return;
        }

        // Insertion du produit dans la base de données Supabase
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

        // Affiche une erreur si l'insertion échoue
        if (error) {
            displayFormError('Erreur lors de l\'ajout du produit: ' + error.message);
        } else {
            displaySuccessMessage('Produit ajouté avec succès!'); // Affiche un message de succès
            event.target.reset(); // Réinitialise le formulaire

            // Redirige l'utilisateur vers la page product.html avec la date spécifiée
            setTimeout(() => {
                window.location.href = `/shopping/product/HTML/product.html?date=${date}`;
            }, 500); 
        }
    }

    // Fonction d'affichage des erreurs de formulaire
    function displayFormError(message) {
        const formError = document.getElementById('form-error');
        if (formError) {
            formError.textContent = message;
            formError.style.display = 'block';
        }
    }

    // Fonction d'affichage des messages de succès
    function displaySuccessMessage(message) {
        const successMessage = document.getElementById('form-success');
        if (successMessage) {
            successMessage.textContent = message;
            successMessage.style.display = 'block';
            setTimeout(() => successMessage.style.display = 'none', 5000); // Cache le message après 5 secondes
        }
    }

    // Fonction pour effacer les erreurs de formulaire
    function clearFormError() {
        const formError = document.getElementById('form-error');
        if (formError) {
            formError.textContent = '';
            formError.style.display = 'none';
        }
    }
});

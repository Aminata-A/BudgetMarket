// Importation de la bibliothèque Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Définition de l'URL et de la clé d'accès à Supabase
const supabaseUrl = 'https://gtcacfzpieqklamuvbup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2FjZnpwaWVxa2xhbXV2YnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTQ2NzksImV4cCI6MjAzNjg5MDY3OX0.sk6pq5hqqrYMshpcgcMtO4yl2TBhFAqHsx1cdWeySSw';
const supabase = createClient(supabaseUrl, supabaseKey);

// Attendre que le DOM soit chargé avant d'exécuter le code
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // Récupération de la session utilisateur
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError.message);
      return;
    }

    // Si l'utilisateur est connecté, afficher les produits pour aujourd'hui et ajuster les boutons
    if (session && session.user) {
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'inline';
      await loadProductsForToday();
    } else {
      // Sinon, afficher le bouton de connexion et cacher le bouton de déconnexion
      document.getElementById('loginBtn').style.display = 'inline';
      document.getElementById('logoutBtn').style.display = 'none';
    }

    // Ajouter un écouteur d'événements pour le bouton de déconnexion
    document.getElementById('logoutBtn').addEventListener('click', async () => {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Erreur lors de la déconnexion:', signOutError.message);
      } else {
        location.reload();
      }
    });

    // Ajouter des écouteurs d'événements pour les filtres et la recherche
    document.getElementById('filter-date').addEventListener('change', filterProductsByDate);
    document.getElementById('search-input').addEventListener('input', filterProductsBySearch);
    document.getElementById('filter-all').addEventListener('click', () => loadProducts());
    document.getElementById('filter-purchased').addEventListener('click', () => loadProducts(true));
    document.getElementById('filter-pending').addEventListener('click', () => loadProducts(false));
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error.message);
  }
});

// Fonction pour charger les produits du jour actuel
async function loadProductsForToday() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('filter-date').value = today;
  await loadProducts();
}

// Fonction pour charger les produits en fonction de la date et du filtre
async function loadProducts(filter = null) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError.message);
      return;
    }

    if (!session || !session.user) {
      console.error('Aucun utilisateur connecté pour charger les produits');
      return;
    }

    const filterDate = document.getElementById('filter-date').value;

    let query = supabase
      .from('shopping-list')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', filterDate)
      .order('date', { ascending: true });

    if (filter !== null) {
      query = query.eq('is_purchased', filter);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Erreur lors du chargement des produits:', error.message);
    } else {
      renderProducts(products, filter !== null ? (filter ? 'purchased' : 'pending') : null);
    }
  } catch (error) {
    console.error('Erreur lors du chargement des produits:', error.message);
  }
}

// Fonction pour afficher les produits sur la page
function renderProducts(products, filterType = null) {
  const productList = document.getElementById('product-list');
  const noProductsMessage = document.getElementById('no-products-message');
  const filterButtons = document.getElementById('filter-buttons');
  const noProductsText = document.getElementById('no-products-text');
  productList.innerHTML = '';

  if (products.length === 0) {
    noProductsMessage.style.display = 'block';
    filterButtons.style.display = 'block';

    if (filterType === 'purchased') {
      noProductsText.innerText = "Il n'y a pas de produits achetés.";
    } else if (filterType === 'pending') {
      noProductsText.innerText = "Il n'y a pas de produits en attente.";
    } else {
      noProductsText.innerText = "Aujourd'hui, vous n'avez pas de courses à faire.";
    }
  } else {
    noProductsMessage.style.display = 'none';
    filterButtons.style.display = 'block';
    products.forEach(product => {
      const card = document.createElement('div');
      card.className = 'col-md-4 col-lg-3 mb-4';
      card.innerHTML = `
        <div class="card">
          <div class="text-center mt-2">
            <h4>${product.product_name}</h4>
          </div>
          <div class="card-body">
            <div class="d-flex justify-content-between ">
              <strong>Prix:</strong>
              <span>${product.product_price} Fcfa</span>
            </div>
            <div class="d-flex justify-content-between">
              <strong>Date:</strong>
              <span>${new Date(product.date).toLocaleDateString()}</span>
            </div>
            <div class="d-flex justify-content-between">
              <strong>Quantité:</strong>
              <span>${product.quantity}</span>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <button class="btn ${product.is_purchased ? 'btn-secondary' : 'btn-success'} purchase-button" data-id="${product.id}">
                ${product.is_purchased ? 'Acheté' : 'Acheter'}
              </button>
              <div class="d-flex">
                <button class="btn btn-light modify-button" data-id="${product.id}"><i class="fas fa-pencil-alt"></i></button>
                <button class="btn btn-light text-danger delete-button" data-id="${product.id}"><i class="fas fa-trash"></i></button>
              </div>
            </div>
            <hr>
            <div class="text-end">
              <strong>Total:</strong> ${(product.product_price * product.quantity).toFixed(2)} Fcfa
            </div>
          </div>
        </div>
      `;
      productList.appendChild(card);
    });

    // Attacher les gestionnaires d'événements après le rendu des produits
    attachEventListeners();
  }
}

// Fonction pour filtrer les produits par date
async function filterProductsByDate() {
  await loadProducts();
}

// Fonction pour filtrer les produits par recherche
async function filterProductsBySearch() {
  const searchInput = document.getElementById('search-input').value.toLowerCase();
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError.message);
      return;
    }

    if (!session || !session.user) {
      console.error('Aucun utilisateur connecté pour filtrer les produits');
      return;
    }

    const filterDate = document.getElementById('filter-date').value;

    const { data: products, error } = await supabase
      .from('shopping-list')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('date', filterDate)
      .ilike('product_name', `%${searchInput}%`);

    if (error) {
      console.error('Erreur lors du filtrage des produits par recherche:', error.message);
    } else {
      renderProducts(products);
    }
  } catch (error) {
    console.error('Erreur lors du filtrage des produits par recherche:', error.message);
  }
}

// Fonction pour attacher les gestionnaires d'événements aux boutons après le rendu des produits
function attachEventListeners() {
  // Événement pour le bouton "Modifier"
  document.querySelectorAll('.modify-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = event.currentTarget.getAttribute('data-id');
      await openModifyPopup(productId);
    });
  });

  // Événement pour le bouton "Supprimer"
  document.querySelectorAll('.delete-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = event.currentTarget.getAttribute('data-id');
      await deleteProduct(productId);
    });
  });

  // Événement pour le bouton "Acheter"
  document.querySelectorAll('.purchase-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = event.currentTarget.getAttribute('data-id');
      await purchaseProduct(productId);
    });
  });
}

// Fonction pour ouvrir la popup de modification
async function openModifyPopup(productId) {
  const modifyPopup = document.getElementById('modify-popup');
  const modifyForm = document.getElementById('modify-form');

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError.message);
      return;
    }

    if (!session || !session.user) {
      console.error('Aucun utilisateur connecté pour modifier le produit');
      return;
    }

    const { data: product, error } = await supabase
      .from('shopping-list')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du produit à modifier:', error.message);
    } else {
      // Pré-remplir le formulaire de modification avec les données du produit
      modifyForm['modify-name'].value = product.product_name;
      modifyForm['modify-price'].value = product.product_price;
      modifyForm['modify-quantity'].value = product.quantity;
      modifyForm['modify-date'].value = product.date;
      modifyForm['product-id'].value = product.id;

      // Afficher la popup
      modifyPopup.classList.add('show');
    }
  } catch (error) {
    console.error('Erreur lors de l\'ouverture de la popup de modification:', error.message);
  }
}

// Fonction pour fermer la popup de modification
function closeModifyPopup() {
  const modifyPopup = document.getElementById('modify-popup');
  modifyPopup.classList.remove('show');
}

// Fonction pour mettre à jour le produit modifié
async function updateProduct(event) {
  event.preventDefault();

  const modifyForm = document.getElementById('modify-form');
  const productId = modifyForm['product-id'].value;
  const updatedProduct = {
    product_name: modifyForm['modify-name'].value,
    product_price: parseFloat(modifyForm['modify-price'].value),
    quantity: parseInt(modifyForm['modify-quantity'].value, 10),
    date: modifyForm['modify-date'].value,
  };

  try {
    const { error } = await supabase
      .from('shopping-list')
      .update(updatedProduct)
      .eq('id', productId);

    if (error) {
      console.error('Erreur lors de la mise à jour du produit:', error.message);
    } else {
      closeModifyPopup();
      await loadProducts();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error.message);
  }
}

// Fonction pour supprimer un produit
async function deleteProduct(productId) {
  if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
    try {
      const { error } = await supabase
        .from('shopping-list')
        .delete()
        .eq('id', productId);

      if (error) {
        console.error('Erreur lors de la suppression du produit:', error.message);
      } else {
        await loadProducts();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du produit:', error.message);
    }
  }
}

// Fonction pour marquer un produit comme acheté
async function purchaseProduct(productId) {
  try {
    const { error } = await supabase
      .from('shopping-list')
      .update({ is_purchased: true })
      .eq('id', productId);

    if (error) {
      console.error('Erreur lors de la mise à jour du produit comme acheté:', error.message);
    } else {
      await loadProducts();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit comme acheté:', error.message);
  }
}

// Ajouter un écouteur d'événement pour le formulaire de modification
document.getElementById('modify-form').addEventListener('submit', updateProduct);
document.getElementById('modify-popup-close').addEventListener('click', closeModifyPopup);

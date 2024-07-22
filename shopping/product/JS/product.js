// Importation de la bibliothèque Supabase depuis un CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Déclaration de l'URL et de la clé Supabase
const supabaseUrl = 'https://gtcacfzpieqklamuvbup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2FjZnpwaWVxa2xhbXV2YnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTQ2NzksImV4cCI6MjAzNjg5MDY3OX0.sk6pq5hqqrYMshpcgcMtO4yl2TBhFAqHsx1cdWeySSw'; // Remplacez par votre clé Supabase
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
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const filterDate = document.getElementById('filter-date');
    const searchInput = document.getElementById('search-input');
    const filterAll = document.getElementById('filter-all');
    const filterPurchased = document.getElementById('filter-purchased');
    const filterPending = document.getElementById('filter-pending');
    
    if (loginBtn && logoutBtn) {
      if (session && session.user) {
        loginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline';
        await loadProductsForToday();
      } else {
        loginBtn.style.display = 'inline';
        logoutBtn.style.display = 'none';
      }
      
      logoutBtn.addEventListener('click', async () => {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
          console.error('Erreur lors de la déconnexion:', signOutError.message);
        } else {
          window.location.href = '/Authentication/signin.html';
        }
      });
    }
    
    if (filterDate) filterDate.addEventListener('change', filterProductsByDate);
    if (searchInput) searchInput.addEventListener('input', filterProductsBySearch);
    if (filterAll) filterAll.addEventListener('click', () => loadProducts());
    if (filterPurchased) filterPurchased.addEventListener('click', () => loadProducts(true));
    if (filterPending) filterPending.addEventListener('click', () => loadProducts(false));
    
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error.message);
  }
});

// Fonction pour charger les produits du jour actuel
async function loadProductsForToday() {
  const today = new Date().toISOString().split('T')[0];
  const filterDate = document.getElementById('filter-date');
  if (filterDate) filterDate.value = today;
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
    
    const filterDate = document.getElementById('filter-date') ? document.getElementById('filter-date').value : '';
    
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

// Fonction pour afficher les produits
function renderProducts(products, filterType = null) {
  const productList = document.getElementById('product-list');
  const noProductsMessage = document.getElementById('no-products-message');
  const noProductsText = document.getElementById('no-products-text');
  
  if (productList) productList.innerHTML = '';
  
  if (products.length === 0) {
    if (noProductsMessage) noProductsMessage.style.display = 'block';
    
    if (noProductsText) {
      if (filterType === 'purchased') {
        noProductsText.innerText = "Il n'y a pas de produits achetés.";
      } else if (filterType === 'pending') {
        noProductsText.innerText = "Il n'y a pas de produits non achetés.";
      } else {
        noProductsText.innerText = "Aujourd'hui, vous n'avez pas de courses à faire.";
      }
    }
  } else {
    if (noProductsMessage) noProductsMessage.style.display = 'none';
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
                <button class="btn btn-light modify-button ${product.is_purchased ? 'disabled' : ''}" data-id="${product.id}" ${product.is_purchased ? 'disabled' : ''}><i class="fas fa-pencil-alt"></i></button>
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
      if (productList) productList.appendChild(card);
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
  const searchInput = document.getElementById('search-input') ? document.getElementById('search-input').value.toLowerCase() : '';
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
    
    const filterDate = document.getElementById('filter-date') ? document.getElementById('filter-date').value : '';
    
    const { data: products, error } = await supabase
    .from('shopping-list')
    .select('*')
    .eq('user_id', session.user.id)
    .eq('date', filterDate)
    .ilike('product_name', `%${searchInput}%`)
    .order('date', { ascending: true });
    
    if (error) {
      console.error('Erreur lors du filtrage des produits:', error.message);
    } else {
      renderProducts(products);
    }
  } catch (error) {
    console.error('Erreur lors du filtrage des produits:', error.message);
  }
}

// Fonction pour attacher les gestionnaires d'événements aux boutons de produit
function attachEventListeners() {
  const modifyButtons = document.querySelectorAll('.modify-button');
  const deleteButtons = document.querySelectorAll('.delete-button');
  const purchaseButtons = document.querySelectorAll('.purchase-button');

  modifyButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const productId = e.target.dataset.id;
      try {
        const { data: product, error } = await supabase
        .from('shopping-list')
        .select('*')
        .eq('id', productId)
        .single();

        if (error) {
          console.error('Erreur lors de la récupération du produit pour modification:', error.message);
        } else {
          populateEditForm(product);
          const editProductModal = new bootstrap.Modal(document.getElementById('editProductModal'));
          editProductModal.show();
        }
      } catch (error) {
        console.error('Erreur lors de l\'ouverture du modal de modification:', error.message);
      }
    });
  });

  deleteButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const productId = e.target.dataset.id;
      if (confirm('Êtes-vous sûr de vouloir supprimer ce produit?')) {
        try {
          const { error } = await supabase
          .from('shopping-list')
          .delete()
          .eq('id', productId);

          if (error) {
            console.error('Erreur lors de la suppression du produit:', error.message);
          } else {
            loadProducts();
          }
        } catch (error) {
          console.error('Erreur lors de la suppression du produit:', error.message);
        }
      }
    });
  });

  purchaseButtons.forEach(button => {
    button.addEventListener('click', async (e) => {
      const productId = e.target.dataset.id;
      try {
        const { data: product, error } = await supabase
        .from('shopping-list')
        .select('*')
        .eq('id', productId)
        .single();

        if (error) {
          console.error('Erreur lors de la récupération du produit:', error.message);
        } else {
          const newStatus = !product.is_purchased;
          const { error: updateError } = await supabase
          .from('shopping-list')
          .update({ is_purchased: newStatus })
          .eq('id', productId);

          if (updateError) {
            console.error('Erreur lors de la mise à jour du statut du produit:', updateError.message);
          } else {
            loadProducts();
          }
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour du statut du produit:', error.message);
      }
    });
  });
}

// Fonction pour pré-remplir le formulaire d'édition
function populateEditForm(product) {
  document.getElementById('product-id').value = product.id;
  document.getElementById('product-name').value = product.product_name;
  document.getElementById('product-price').value = product.product_price;
  document.getElementById('product-quantity').value = product.quantity;
  document.getElementById('product-date').value = product.date;
}

// Gestion de la soumission du formulaire d'édition
document.getElementById('editProductForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const productId = document.getElementById('product-id').value;
  const productName = document.getElementById('product-name').value;
  const productPrice = parseFloat(document.getElementById('product-price').value);
  const productQuantity = parseInt(document.getElementById('product-quantity').value);
  const productDate = document.getElementById('product-date').value;

  try {
    const { error } = await supabase
    .from('shopping-list')
    .update({
      product_name: productName,
      product_price: productPrice,
      quantity: productQuantity,
      date: productDate
    })
    .eq('id', productId);

    if (error) {
      console.error('Erreur lors de la mise à jour du produit:', error.message);
    } else {
      const editProductModal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
      if (editProductModal) editProductModal.hide();
      loadProducts();
    }
  } catch (error) {
    console.error('Erreur lors de la soumission du formulaire d\'édition:', error.message);
  }
});

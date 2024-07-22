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
          location.reload();
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

function renderProducts(products, filterType = null) {
  const productList = document.getElementById('product-list');
  const noProductsMessage = document.getElementById('no-products-message');
  const filterButtons = document.getElementById('filter-buttons');
  const noProductsText = document.getElementById('no-products-text');
  if (productList) productList.innerHTML = '';

  if (products.length === 0) {
    if (noProductsMessage) noProductsMessage.style.display = 'block';
    if (filterButtons) filterButtons.style.display = 'block';

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
    if (filterButtons) filterButtons.style.display = 'block';
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

// Fonction pour gérer l'achat ou la suppression d'un produit
async function handleProductAction(event) {
  const button = event.target.closest('button');
  if (!button) return;

  const productId = button.getAttribute('data-id');
  if (!productId) return;

  if (button.classList.contains('purchase-button')) {
    await togglePurchaseStatus(productId);
  } else if (button.classList.contains('delete-button')) {
    await deleteProduct(productId);
  } else if (button.classList.contains('modify-button')) {
    await openModifyPopup(productId);
  }
}


// Fonction pour modifier un produit
// Fonction pour ouvrir la popup de modification
async function openModifyPopup(productId) {
  const modifyPopup = new bootstrap.Modal(document.getElementById('editProductModal'));

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
      document.getElementById('editProductName').value = product.product_name;
      document.getElementById('editProductPrice').value = product.product_price;
      document.getElementById('editProductQuantity').value = product.quantity;
      document.getElementById('editProductDate').value = product.date;
      document.getElementById('editProductId').value = product.id;

      // Afficher le modal
      modifyPopup.show();
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

// Fonction pour sauvegarder les modifications du produit
async function saveProductChanges(event) {
  event.preventDefault();
  const modifyForm = document.getElementById('modify-form');

  if (!modifyForm) {
    console.error('Formulaire de modification introuvable');
    return;
  }

  const productId = modifyForm['product-id'].value;
  const name = modifyForm['modify-name'].value;
  const price = parseFloat(modifyForm['modify-price'].value);
  const quantity = parseInt(modifyForm['modify-quantity'].value, 10);
  const date = modifyForm['modify-date'].value;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError.message);
      return;
    }

    if (!session || !session.user) {
      console.error('Aucun utilisateur connecté pour sauvegarder les modifications');
      return;
    }

    const { error } = await supabase
      .from('shopping-list')
      .update({
        product_name: name,
        product_price: price,
        quantity: quantity,
        date: date,
      })
      .eq('user_id', session.user.id)
      .eq('id', productId);

    if (error) {
      console.error('Erreur lors de la sauvegarde des modifications:', error.message);
    } else {
      document.getElementById('modify-popup').classList.remove('show');
      await loadProducts();
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des modifications:', error.message);
  }
}

// Fonction pour supprimer un produit
async function deleteProduct(productId) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError.message);
      return;
    }

    if (!session || !session.user) {
      console.error('Aucun utilisateur connecté pour supprimer le produit');
      return;
    }

    const { error } = await supabase
      .from('shopping-list')
      .delete()
      .eq('user_id', session.user.id)
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

// Fonction pour basculer le statut d'achat d'un produit
async function togglePurchaseStatus(productId) {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError.message);
      return;
    }

    if (!session || !session.user) {
      console.error('Aucun utilisateur connecté pour modifier le statut d\'achat du produit');
      return;
    }

    const { data: product, error: productError } = await supabase
      .from('shopping-list')
      .select('*')
      .eq('user_id', session.user.id)
      .eq('id', productId)
      .single();

    if (productError) {
      console.error('Erreur lors de la récupération du produit:', productError.message);
      return;
    }

    const newStatus = !product.is_purchased;

    const { error: updateError } = await supabase
      .from('shopping-list')
      .update({ is_purchased: newStatus })
      .eq('user_id', session.user.id)
      .eq('id', productId);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du statut d\'achat:', updateError.message);
    } else {
      await loadProducts();
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut d\'achat:', error.message);
  }
}

// Attacher les gestionnaires d'événements aux boutons
function attachEventListeners() {
  const purchaseButtons = document.querySelectorAll('.purchase-button');
  const modifyButtons = document.querySelectorAll('.modify-button');
  const deleteButtons = document.querySelectorAll('.delete-button');

  purchaseButtons.forEach(button => button.addEventListener('click', handleProductAction));
  modifyButtons.forEach(button => button.addEventListener('click', handleProductAction));
  deleteButtons.forEach(button => button.addEventListener('click', handleProductAction));

  const modifyPopupClose = document.getElementById('modify-popup-close');
  const modifyForm = document.getElementById('modify-form');

  if (modifyPopupClose) modifyPopupClose.addEventListener('click', () => {
    const modifyPopup = document.getElementById('modify-popup');
    if (modifyPopup) modifyPopup.classList.remove('show');
  });

  if (modifyForm) modifyForm.addEventListener('submit', saveProductChanges);
}

// Initialiser les gestionnaires d'événements au chargement du DOM
attachEventListeners();

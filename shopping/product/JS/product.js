import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://gtcacfzpieqklamuvbup.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0Y2FjZnpwaWVxa2xhbXV2YnVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjEzMTQ2NzksImV4cCI6MjAzNjg5MDY3OX0.sk6pq5hqqrYMshpcgcMtO4yl2TBhFAqHsx1cdWeySSw';
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Erreur lors de la récupération de la session:', sessionError.message);
      return;
    }

    if (session && session.user) {
      document.getElementById('loginBtn').style.display = 'none';
      document.getElementById('logoutBtn').style.display = 'inline';
      await loadProductsForToday();
    } else {
      document.getElementById('loginBtn').style.display = 'inline';
      document.getElementById('logoutBtn').style.display = 'none';
    }

    document.getElementById('logoutBtn').addEventListener('click', async () => {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Erreur lors de la déconnexion:', signOutError.message);
      } else {
        location.reload();
      }
    });

    document.getElementById('filter-date').addEventListener('change', filterProductsByDate);
    document.getElementById('search-input').addEventListener('input', filterProductsBySearch);
    document.getElementById('filter-all').addEventListener('click', () => loadProducts());
    document.getElementById('filter-purchased').addEventListener('click', () => loadProducts(true));
    document.getElementById('filter-pending').addEventListener('click', () => loadProducts(false));
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error.message);
  }
});

async function loadProductsForToday() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('filter-date').value = today;
  await loadProducts();
}

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

async function filterProductsByDate() {
  await loadProducts();
}

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
      if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
        await deleteProduct(productId);
      }
    });
  });

  // Événement pour le bouton "Acheter"
  document.querySelectorAll('.purchase-button').forEach(button => {
    button.addEventListener('click', async (event) => {
      const productId = event.currentTarget.getAttribute('data-id');
      await togglePurchaseStatus(productId);
    });
  });
}

async function openModifyPopup(productId) {
  const { data: product, error } = await supabase
    .from('shopping-list')
    .select('*')
    .eq('id', productId)
    .single();

  if (error) {
    console.error('Erreur lors de la récupération du produit pour modification:', error.message);
    return;
  }

  const modal = new bootstrap.Modal(document.getElementById('editProductModal'));
  document.getElementById('editProductId').value = productId;
  document.getElementById('editProductName').value = product.product_name;
  document.getElementById('editProductPrice').value = product.product_price;
  document.getElementById('editProductDate').value = product.date;
  document.getElementById('editProductQuantity').value = product.quantity;

  modal.show();
}

document.getElementById('editProductForm').addEventListener('submit', async (event) => {
  event.preventDefault();
  
  const productId = document.getElementById('editProductId').value;
  const productName = document.getElementById('editProductName').value;
  const productPrice = document.getElementById('editProductPrice').value;
  const productDate = document.getElementById('editProductDate').value;
  const productQuantity = document.getElementById('editProductQuantity').value;

  try {
    const { error } = await supabase
      .from('shopping-list')
      .update({ product_name: productName, product_price: productPrice, date: productDate, quantity: productQuantity })
      .eq('id', productId);

    if (error) {
      console.error('Erreur lors de la mise à jour du produit:', error.message);
    } else {
      const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
      modal.hide();
      await loadProducts(); // Recharger les produits après modification
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du produit:', error.message);
  }
});

async function deleteProduct(productId) {
  try {
    const { error } = await supabase
      .from('shopping-list')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('Erreur lors de la suppression du produit:', error.message);
    } else {
      await loadProducts(); // Recharger les produits après suppression
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du produit:', error.message);
  }
}

async function togglePurchaseStatus(productId) {
  try {
    const { data: product, error } = await supabase
      .from('shopping-list')
      .select('is_purchased')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération du produit:', error.message);
      return;
    }

    const newStatus = !product.is_purchased;
    const { error: updateError } = await supabase
      .from('shopping-list')
      .update({ is_purchased: newStatus })
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

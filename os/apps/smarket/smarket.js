const searchInput = document.querySelector('#searchInput');
const categoryFilter = document.querySelector('#categoryFilter');
const sortFilter = document.querySelector('#sortFilter');
const productGrid = document.querySelector('#productGrid');
const cartItems = document.querySelector('#cartItems');
const cartCount = document.querySelector('#cartCount');
const subtotal = document.querySelector('#subtotal');
const shipping = document.querySelector('#shipping');
const total = document.querySelector('#total');
const cartStatus = document.querySelector('#cartStatus');
const clearCartBtn = document.querySelector('#clearCartBtn');
const checkoutBtn = document.querySelector('#checkoutBtn');

const CART_KEY = 'smarket_cart_v1';

const products = [
  {
    id: 'sm-cam-01',
    name: '4K Smart Security Camera',
    category: 'smart-home',
    brand: 'Nexa Home',
    price: 89.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sm-drone-01',
    name: 'Aerial Survey Drone Pro',
    category: 'electronics',
    brand: 'SkyAxis',
    price: 349.0,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sm-lab-01',
    name: 'IoT Sensor Starter Kit',
    category: 'lab-tools',
    brand: 'LabForge',
    price: 129.5,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sm-watch-01',
    name: 'PulseFit Smartwatch',
    category: 'wearables',
    brand: 'PulseFit',
    price: 159.99,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sm-hub-01',
    name: 'Voice Control Home Hub',
    category: 'smart-home',
    brand: 'HomeNet',
    price: 74.0,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sm-robot-01',
    name: 'Desktop Robotics Arm',
    category: 'lab-tools',
    brand: 'RoboWorks',
    price: 289.99,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1561144257-e32e8efc6c4f?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sm-headset-01',
    name: 'Noise-Canceling Headset',
    category: 'electronics',
    brand: 'AudioGrid',
    price: 119.99,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'sm-energy-01',
    name: 'Smart Energy Monitor',
    category: 'smart-home',
    brand: 'GridSense',
    price: 99.49,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=900&q=80'
  }
];

const money = (value) => `$${value.toFixed(2)}`;

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveCart = () => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

let cart = loadCart();

function getFilteredProducts() {
  const query = (searchInput.value || '').trim().toLowerCase();
  const category = categoryFilter.value;

  let list = products.filter((item) => {
    const haystack = `${item.name} ${item.brand} ${item.category}`.toLowerCase();
    const matchesQuery = query.length === 0 || haystack.includes(query);
    const matchesCategory = category === 'all' || item.category === category;
    return matchesQuery && matchesCategory;
  });

  const sort = sortFilter.value;
  if (sort === 'price-low') {
    list.sort((a, b) => a.price - b.price);
  } else if (sort === 'price-high') {
    list.sort((a, b) => b.price - a.price);
  } else if (sort === 'rating') {
    list.sort((a, b) => b.rating - a.rating);
  }

  return list;
}

function renderProducts() {
  const list = getFilteredProducts();
  productGrid.innerHTML = '';

  if (list.length === 0) {
    productGrid.innerHTML = '<div class="empty">No products match your search.</div>';
    return;
  }

  for (const item of list) {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image" style="background-image:url('${item.image}')"></div>
      <h3 class="product-title">${item.name}</h3>
      <p class="product-meta">${item.brand} · ${item.category.replace('-', ' ')}</p>
      <p class="rating">Rating: ${item.rating} / 5</p>
      <div class="price-row">
        <strong class="price">${money(item.price)}</strong>
        <button type="button" class="add-btn" data-id="${item.id}">Add to cart</button>
      </div>
    `;
    productGrid.appendChild(card);
  }
}

function renderCart() {
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty">Your cart is empty.</div>';
  } else {
    for (const entry of cart) {
      const row = document.createElement('article');
      row.className = 'cart-item';
      row.innerHTML = `
        <p><strong>${entry.name}</strong></p>
        <div class="line"><span>Qty: ${entry.qty}</span><span>${money(entry.price * entry.qty)}</span></div>
      `;
      cartItems.appendChild(row);
    }
  }

  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const sub = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const ship = sub > 0 ? (sub >= 100 ? 0 : 8.99) : 0;
  const grand = sub + ship;

  cartCount.textContent = String(itemCount);
  subtotal.textContent = money(sub);
  shipping.textContent = money(ship);
  total.textContent = money(grand);
}

function addToCart(id) {
  const product = products.find((item) => item.id === id);
  if (!product) return;

  const inCart = cart.find((item) => item.id === id);
  if (inCart) {
    inCart.qty += 1;
  } else {
    cart.unshift({ id: product.id, name: product.name, price: product.price, qty: 1 });
  }

  saveCart();
  renderCart();
  cartStatus.textContent = `${product.name} added to your cart.`;
}

function clearCart() {
  cart = [];
  saveCart();
  renderCart();
  cartStatus.textContent = 'Cart cleared.';
}

searchInput.addEventListener('input', renderProducts);
categoryFilter.addEventListener('change', renderProducts);
sortFilter.addEventListener('change', renderProducts);

productGrid.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]');
  if (!button) return;
  addToCart(button.dataset.id);
});

clearCartBtn.addEventListener('click', clearCart);

checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    cartStatus.textContent = 'Your cart is empty. Add items before checkout.';
    return;
  }
  const totalValue = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  cartStatus.textContent = `Order placed for ${money(totalValue)}. Demo checkout successful.`;
  clearCart();
});

renderProducts();
renderCart();

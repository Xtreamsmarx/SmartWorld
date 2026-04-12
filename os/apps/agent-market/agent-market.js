const marketGrid = document.querySelector('#marketGrid');
const ownedAgents = document.querySelector('#ownedAgents');
const walletBalance = document.querySelector('#walletBalance');
const marketVolume = document.querySelector('#marketVolume');
const marketCount = document.querySelector('#marketCount');
const ownedCount = document.querySelector('#ownedCount');
const searchInput = document.querySelector('#searchInput');
const categoryFilter = document.querySelector('#categoryFilter');
const priceFilter = document.querySelector('#priceFilter');
const fundWalletBtn = document.querySelector('#fundWalletBtn');
const publishAgentBtn = document.querySelector('#publishAgentBtn');
const sellStatus = document.querySelector('#sellStatus');

const sellName = document.querySelector('#sellName');
const sellCategory = document.querySelector('#sellCategory');
const sellPrice = document.querySelector('#sellPrice');
const sellCreator = document.querySelector('#sellCreator');
const sellTags = document.querySelector('#sellTags');
const sellDescription = document.querySelector('#sellDescription');

const STORAGE_KEYS = {
  wallet: 'und_agent_market_wallet',
  purchases: 'und_agent_market_purchases',
  listings: 'und_agent_market_custom_listings',
};

const SEED_LISTINGS = [
  {
    id: 'study-buddy-pro',
    icon: '📚',
    name: 'Study Buddy Pro',
    category: 'education',
    creator: 'UND Learning Lab',
    price: 180,
    tags: ['tutoring', 'quizzes', 'notes'],
    description: 'Adaptive tutoring agent for step-by-step explanations, revision plans, and quiz generation.'
  },
  {
    id: 'paper-synth',
    icon: '🧠',
    name: 'Paper Synth',
    category: 'research',
    creator: 'Research Forge',
    price: 320,
    tags: ['papers', 'summaries', 'citations'],
    description: 'Summarizes academic papers, compares methods, and generates literature review outlines.'
  },
  {
    id: 'ops-automator',
    icon: '🏢',
    name: 'Ops Automator',
    category: 'operations',
    creator: 'Campus Systems',
    price: 260,
    tags: ['onboarding', 'support', 'workflow'],
    description: 'Automates onboarding flows, service desk replies, and internal documentation lookup.'
  },
  {
    id: 'prompt-artist',
    icon: '🎨',
    name: 'Prompt Artist',
    category: 'creative',
    creator: 'Studio Nova',
    price: 90,
    tags: ['branding', 'copy', 'design'],
    description: 'Creative ideation agent for campaign concepts, art prompts, and branded voice drafts.'
  },
  {
    id: 'python-debugger',
    icon: '🐍',
    name: 'Python Debugger',
    category: 'productivity',
    creator: 'Code Harbor',
    price: 0,
    tags: ['python', 'debugging', 'stacktrace'],
    description: 'Free troubleshooting agent for common Python errors, quick fixes, and test suggestions.'
  },
  {
    id: 'mentor-match',
    icon: '🧑‍🏫',
    name: 'Mentor Match',
    category: 'education',
    creator: 'UND Faculty Network',
    price: 140,
    tags: ['coaching', 'feedback', 'learning'],
    description: 'Pairs learners with mentor-style AI responses tuned for steady progress and confidence.'
  }
];

const loadJson = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const saveJson = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

let wallet = Number(localStorage.getItem(STORAGE_KEYS.wallet) || 1200);
let purchases = loadJson(STORAGE_KEYS.purchases, []);
let customListings = loadJson(STORAGE_KEYS.listings, []);

const formatCredits = (value) => `${value} credits`;

const getAllListings = () => [...SEED_LISTINGS, ...customListings];

const renderSummary = () => {
  walletBalance.textContent = formatCredits(wallet);
  const listings = getAllListings();
  marketCount.textContent = String(listings.length);
  ownedCount.textContent = String(purchases.length);
  const volume = purchases.reduce((sum, item) => sum + Number(item.price || 0), 0);
  marketVolume.textContent = formatCredits(volume);
};

const renderOwned = () => {
  ownedAgents.innerHTML = '';

  if (purchases.length === 0) {
    ownedAgents.innerHTML = '<div class="empty-state">No owned agents yet. Buy one from the market or publish your own.</div>';
    return;
  }

  for (const item of purchases) {
    const card = document.createElement('article');
    card.className = 'owned-item';
    card.innerHTML = `
      <h3>${item.icon || '🤖'} ${item.name}</h3>
      <p class="agent-meta">Creator: ${item.creator}</p>
      <p class="agent-meta">Category: ${item.category} · Paid: ${formatCredits(item.price || 0)}</p>
    `;
    ownedAgents.appendChild(card);
  }
};

const matchesPrice = (item, filter) => {
  if (filter === 'all') return true;
  if (filter === 'free') return Number(item.price) === 0;
  if (filter === 'paid') return Number(item.price) > 0;
  if (filter === 'premium') return Number(item.price) >= 300;
  return true;
};

const renderMarket = () => {
  const query = (searchInput.value || '').trim().toLowerCase();
  const category = categoryFilter.value;
  const price = priceFilter.value;

  const filtered = getAllListings().filter((item) => {
    const haystack = [item.name, item.creator, item.description, ...(item.tags || [])].join(' ').toLowerCase();
    const queryMatch = query.length === 0 || haystack.includes(query);
    const categoryMatch = category === 'all' || item.category === category;
    return queryMatch && categoryMatch && matchesPrice(item, price);
  });

  marketGrid.innerHTML = '';
  if (filtered.length === 0) {
    marketGrid.innerHTML = '<div class="empty-state">No agents match the current search. Try another tag or publish your own listing.</div>';
    return;
  }

  for (const item of filtered) {
    const owned = purchases.some((purchase) => purchase.id === item.id);
    const affordable = wallet >= Number(item.price || 0);
    const card = document.createElement('article');
    card.className = 'market-item';
    card.innerHTML = `
      <div class="agent-top">
        <div>
          <h3 class="agent-title">${item.icon || '🤖'} ${item.name}</h3>
          <p class="agent-meta">by ${item.creator}</p>
        </div>
        <span class="agent-price">${formatCredits(item.price || 0)}</span>
      </div>
      <div class="badge-row">
        <span class="badge">${item.category}</span>
        ${(item.tags || []).slice(0, 3).map((tag) => `<span class="badge">${tag}</span>`).join('')}
      </div>
      <p class="agent-desc">${item.description}</p>
      <div class="buy-row">
        <span class="agent-meta">${owned ? 'Owned' : affordable ? 'Ready to buy' : 'Need more credits'}</span>
        <button type="button" class="buy-btn" data-id="${item.id}" ${owned ? 'disabled' : ''}>${owned ? 'Owned' : 'Buy Agent'}</button>
      </div>
    `;
    marketGrid.appendChild(card);
  }
};

const persistState = () => {
  localStorage.setItem(STORAGE_KEYS.wallet, String(wallet));
  saveJson(STORAGE_KEYS.purchases, purchases);
  saveJson(STORAGE_KEYS.listings, customListings);
};

const publishListing = () => {
  const name = sellName.value.trim();
  const creator = sellCreator.value.trim();
  const category = sellCategory.value;
  const price = Math.max(0, Number(sellPrice.value || 0));
  const description = sellDescription.value.trim();
  const tags = sellTags.value.split(',').map((tag) => tag.trim()).filter(Boolean);

  if (!name || !creator || !description) {
    sellStatus.textContent = 'Please fill in agent name, seller name, and description.';
    return;
  }

  const listing = {
    id: `custom-${Date.now()}`,
    icon: '🤖',
    name,
    category,
    creator,
    price,
    tags,
    description,
  };

  customListings.unshift(listing);
  persistState();
  renderSummary();
  renderMarket();
  sellStatus.textContent = `${name} is now live in the market for ${formatCredits(price)}.`;
  sellName.value = '';
  sellCreator.value = '';
  sellTags.value = '';
  sellDescription.value = '';
  sellPrice.value = '150';
};

const buyListing = (id) => {
  const listing = getAllListings().find((item) => item.id === id);
  if (!listing) {
    return;
  }
  if (purchases.some((purchase) => purchase.id === id)) {
    return;
  }
  if (wallet < Number(listing.price || 0)) {
    sellStatus.textContent = `Not enough credits to buy ${listing.name}.`;
    return;
  }

  wallet -= Number(listing.price || 0);
  purchases.unshift(listing);
  persistState();
  renderSummary();
  renderOwned();
  renderMarket();
  sellStatus.textContent = `Purchased ${listing.name}. It is now in My Agents.`;
};

fundWalletBtn.addEventListener('click', () => {
  wallet += 500;
  persistState();
  renderSummary();
  renderMarket();
  sellStatus.textContent = 'Added 500 credits to your wallet.';
});

publishAgentBtn.addEventListener('click', publishListing);

marketGrid.addEventListener('click', (event) => {
  const btn = event.target.closest('.buy-btn');
  if (!btn) return;
  buyListing(btn.getAttribute('data-id'));
});

for (const el of [searchInput, categoryFilter, priceFilter]) {
  el.addEventListener('input', renderMarket);
  el.addEventListener('change', renderMarket);
}

renderSummary();
renderOwned();
renderMarket();
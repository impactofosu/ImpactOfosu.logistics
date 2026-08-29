// Marketplace + cart with localStorage and product modal
const productsGrid = document.getElementById('productsGrid');
const cartItemsEl = document.getElementById('cartItems');
const clearCartBtn = document.getElementById('clearCart');
const checkoutBtn = document.getElementById('checkoutBtn');
const sellForm = document.getElementById('sellForm');

// modal elements
const productModal = document.getElementById('productModal');
const modalClose = document.getElementById('modalClose');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalImage = document.getElementById('modalImage');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalPrice = document.getElementById('modalPrice');
const modalAddToCart = document.getElementById('modalAddToCart');

let cart = [];
let products = [
  {
    id: 'p1',
    title: 'Pallet Strapping (Box)',
    price: 120,
    image: 'assets/images/product1.jpg',
    fallback: 'file:///C:/Users/USER/AppData/Roaming/Code/agentSessionData/587878ae-2d67-48ca-b02a-45031c699f35/attachments/f814883f-7050-48eb-8acb-7402ec75c3f9/Modern Logistics Website Design.jpg',
    desc: 'Durable pallet straps for heavy shipments.'
  },
  {
    id: 'p2',
    title: 'Heavy-duty Pallet (120x100)',
    price: 45,
    image: 'assets/images/product2.jpg',
    fallback: 'file:///C:/Users/USER/AppData/Roaming/Code/agentSessionData/587878ae-2d67-48ca-b02a-45031c699f35/attachments/f814883f-7050-48eb-8acb-7402ec75c3f9/Modern Logistics Website Design.jpg',
    desc: 'Wooden pallet suitable for export shipments.'
  },
  {
    id: 'p3',
    title: 'Insurance Add-on (Per Shipment)',
    price: 15,
    image: 'assets/images/product3.jpg',
    fallback: 'file:///C:/Users/USER/AppData/Roaming/Code/agentSessionData/587878ae-2d67-48ca-b02a-45031c699f35/attachments/f814883f-7050-48eb-8acb-7402ec75c3f9/Modern Logistics Website Design.jpg',
    desc: 'Protect your shipment with our insurance plan.'
  }
];

// Storage keys
const PRODUCTS_KEY = 'impact_products_v1';
const CART_KEY = 'impact_cart_v1';

function loadState(){
  try{
    const p = localStorage.getItem(PRODUCTS_KEY);
    if(p) products = JSON.parse(p);
    const c = localStorage.getItem(CART_KEY);
    if(c) cart = JSON.parse(c);
  }catch(e){
    console.warn('Could not load localStorage state', e);
  }
}

function saveState(){
  try{
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }catch(e){
    console.warn('Could not save state', e);
  }
}

function safeImageSrc(p){
  // attempt primary image; if it fails, onerror will swap to fallback
  return p.image || p.fallback || '';
}

function renderProducts(){
  productsGrid.innerHTML = '';
  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'product-card card';
    card.innerHTML = `
      <img src="${safeImageSrc(p)}" alt="${p.title}" data-fallback="${p.fallback || ''}">
      <div class="info">
        <h4>${p.title}</h4>
        <p>${p.desc || ''}</p>
        <div class="price">$${(p.price||0).toFixed(2)}</div>
      </div>
      <div class="card-actions">
        <button class="btn" data-add="${p.id}">Add to Cart</button>
        <button class="btn btn-ghost" data-view="${p.id}">View</button>
      </div>
    `;
    productsGrid.appendChild(card);
  });
  // add listeners
  productsGrid.querySelectorAll('[data-add]').forEach(btn => btn.addEventListener('click', e => {
    const id = e.currentTarget.getAttribute('data-add');
    addToCart(id);
  }));
  productsGrid.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', e => {
    const id = e.currentTarget.getAttribute('data-view');
    const p = products.find(x=>x.id===id);
    if(p) openModal(p);
  }));
  // attach fallback handlers to images
  productsGrid.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', (ev)=>{
      const fb = ev.currentTarget.getAttribute('data-fallback');
      if(fb && ev.currentTarget.src !== fb){
        ev.currentTarget.src = fb;
      }
    });
  });
}

function addToCart(id){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  cart.push({id: p.id, title: p.title, price: p.price});
  renderCart();
  saveState();
}

function renderCart(){
  if(cart.length===0){
    cartItemsEl.innerHTML = 'No items in cart.';
    saveState();
    return;
  }
  const list = document.createElement('div');
  list.innerHTML = cart.map((it, i)=>`<div class="cart-row">${i+1}. ${it.title} — $${(it.price||0).toFixed(2)}</div>`).join('');
  const total = cart.reduce((s,i)=>s+(i.price||0),0);
  list.innerHTML += `<div style="margin-top:8px;font-weight:600">Total: $${total.toFixed(2)}</div>`;
  cartItemsEl.innerHTML = '';
  cartItemsEl.appendChild(list);
  saveState();
}

clearCartBtn.addEventListener('click', ()=>{
  cart = [];
  renderCart();
  saveState();
});

checkoutBtn.addEventListener('click', ()=>{
  if(cart.length===0){
    alert('Your cart is empty.');
    return;
  }
  alert('Checkout simulated. Total: $' + cart.reduce((s,i)=>s+(i.price||0),0).toFixed(2));
  cart = [];
  renderCart();
  saveState();
});

sellForm.addEventListener('submit', e=>{
  e.preventDefault();
  const title = document.getElementById('productTitle').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value) || 0;
  const image = document.getElementById('productImage').value.trim() || '';
  const desc = document.getElementById('productDesc').value.trim();
  const id = 'p' + (Date.now());
  const newP = {id, title, price, image: image || 'assets/images/product-placeholder.jpg', fallback: image ? '' : 'file:///C:/Users/USER/AppData/Roaming/Code/agentSessionData/587878ae-2d67-48ca-b02a-45031c699f35/attachments/f814883f-7050-48eb-8acb-7402ec75c3f9/Modern Logistics Website Design.jpg', desc};
  products.unshift(newP);
  renderProducts();
  saveState();
  sellForm.reset();
  // jump to products
  document.getElementById('products').scrollIntoView({behavior:'smooth'});
});

// modal functions
let lastFocusedElementBeforeModal = null;
function openModal(p){
  // save focus
  lastFocusedElementBeforeModal = document.activeElement;
  modalImage.src = safeImageSrc(p);
  modalImage.setAttribute('data-fallback', p.fallback || '');
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc || '';
  modalPrice.textContent = '$' + ((p.price||0).toFixed(2));
  modalAddToCart.dataset.productId = p.id;
  productModal.classList.remove('hidden');
  document.body.setAttribute('aria-hidden', 'true');
  // focus first focusable element in modal
  modalClose.focus();
  // add key listener for Escape and trap Tab
  document.addEventListener('keydown', handleModalKeydown);
}
function closeModal(){
  productModal.classList.add('hidden');
  document.body.removeAttribute('aria-hidden');
  // restore focus
  if(lastFocusedElementBeforeModal && typeof lastFocusedElementBeforeModal.focus === 'function'){
    lastFocusedElementBeforeModal.focus();
  }
  document.removeEventListener('keydown', handleModalKeydown);
}
modalClose.addEventListener('click', closeModal);
modalCloseBtn.addEventListener('click', closeModal);
modalAddToCart.addEventListener('click', ()=>{
  const id = modalAddToCart.dataset.productId;
  addToCart(id);
  closeModal();
});
// handle modal image fallback
modalImage.addEventListener('error', (e)=>{
  const fb = e.currentTarget.getAttribute('data-fallback');
  if(fb && e.currentTarget.src !== fb){ e.currentTarget.src = fb; }
});

function handleModalKeydown(e){
  if(e.key === 'Escape'){
    e.preventDefault();
    closeModal();
    return;
  }
  if(e.key === 'Tab'){
    // basic focus trap
    const focusable = productModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if(!focusable || focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length -1];
    if(e.shiftKey){
      if(document.activeElement === first){
        e.preventDefault();
        last.focus();
      }
    } else {
      if(document.activeElement === last){
        e.preventDefault();
        first.focus();
      }
    }
  }
}

// hero background fallback, try assets then fallback attachment path
(function ensureHeroBg(){
  const hero = document.querySelector('.hero-bg');
  if(!hero) return;
  const primary = hero.style.backgroundImage.replace(/url\(["']?|["']?\)/g,'');
  const fallback = hero.getAttribute('data-fallback');
  if(!primary || primary === 'none'){
    if(fallback) hero.style.backgroundImage = `url('${fallback}')`;
    return;
  }
  // attempt to pre-load primary; if fails, use fallback
  const img = new Image();
  const url = primary.replace(/(^url\(|\)$|["'])/g, '');
  img.onload = ()=>{};
  img.onerror = ()=>{ if(fallback) hero.style.backgroundImage = `url('${fallback}')`; };
  img.src = url;
})();

// initial load
loadState();
renderProducts();
renderCart();

// small convenience: quote button
const quoteBtn = document.getElementById('quoteBtn');
if(quoteBtn) quoteBtn.addEventListener('click', ()=>{ alert('Request a Quote - contact sales@impactlogistics.example (demo)'); });

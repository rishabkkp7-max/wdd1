(() => {
  'use strict';
  const rupees = value => `₹${Number(value).toFixed(2)}`;
  const grid = document.getElementById('food-grid');
  const chips = document.getElementById('categories');
  const status = document.getElementById('menu-status');
  const cartItems = document.getElementById('cart-items');
  const cartCount = document.getElementById('cart-count');
  const cartLabel = document.getElementById('cart-label');
  const totals = document.getElementById('totals');
  const checkoutForm = document.getElementById('checkout-form');
  const message = document.getElementById('form-message');
  let foods = [];
  let activeCategory = 'all';
  let cart = loadCart();

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem('goodfolk-cart') || '{}');
      return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
    } catch { return {}; }
  }
  function saveCart() { localStorage.setItem('goodfolk-cart', JSON.stringify(cart)); }
  function escapeHtml(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); }

  async function loadMenu() {
    status.textContent = 'Loading today’s menu…';
    try {
      const [categoryResponse, foodResponse] = await Promise.all([fetch('api/get-categories.php'), fetch('api/get-foods.php')]);
      const categories = await categoryResponse.json();
      const menu = await foodResponse.json();
      if (!categories.success || !menu.success) throw new Error('Menu is unavailable.');
      foods = menu.foods;
      chips.innerHTML = '<button class="category-chip active" data-category="all">Everything</button>' + categories.categories.map(category => `<button class="category-chip" data-category="${Number(category.category_id)}">${escapeHtml(category.category_image)} ${escapeHtml(category.category_name)}</button>`).join('');
      renderFoods(); renderCart();
    } catch (error) {
      status.textContent = 'We couldn’t load the menu. Start Apache and MySQL, then refresh this page.';
      grid.innerHTML = '';
    }
  }
  function renderFoods() {
    const shown = activeCategory === 'all' ? foods : foods.filter(food => Number(food.category_id) === Number(activeCategory));
    status.textContent = shown.length ? `${shown.length} good things, made fresh.` : 'No dishes in this category yet.';
    grid.innerHTML = shown.map(food => `<article class="food-card"><div class="food-image"><img src="${escapeHtml(food.image)}" alt="${escapeHtml(food.food_name)}" loading="lazy" onerror="this.src='https://placehold.co/900x600/F0ECE2/526B4C?text=Goodfolk+Kitchen'"><span class="food-tag">${escapeHtml(food.category_name)}</span></div><div class="food-info"><div class="food-meta"><h3>${escapeHtml(food.food_name)}</h3><span class="food-price">${rupees(food.price)}</span></div><p>${escapeHtml(food.description)}</p><button class="add-button" data-add="${Number(food.food_id)}">＋ Add to bag</button></div></article>`).join('');
  }
  chips.addEventListener('click', event => {
    const button = event.target.closest('[data-category]'); if (!button) return;
    activeCategory = button.dataset.category;
    chips.querySelectorAll('.category-chip').forEach(chip => chip.classList.toggle('active', chip === button));
    renderFoods();
  });
  grid.addEventListener('click', event => {
    const button = event.target.closest('[data-add]'); if (!button) return;
    const id = button.dataset.add; cart[id] = Math.min(50, (Number(cart[id]) || 0) + 1); saveCart(); renderCart();
    button.textContent = '✓ Added'; setTimeout(() => { if (button.isConnected) button.textContent = '＋ Add to bag'; }, 850);
  });
  function renderCart() {
    const lines = Object.entries(cart).map(([id, quantity]) => ({ food: foods.find(item => Number(item.food_id) === Number(id)), id, quantity: Number(quantity) })).filter(line => line.food && line.quantity > 0);
    cart = Object.fromEntries(lines.map(line => [line.id, line.quantity])); saveCart();
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    cartCount.textContent = count; cartLabel.textContent = `${count} ${count === 1 ? 'item' : 'items'}`;
    if (!lines.length) {
      cartItems.innerHTML = '<div class="empty-cart">Your bag is taking a little break.<br><a href="#menu">Find something delicious ↗</a></div>';
      totals.hidden = true; return;
    }
    cartItems.innerHTML = lines.map(({food,id,quantity}) => `<div class="cart-row"><div><div class="cart-row-name">${escapeHtml(food.food_name)}</div><div class="cart-row-sub">${rupees(food.price)} each · ${rupees(Number(food.price)*quantity)}</div></div><div class="cart-controls"><button aria-label="Decrease ${escapeHtml(food.food_name)} quantity" data-change="${id}" data-delta="-1">−</button><b>${quantity}</b><button aria-label="Increase ${escapeHtml(food.food_name)} quantity" data-change="${id}" data-delta="1">+</button><button class="remove" aria-label="Remove ${escapeHtml(food.food_name)}" data-remove="${id}">×</button></div></div>`).join('');
    const subtotal = lines.reduce((sum,line) => sum + Number(line.food.price)*line.quantity,0); const gst = subtotal*.05;
    document.getElementById('subtotal').textContent = rupees(subtotal); document.getElementById('gst').textContent = rupees(gst); document.getElementById('grand-total').textContent = rupees(subtotal+gst+30); totals.hidden = false;
  }
  cartItems.addEventListener('click', event => {
    const change = event.target.closest('[data-change]'); const remove = event.target.closest('[data-remove]');
    if (change) { const id=change.dataset.change; cart[id]=Number(cart[id])+Number(change.dataset.delta); if (cart[id]<1) delete cart[id]; if (cart[id]>50) cart[id]=50; }
    if (remove) delete cart[remove.dataset.remove]; saveCart(); renderCart();
  });
  function validateForm(form) {
    let valid = true;
    for (const field of form.querySelectorAll('input[required],textarea[required]')) {
      const error = field.parentElement.querySelector('small'); let text = '';
      if (!field.value.trim()) text = 'This field is required.';
      else if (field.name === 'mobile' && !/^\+?[0-9\s-]{10,16}$/.test(field.value.trim())) text = 'Enter a valid mobile number.';
      else if (field.name === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim())) text = 'Enter a valid email address.';
      else if (field.name === 'pincode' && !/^[0-9]{6}$/.test(field.value.trim())) text = 'Enter a 6-digit pincode.';
      field.classList.toggle('invalid', Boolean(text)); error.textContent = text; if (text) valid = false;
    }
    return valid;
  }
  checkoutForm.addEventListener('input', event => { event.target.classList.remove('invalid'); const small=event.target.parentElement.querySelector('small'); if (small) small.textContent=''; });
  checkoutForm.addEventListener('submit', async event => {
    event.preventDefault(); message.className='form-message'; message.textContent='';
    if (!Object.keys(cart).length) { message.textContent='Add at least one item to your bag first.'; document.getElementById('menu').scrollIntoView({behavior:'smooth'}); return; }
    if (!validateForm(checkoutForm)) { message.textContent='Please check the highlighted details.'; return; }
    const button=document.getElementById('place-order'); button.disabled=true; button.innerHTML='Placing your order…';
    const formData=new FormData(checkoutForm); const customer=Object.fromEntries(formData.entries());
    try {
      const response=await fetch('api/place-order.php',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer,items:Object.entries(cart).map(([food_id,quantity])=>({food_id:Number(food_id),quantity:Number(quantity)}))})});
      const result=await response.json(); if (!response.ok || !result.success) throw new Error(result.message || 'Could not place the order.');
      cart={}; saveCart(); renderCart(); checkoutForm.reset(); message.className='form-message success'; message.textContent='Your order is in! Your invoice is ready below.';
      showInvoice(result.order); document.getElementById('invoice').scrollIntoView({behavior:'smooth',block:'start'});
    } catch(error) { message.textContent=error.message; }
    finally { button.disabled=false; button.innerHTML='Place my order <span>↗</span>'; }
  });
  function invoiceMarkup(order) {
    const rows=order.items.map(item=>`<tr><td>${escapeHtml(item.food_name)}</td><td>${item.quantity}</td><td>${rupees(item.unit_price)}</td><td>${rupees(item.item_total)}</td></tr>`).join('');
    return `<div class="invoice-head"><div><p class="eyebrow">GOODFOLK KITCHEN · ORDER INVOICE</p><h3>That’s a good choice.</h3><p>Order ${escapeHtml(order.order_number)} · Bill ${escapeHtml(order.bill_number)}</p></div><button class="button button-dark invoice-print" onclick="window.print()">Print bill ↗</button></div><p><b>${escapeHtml(order.customer_name || '')}</b> · ${escapeHtml(order.order_datetime)} · Status: ${escapeHtml(order.order_status || 'Received')}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Price</th><th>Amount</th></tr></thead><tbody>${rows}</tbody></table><div class="invoice-totals"><div><span>Subtotal</span><b>${rupees(order.subtotal)}</b></div><div><span>GST (5%)</span><b>${rupees(order.gst_amount)}</b></div><div><span>Delivery</span><b>${rupees(order.delivery_charge)}</b></div><div><strong>Grand total</strong><strong>${rupees(order.grand_total)}</strong></div></div>`;
  }
  function showInvoice(order) { const invoice=document.getElementById('invoice'); invoice.innerHTML=invoiceMarkup(order); invoice.hidden=false; }
  document.getElementById('lookup-form').addEventListener('submit',async event=>{
    event.preventDefault(); const number=document.getElementById('lookup-number').value.trim(); const lookupMessage=document.getElementById('lookup-message'); const invoice=document.getElementById('invoice');
    lookupMessage.textContent='Looking for your order…'; invoice.hidden=true;
    try { const response=await fetch(`api/get-order.php?order_number=${encodeURIComponent(number)}`); const result=await response.json(); if (!response.ok || !result.success) throw new Error(result.message || 'Order lookup failed.'); showInvoice({...result.order,customer_name:result.order.full_name}); lookupMessage.textContent=''; }
    catch(error) { lookupMessage.textContent=error.message; }
  });
  const menuToggle=document.getElementById('menu-toggle'); menuToggle.addEventListener('click',()=>{const nav=document.getElementById('main-nav');const open=nav.classList.toggle('open');menuToggle.setAttribute('aria-expanded',String(open));});
  document.getElementById('main-nav').addEventListener('click',event=>{if(event.target.closest('a')){document.getElementById('main-nav').classList.remove('open');menuToggle.setAttribute('aria-expanded','false');}});
  loadMenu();
})();

import {createCart} from './cart.js';

const D = JSON.parse(document.getElementById('mohana-data').textContent);
const all = [...D.catalog.singles, ...D.catalog.blends, ...D.extras.packs, D.spotlight];
const byHandle = new Map(all.map((p) => [p.handle, p]));
const productDialog = document.getElementById('gm-product');
const cartDialog = document.getElementById('gm-cart');
const toast = document.getElementById('gm-toast');
const emptyCart = {lines: [], totalQuantity: 0, checkoutUrl: null};
const basket = createCart({onChange: updateCart});
const store = 'https://mohana.bg';
let returnFocus;
let previousOverflow = '';
let toastTimer;
let cartMessage = '';
let productRequest = 0;
let catalogKind = 'singles';
let limit = 12;

const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'})[c],
  );
const money = (n) => new Intl.NumberFormat('bg-BG', {style: 'currency', currency: 'EUR'}).format(n);
const displayMoney = (value) => value?.formatted || money(Number(value?.amount) || 0);
const price = (p) =>
  Number(p.selectedOrFirstAvailableVariant?.price.amount || p.priceRange.minVariantPrice.amount);
const minimum = (variant) => Math.max(1, variant?.minimumQuantity || 1);

function type(p) {
  if (D.extras.packs.includes(p)) return 'Промо пакет';
  if (D.catalog.blends.includes(p)) return 'Арома композиция';
  return p === D.spotlight ? 'Арома дифузер' : 'Етерично масло';
}

function announce(text) {
  document.getElementById('gm-announcer').textContent = text;
}

function show(dialog) {
  if (!productDialog.open && !cartDialog.open) {
    returnFocus = document.activeElement;
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }
  if (dialog !== productDialog && productDialog.open) {
    productRequest++;
    productDialog.close();
  }
  if (dialog !== cartDialog && cartDialog.open) cartDialog.close();
  if (!dialog.open) dialog.showModal();
  dialog.scrollTop = 0;
  dialog.querySelector('[data-close]').focus();
}

function close(dialog) {
  if (dialog === productDialog) productRequest++;
  dialog.close();
  if (!productDialog.open && !cartDialog.open) {
    document.body.style.overflow = previousOverflow;
    returnFocus?.focus({preventScroll: true});
  }
}

for (const dialog of [productDialog, cartDialog]) {
  dialog.querySelector('[data-close]').onclick = () => close(dialog);
  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    close(dialog);
  });
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      close(dialog);
  });
}

function showToast(text) {
  toast.hidden = false;
  toast.querySelector('span').textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.hidden = true), 5500);
}
toast.querySelector('[data-toast-close]').onclick = () => (toast.hidden = true);

function productLink(p) {
  return `${store}/product/${encodeURIComponent(p.handle)}`;
}

function requiresProductPage(live) {
  return live?.customizations.some((field) => field.required) ||
    live?.variants.pageInfo.hasNextPage ||
    live?.bundle?.products.some(({product}) =>
      product.customizations.some((field) => field.required) || product.variants.pageInfo.hasNextPage
    );
}

async function addCardProduct(p) {
  const live = await basket.product(p.handle);
  if (!live?.availableForSale) return 'Продуктът е изчерпан.';
  if (requiresProductPage(live)) return 'Отвори подробностите за продукта, за да избереш необходимите опции.';

  const variant = live.selectedOrFirstAvailableVariant;
  if (live.bundle) {
    const ids = live.bundle.products.map(({product}) =>
      product.variants.nodes.find((option) => option.availableForSale)?.id
    );
    if (!ids.length || ids.some((id) => !id)) return 'Комплектът е изчерпан.';
    return basket.change('bundle', live.id, minimum(variant), {variantIds: ids});
  }

  const selected = variant?.availableForSale ? variant : live.variants.nodes.find((option) => option.availableForSale);
  if (!selected) return 'Продуктът е изчерпан.';
  return basket.change('add', selected.id, minimum(selected));
}

// Finish each click before the next one uses or creates the guest cart.
let pendingAdds = Promise.resolve();
function quickAdd(p, button) {
  if (button.disabled) return;
  const label = button.textContent;
  button.disabled = true;
  button.textContent = 'Добавяме…';
  pendingAdds = pendingAdds.then(async () => {
    try {
      const message = await addCardProduct(p);
      showToast(message || '✓ Добавено в количката: ' + p.title);
    } catch {
      showToast('Продуктът не се зареди. Опитай отново.');
    } finally {
      button.disabled = false;
      button.textContent = label;
    }
  });
}

async function openProduct(p) {
  const requestNumber = ++productRequest;
  show(productDialog);
  document.getElementById('gm-product-content').innerHTML =
    `<h2 id="gm-modal-title">${esc(p.title)}</h2><p role="status">Зареждаме продукта…</p>`;
  try {
    const live = await basket.product(p.handle);
    if (requestNumber !== productRequest) return;
    renderProduct(p, live, requiresProductPage(live));
  } catch {
    if (requestNumber !== productRequest) return;
    document.getElementById('gm-product-content').innerHTML = `<h2 id="gm-modal-title">${esc(p.title)}</h2>
      <p role="status">Продуктът не се зареди. Опитай отново.</p>
      <button class="gm-primary" id="gm-retry-product">Опитай отново</button>
      <a class="gm-secondary" target="_top" href="${esc(productLink(p))}">Към продукта в Mohana</a>`;
    document.getElementById('gm-retry-product').onclick = () => openProduct(p);
  }
}

function renderProduct(p, live, productPageRequired, selected = live?.selectedOrFirstAvailableVariant) {
  const parts = live?.bundle?.products ?? [];
  const isBundle = Boolean(live?.bundle);
  const available = Boolean(
    live?.availableForSale &&
    (isBundle
      ? parts.length && parts.every(({product}) => product.variants.nodes.some((v) => v.availableForSale))
      : selected?.availableForSale),
  );
  const variants = live?.variants.nodes ?? [];
  const image = selected?.image?.url || p.featuredImage?.url || p.images?.[0];
  const title = p.title.replace(/(\d) +(мл|ml|мг|mg|кг|kg)(?![\p{L}\p{N}])/giu, '$1\u00a0$2');
  const full = p.descriptionText || '';
  const short = full.split('\n').filter(Boolean).slice(0, 2).join(' ').slice(0, 340);
  const variantPrice = selected?.price;
  const old = selected?.compareAtPrice;
  const content = document.getElementById('gm-product-content');
  content.innerHTML = `<div class="gm-product-grid">
    <div class="gm-product-visual"><span class="gm-modal-kicker">Mohana · Зелен месец</span>
      ${image ? `<img id="gm-main-image" src="${esc(image)}" alt="${esc(p.title)}">` : ''}
    </div>
    <div class="gm-product-copy">
      <p class="gm-modal-kicker">${type(p)}</p><h2 id="gm-modal-title">${esc(title)}</h2>
      <span class="gm-stock ${available ? '' : 'unavailable'}">${available ? 'В наличност' : 'В момента е изчерпан'}</span>
      ${
        variantPrice
          ? `<div class="gm-modal-price">${esc(displayMoney(variantPrice))}
        ${old && Number(old.amount) > Number(variantPrice.amount) ? `<del>${esc(displayMoney(old))}</del>` : ''}</div>`
          : ''
      }
      ${short ? `<p class="gm-summary">${esc(short)}${full.length > 340 ? '…' : ''}</p>` : ''}
      ${
        !isBundle && variants.length > 1
          ? `<label class="gm-modal-label" for="gm-variant">Разфасовка</label>
        <select id="gm-variant" style="display:block;width:100%;padding:12px;border:1px solid #12332930;border-radius:14px;margin:8px 0 16px;background:#fff8">
        ${variants
          .map(
            (v) => `<option value="${esc(v.id)}" ${selected?.id === v.id ? 'selected' : ''}>
          ${esc(v.selectedOptions.map(({value}) => value).join(' · ') || v.sku || 'Стандартна')}
          · ${esc(displayMoney(v.price))}${v.availableForSale ? '' : ' · Изчерпан'}</option>`,
          )
          .join('')}
        </select>`
          : ''
      }
      ${
        productPageRequired
          ? `<a class="gm-primary" target="_top" href="${esc(productLink(p))}">Избери в Mohana →</a>`
          : `${isBundle ? renderBundleParts(parts) : ''}<div class="gm-modal-label">Количество</div><div class="gm-buy"><div class="gm-qty">
          <button id="gm-minus" aria-label="Намали количеството">−</button>
          <input id="gm-quantity" aria-label="Количество" type="number" min="${minimum(selected)}" max="${Math.max(99, minimum(selected))}" step="1" value="${minimum(selected)}">
          <button id="gm-plus" aria-label="Увеличи количеството">+</button></div>
          <button class="gm-primary" id="gm-add" ${available ? '' : 'disabled'}>
            ${available ? 'Добави в количката <span aria-hidden="true">＋</span>' : 'Изчерпан продукт'}
          </button></div>`
      }
      <p class="gm-shipping">Безплатна доставка над 69 €<br>До автомат на BoxNow от 2 €</p>
      <div id="gm-added" role="status"></div>
      ${full ? `<details class="gm-detail"><summary>Описание и състав</summary><p>${esc(full)}</p></details>` : ''}
      <details class="gm-detail"><summary>Доставка и плащане</summary><p>Безплатна доставка за поръчки над 69 €. До автомат на BoxNow: 2 € до 1 кг и 2,60 € до 2 кг. Крайните условия и начините на плащане се потвърждават при завършване на поръчката.</p></details>
      ${selected?.sku ? `<p class="gm-cart-note">Код: ${esc(selected.sku)}</p>` : ''}
    </div></div>`;

  const selector = content.querySelector('#gm-variant');
  if (selector)
    selector.onchange = () => {
      renderProduct(
        p,
        live,
        productPageRequired,
        variants.find((v) => v.id === selector.value),
      );
      document.getElementById('gm-variant').focus();
    };

  const input = content.querySelector('#gm-quantity');
  const button = content.querySelector('#gm-add');
  if (!button || !input) return;
  const valid = (value) =>
    Math.max(Number(input.min), Math.min(Number(input.max), Math.floor(Number(value) || Number(input.min))));
  input.onchange = () => (input.value = valid(input.value));
  content.querySelector('#gm-minus').onclick = () => (input.value = valid(Number(input.value) - 1));
  content.querySelector('#gm-plus').onclick = () => (input.value = valid(Number(input.value) + 1));
  const partSelects = [...content.querySelectorAll('[data-bundle-part]')];
  button.onclick = async () => {
    if (!available) return;
    if (basket.pending) {
      content.querySelector('#gm-added').textContent = 'Изчакай текущата промяна.';
      return;
    }
    button.disabled = true;
    if (selector) selector.disabled = true;
    for (const choice of partSelects) choice.disabled = true;
    const status = content.querySelector('#gm-added');
    status.textContent = 'Добавяме в количката…';
    const message = await basket.change(
      isBundle ? 'bundle' : 'add',
      isBundle ? live.id : selected.id,
      valid(input.value),
      isBundle ? {variantIds: partSelects.map((choice) => choice.value)} : undefined,
    );
    button.disabled = false;
    if (selector) selector.disabled = false;
    for (const choice of partSelects) choice.disabled = false;
    if (!status.isConnected || !productDialog.open) {
      showToast(message || '✓ Добавено в количката');
      return;
    }
    status.innerHTML = message
      ? `<p class="gm-cart-note">${esc(message)}</p><button class="gm-secondary" id="gm-see-cart">Виж количката</button>`
      : `<div class="gm-success"><strong>✓ Добавено в количката</strong><br>Можеш да продължиш с избора си.
        <button class="gm-primary" id="gm-see-cart">Виж количката · ${esc(displayMoney(basket.current?.total))}</button>
        <button class="gm-secondary" id="gm-continue">Продължи разглеждането</button></div>`;
    status.querySelector('#gm-see-cart').onclick = openCart;
    const keepShopping = status.querySelector('#gm-continue');
    if (keepShopping) keepShopping.onclick = () => close(productDialog);
    announce(message || 'Продуктът е добавен в количката');
  };
}

function renderBundleParts(parts) {
  const choices = parts.map(({product, quantity}) => {
    const available = product.variants.nodes.filter((variant) => variant.availableForSale);
    // CloudCart expects a variant ID for every component, in bundle order.
    if (available.length <= 1) {
      return `<input type="hidden" data-bundle-part value="${esc(available[0]?.id ?? '')}">`;
    }
    const options = available.map((variant) =>
      `<option value="${esc(variant.id)}">${esc(variant.title)}</option>`
    ).join('');
    return `<label class="gm-bundle-choice">${quantity} × ${esc(product.title)}
      <select data-bundle-part>${options}</select></label>`;
  });
  return choices.join('');
}

function updateCart() {
  const cart = basket.current ?? emptyCart;
  const sticky = document.getElementById('gm-sticky-cart');
  sticky.hidden = cart.totalQuantity === 0;
  sticky.querySelector('span').textContent = `${cart.totalQuantity} бр. · ${displayMoney(cart.total)}`;
  document.body.classList.toggle('gm-has-cart', cart.totalQuantity > 0);
  document.querySelectorAll('a[href="https://mohana.bg/cart"]').forEach((a) => {
    a.querySelector('.gm-count')?.remove();
    a.setAttribute('aria-label', `Количка, ${cart.totalQuantity} продукта`);
    if (cart.totalQuantity) {
      const badge = document.createElement('span');
      badge.className = 'gm-count';
      badge.textContent = cart.totalQuantity;
      a.append(badge);
    }
  });
  if (cartDialog.open) renderCart();
}

function renderCartLine(line, disabled, bundled = false) {
  return `<div class="gm-cart-line" data-line="${esc(line.id)}">
    ${line.image ? `<img src="${esc(line.image)}" alt="${esc(line.title)}">` : '<span></span>'}
    <div><h3>${esc(line.title)}${line.variant ? ` · ${esc(line.variant)}` : ''}</h3>
      ${
        bundled
          ? `<p class="gm-cart-note">${line.quantity} бр.</p>`
          : `<div class="gm-qty">
        <button data-delta="-1" aria-label="Намали ${esc(line.title)}" ${disabled || !line.adjustable || line.quantity <= line.minimum ? 'disabled' : ''}>−</button>
        <span style="width:32px;text-align:center;font-size:12px">${line.quantity}</span>
        <button data-delta="1" aria-label="Увеличи ${esc(line.title)}" ${disabled || !line.adjustable ? 'disabled' : ''}>+</button>
      </div>
      <button class="gm-cart-remove" data-remove ${disabled ? 'disabled' : ''}>Премахни</button>`
      }
    </div>
    <span class="gm-cart-cost">${esc(displayMoney(line.amount))}</span>
    </div>`;
}

function renderCartLines(lines, disabled) {
  const seen = new Set();
  return lines
    .map((line) => {
      if (!line.bundle) return renderCartLine(line, disabled);
      if (seen.has(line.bundle.id)) return '';
      const bundle = line.bundle;
      seen.add(bundle.id);
      const members = lines.filter((item) => item.bundle?.id === bundle.id);
      return `<section class="gm-bundle-cart" data-bundle-id="${esc(bundle.id)}">
      <h3>${esc(bundle.title)} × ${bundle.quantity}</h3>
      ${members.map((member) => renderCartLine(member, disabled, true)).join('')}
      <button class="gm-cart-remove" data-remove-bundle ${disabled ? 'disabled' : ''}>Премахни комплекта</button>
    </section>`;
    })
    .join('');
}

function renderCart() {
  const cart = basket.current ?? emptyCart;
  const subtotal = Number(cart.subtotal?.amount);
  const left = 69.01 - subtotal;
  const shipping =
    cart.totalQuantity && cart.subtotal?.currencyCode === 'EUR'
      ? `<p class="gm-cart-note">${left > 0 ? 'Още ' + money(left) + ' до безплатна доставка.' : 'Безплатна доставка за избраните продукти.'}</p>
      <div class="gm-progress"><i style="width:${Math.min(100, (subtotal / 69) * 100)}%"></i></div>`
      : '';
  const disabled = basket.pending || !basket.confirmed;
  const content = document.getElementById('gm-cart-content');
  content.innerHTML = `<p class="gm-modal-kicker">Твоят ароматен избор</p>
    <h2 id="gm-cart-title">Количка <span style="font:14px Montserrat">(${cart.totalQuantity})</span></h2>
    ${shipping}<div class="gm-cart-items">
      ${
        renderCartLines(cart.lines, disabled) ||
        (basket.pending
          ? ''
          : '<p class="gm-empty">Количката ти е празна.<br>Открий своя аромат и го добави тук.</p>')
      }
    </div>
    ${
      cart.totalQuantity
        ? `<div class="gm-cart-total"><span>Общо</span><strong>${esc(displayMoney(cart.total))}</strong></div>
      <p class="gm-cart-note">Доставката се изчислява при поръчка.</p>`
        : ''
    }
    ${cart.checkoutUrl && !disabled ? `<a class="gm-primary" id="gm-checkout" href="${esc(cart.checkoutUrl)}" target="_top">Към поръчка →</a>` : ''}
    ${!basket.confirmed && !basket.pending ? '<button class="gm-primary" id="gm-refresh-cart">Обнови количката</button>' : ''}
    <div id="gm-checkout-note" role="status">${basket.pending ? 'Обновяваме количката…' : esc(cartMessage)}</div>
    <button class="gm-secondary" id="gm-cart-continue">Продължи разглеждането</button>`;
  content.querySelector('#gm-cart-continue').onclick = () => close(cartDialog);
  const refresh = content.querySelector('#gm-refresh-cart');
  if (refresh) refresh.onclick = refreshCart;
  for (const group of content.querySelectorAll('[data-bundle-id]')) {
    const members = cart.lines.filter((line) => line.bundle?.id === group.dataset.bundleId);
    group.querySelector('[data-remove-bundle]').onclick = () =>
      changeLine('remove', members[0].id, undefined, undefined, {
        lineIds: members.map((line) => line.id),
      });
  }
  for (const row of content.querySelectorAll('[data-line]')) {
    const line = cart.lines.find((item) => item.id === row.dataset.line);
    if (line.bundle) continue;
    row.querySelector('[data-remove]').onclick = () => changeLine('remove', line.id);
    for (const button of row.querySelectorAll('[data-delta]')) {
      button.onclick = () =>
        changeLine('update', line.id, line.quantity + Number(button.dataset.delta), button.dataset.delta);
    }
  }
}

async function changeLine(operation, id, quantity, delta, options) {
  cartMessage = '';
  cartMessage = (await basket.change(operation, id, quantity, options)) || '';
  if (!cartDialog.open) return;
  renderCart();
  const row = [...cartDialog.querySelectorAll('[data-line]')].find((item) => item.dataset.line === id);
  const button = delta && row?.querySelector(`[data-delta="${delta}"]:not(:disabled)`);
  (button || document.getElementById('gm-cart-continue')).focus();
}

async function refreshCart() {
  cartMessage = '';
  cartMessage = (await basket.refresh()) || '';
  if (cartDialog.open) renderCart();
}

function openCart() {
  renderCart();
  show(cartDialog);
  refreshCart();
}

document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-quick-add]');
  if (button) {
    event.preventDefault();
    const product = byHandle.get(button.dataset.quickAdd);
    if (product) quickAdd(product, button);
    return;
  }
  const anchor = event.target.closest('a');
  if (!anchor || productDialog.contains(anchor)) return;
  const url = new URL(anchor.href, location.href);
  if (url.origin !== store) return;
  if (url.pathname === '/cart') {
    event.preventDefault();
    openCart();
    return;
  }
  const product = byHandle.get(url.pathname.split('/product/')[1]);
  if (product) {
    event.preventDefault();
    openProduct(product);
  }
});

for (const link of document.querySelectorAll('a[href^="https://mohana.bg/"]')) {
  link.target = '_top';
  if (link.classList.contains('gm-card-add')) link.innerHTML = 'Разгледай <span aria-hidden="true">＋</span>';
}
for (const button of document.querySelectorAll('[data-open-cart]')) button.onclick = openCart;

function card(p) {
  const v = p.selectedOrFirstAvailableVariant,
    old = Number(v?.compareAtPrice?.amount || 0),
    title = p.title.replace(/^(Етерично масло|Арома [Кк]омпозиция|Промо пакет)\s*/, '');
  return `<li><article class="gm-card h-full"><div class="gm-card-media"><img class="cc-image" loading="lazy" src="${esc(p.featuredImage.url)}" alt="${esc(p.title)}" style="width:100%;height:100%;object-fit:contain">${old > price(p) ? `<span class="gm-card-saving">Спестяваш ${money(old - price(p))}</span>` : ''}</div><div class="flex flex-1 flex-col gap-1 p-4 md:p-5"><p class="gm-eyebrow text-ink-muted">${type(p)}</p><h3 class="gm-serif text-card text-ink"><a class="gm-card-link" href="${esc(productLink(p))}" target="_top">${esc(title)}</a></h3><div class="gm-card-actions"><p class="gm-card-prices">${money(price(p))}${old > price(p) ? ` <del>${money(old)}</del>` : ''}</p><button type="button" class="gm-card-buy" data-quick-add="${esc(p.handle)}">Добави в количката</button><a class="gm-card-details" href="${esc(productLink(p))}" target="_top">${p.options?.length ? 'Избор на разфасовка и детайли' : 'Подробности за продукта'}</a></div></div></article></li>`;
}

const tabs = [...document.querySelectorAll('[role=tab]')],
  panel = document.querySelector('[role=tabpanel]');
function setRitual(i) {
  const r = D.rituals[i];
  tabs.forEach((t, j) => {
    t.setAttribute('aria-selected', String(i === j));
    t.tabIndex = i === j ? 0 : -1;
  });
  panel.setAttribute('aria-labelledby', tabs[i].id);
  panel.querySelector('h3').textContent = r.heading;
  panel.querySelector('.gm-lead').textContent = r.text;
  panel.querySelector('.gm-ritual-panel .text-small p').innerHTML = '<strong>Съвет:</strong> ' + esc(r.tip);
  panel.querySelector('ul').innerHTML = r.handles
    .map((h) => byHandle.get(h))
    .filter((p) => p && p.availableForSale && p.selectedOrFirstAvailableVariant?.availableForSale)
    .map(card)
    .join('');
}
tabs.forEach((t, i) => {
  t.onclick = () => setRitual(i);
  t.onkeydown = (e) => {
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(e.key)) {
      e.preventDefault();
      const n =
        e.key === 'Home'
          ? 0
          : e.key === 'End'
            ? tabs.length - 1
            : (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      setRitual(n);
      tabs[n].focus();
    }
  };
});
setRitual(0);
const featuredPacks = D.extras.packs.filter((p) => /дифузер|небюлайзер|crystal pure/i.test(p.title));
const packList = document.querySelector('#packs ul');
packList.classList.add('gm-packs-grid');
let packLimit = 6;
const packMore = document.createElement('button');
packMore.className = 'gm-secondary gm-packs-more';
packList.after(packMore);
function renderPacks() {
  packList.innerHTML = featuredPacks.slice(0, packLimit).map(card).join('');
  packMore.hidden = packLimit >= featuredPacks.length;
  packMore.textContent = 'Още комплекти (' + Math.max(0, featuredPacks.length - packLimit) + ')';
}
packMore.onclick = () => {
  packLimit += 6;
  renderPacks();
};
renderPacks();
const spotlightBuy = document.querySelector('#diffuser a[href*="/product/"]');
if (spotlightBuy) {
  const b = document.createElement('button');
  b.className = spotlightBuy.className;
  b.textContent = 'Добави в количката';
  b.dataset.quickAdd = D.spotlight.handle;
  spotlightBuy.before(b);
  spotlightBuy.className = 'gm-spotlight-details';
  spotlightBuy.innerHTML = 'Подробности за дифузера';
}
const catalog = document.getElementById('catalog'),
  catalogButtons = [...catalog.querySelectorAll('[aria-pressed]')],
  catalogList = catalog.querySelector('ul');
let more =
  [...catalog.querySelectorAll('button')].find((b) => b.textContent.includes('Покажи още')) ||
  document.createElement('button');
more.className = 'gm-secondary';
more.style.cssText = 'display:flex;margin:30px auto 0';
catalogList.after(more);
function renderCatalog() {
  const items = D.catalog[catalogKind];
  catalogList.innerHTML = items.slice(0, limit).map(card).join('');
  more.hidden = limit >= items.length;
  more.style.display = more.hidden ? 'none' : 'flex';
  more.textContent = `Покажи още (${Math.max(0, items.length - limit)})`;
  catalogButtons.forEach((b, i) =>
    b.setAttribute('aria-pressed', String((i === 0 ? 'singles' : 'blends') === catalogKind)),
  );
}
catalogButtons.forEach(
  (b, i) =>
    (b.onclick = () => {
      catalogKind = i === 0 ? 'singles' : 'blends';
      limit = 12;
      renderCatalog();
    }),
);
more.onclick = () => {
  limit += 12;
  renderCatalog();
};
renderCatalog();
// Retain the spotlight gallery without remote React hydration.
const spotlight = document.querySelector('section[aria-labelledby="gm-spotlight-title"]');
if (spotlight) {
  const imgs = D.spotlight.images || [];
  spotlight.querySelectorAll('button[aria-pressed]').forEach(
    (b, i) =>
      (b.onclick = () => {
        if (imgs[i]) {
          spotlight.querySelector('img').src = imgs[i];
          spotlight.querySelector('img').removeAttribute('srcset');
          spotlight.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        }
      }),
  );
}
function countdown() {
  const gap = Math.max(0, new Date('2026-11-30T23:59:59+02:00') - Date.now()),
    days = Math.floor(gap / 86400000),
    hours = Math.floor(gap / 3600000) % 24,
    minutes = Math.floor(gap / 60000) % 60,
    seconds = Math.floor(gap / 1000) % 60;
  document.querySelectorAll('[role=timer]').forEach((t) => {
    const cells = t.querySelectorAll('p');
    if (cells.length === 4) {
      [days, hours, minutes, seconds].forEach(
        (v, i) => (cells[i].querySelector('span').textContent = String(v).padStart(2, '0')),
      );
    } else
      t.textContent = gap
        ? `Остават ${days} дни ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
        : 'Кампанията приключи';
  });
}
countdown();
setInterval(countdown, 1000);
updateCart();
refreshCart();

export function createCart({onChange}) {
  const endpoint = '/api/green-month-cart';
  const storageKey = 'mohana-green-month-cart';
  let id;
  let cart = null;
  let pending = false;
  let confirmed = true;

  try {
    id = sessionStorage.getItem(storageKey);
  } catch {
    // The current cart remains usable when the host browser blocks framed storage.
  }

  function accept(value) {
    cart = value;
    id = value?.id;
    confirmed = true;
    try {
      if (id) sessionStorage.setItem(storageKey, id);
      else sessionStorage.removeItem(storageKey);
    } catch {
      // Keeping the ID in memory is enough to reach checkout.
    }
  }

  async function request({product, mutation} = {}) {
    const url = new URL(endpoint, location.origin);
    if (product) url.searchParams.set('product', product);
    const headers = {};
    if (!product && id) headers['X-Mohana-Cart'] = id;
    if (mutation) headers['Content-Type'] = 'application/json';

    const response = await fetch(url, {
      method: mutation ? 'POST' : 'GET',
      headers,
      body: mutation ? JSON.stringify(mutation) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const data = await response.json();
    if (!response.ok && !Object.hasOwn(data, 'cart')) throw new Error(data.message);
    return data;
  }

  async function refresh() {
    if (!id || pending) return;
    pending = true;
    onChange();
    try {
      const {cart: current} = await request();
      accept(current);
    } catch {
      confirmed = false;
      return 'Количката не се зареди. Опитай да я обновиш.';
    } finally {
      pending = false;
      onChange();
    }
  }

  async function change(operation, idOfItem, quantity, options) {
    if (pending) return 'Изчакай текущата промяна.';
    if (!confirmed && id) return 'Обнови количката, преди да направиш нова промяна.';

    const previous =
      operation === 'add'
        ? (cart?.lines
            .filter((line) => line.variantId === idOfItem && !line.bundle)
            .reduce((sum, line) => sum + line.quantity, 0) ?? 0)
        : 0;

    pending = true;
    onChange();
    try {
      const data = await request({
        mutation: {operation, id: idOfItem, quantity, ...options},
      });
      if (Object.hasOwn(data, 'cart')) accept(data.cart);
      if (data.message || operation === 'bundle') return data.message;
      const line = cart?.lines.find((item) => item.id === idOfItem);
      const added =
        cart?.lines
          .filter((item) => item.variantId === idOfItem && !item.bundle)
          .reduce((sum, item) => sum + item.quantity, 0) ?? 0;
      const matches =
        operation === 'add'
          ? added === previous + quantity
          : operation === 'update'
            ? line?.quantity === quantity
            : options?.lineIds
              ? options.lineIds.every((id) => !cart?.lines.some((item) => item.id === id))
              : !line;
      if (!matches) return 'Магазинът промени наличното количество. Провери количката.';
    } catch {
      confirmed = !id;
      return 'Промяната не беше потвърдена. Провери количката, преди да опиташ отново.';
    } finally {
      pending = false;
      onChange();
    }
  }

  return {
    get current() {
      return cart;
    },
    get pending() {
      return pending;
    },
    get confirmed() {
      return confirmed;
    },
    product: async (handle) => (await request({product: handle})).product,
    refresh,
    change,
  };
}

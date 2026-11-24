import type {Route} from './+types/api.green-month-cart';
import type {CartApiQueryFragment} from 'storefrontapi.generated';

const headers = {'Cache-Control': 'private, no-store'};
const cartIdPattern = /^gid:\/\/cloudcart\/Cart\/[^\s/]{1,256}$/;
const productIdPattern = /^gid:\/\/cloudcart\/Product\/\d+$/;
const variantIdPattern = /^gid:\/\/cloudcart\/ProductVariant\/\d+$/;
const lineIdPattern = /^\S{1,300}$/;
const unavailable = 'Връзката с магазина е прекъсната. Опитай отново.';

function failure(message: string, status: number) {
  return Response.json({message}, {status, headers});
}

function checkoutAddress(address: string) {
  try {
    const url = new URL(address);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

function publicCart(cart: CartApiQueryFragment | null) {
  if (!cart) return null;
  return {
    id: cart.id,
    checkoutUrl: cart.totalQuantity ? checkoutAddress(cart.checkoutUrl) : null,
    totalQuantity: cart.totalQuantity,
    total: cart.cost.totalAmount,
    subtotal: cart.cost.subtotalAmount,
    lines: cart.lines.nodes.map((line) => ({
      id: line.id,
      title: line.merchandise.product.title,
      variant: line.merchandise.selectedOptions.map(({value}) => value).join(' · '),
      variantId: line.merchandise.id,
      quantity: line.quantity,
      minimum: line.merchandise.minimumQuantity,
      adjustable: line.allowQuantityChange,
      bundle: line.bundle,
      image: line.merchandise.image?.url ?? line.merchandise.product.featuredImage?.url,
      amount: line.cost.totalAmount,
    })),
  };
}

function validIds(value: unknown, pattern: RegExp): value is string[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.length <= 100 &&
    value.every((item) => typeof item === 'string' && pattern.test(item))
  );
}

function privateCartId(request: Request) {
  return request.headers.get('X-Mohana-Cart');
}

export async function loader({request, context}: Route.LoaderArgs) {
  const handle = new URL(request.url).searchParams.get('product');
  const cartId = privateCartId(request);
  try {
    if (handle !== null) {
      if (!/^[a-z0-9-]{1,160}$/.test(handle)) return failure('Невалиден продукт.', 400);
      const {storefront, customerAccount} = context;
      const {product} = await storefront.query(GREEN_MONTH_PRODUCT_QUERY, {
        variables: {handle, buyer: await customerAccount.getBuyer()},
        cache: storefront.CacheNone(),
      });
      return Response.json({product}, {headers});
    }

    if (!cartId || !cartIdPattern.test(cartId)) return failure('Невалидна количка.', 400);
    const cart = await context.cart.get({cartId});
    if (cart?.errors?.length) return failure(unavailable, 503);
    return Response.json({cart: publicCart(cart)}, {headers});
  } catch {
    return failure(unavailable, 503);
  }
}

export async function action({request, context}: Route.ActionArgs) {
  if (request.method !== 'POST') return failure('Невалидна заявка.', 405);
  const origin = request.headers.get('Origin');
  // Embedded browsers can omit Origin. Fetch Metadata still identifies their
  // requests to this same-origin endpoint.
  const sameOrigin =
    request.headers.get('Sec-Fetch-Site') === 'same-origin' || origin === new URL(request.url).origin;
  if (!sameOrigin || !request.headers.get('Content-Type')?.startsWith('application/json')) {
    return failure('Невалидна заявка.', 403);
  }

  const cartId = privateCartId(request);
  if (cartId !== null && !cartIdPattern.test(cartId)) return failure('Невалидна количка.', 400);

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') return failure('Невалидна заявка.', 400);
  const {operation, id, quantity, variantIds, lineIds} = body as Record<string, unknown>;
  const validQuantity =
    typeof quantity === 'number' && Number.isSafeInteger(quantity) && quantity >= 1 && quantity <= 2147483647;
  if (typeof id !== 'string') return failure('Невалидна заявка.', 400);

  const {cart} = context;
  try {
    let result;
    if (operation === 'add' && variantIdPattern.test(id) && validQuantity) {
      const lines = [{merchandiseId: id, quantity}];
      result = cartId ? await cart.addLines(lines, {cartId}) : await cart.create({lines});
    } else if (
      operation === 'bundle' &&
      productIdPattern.test(id) &&
      validQuantity &&
      validIds(variantIds, variantIdPattern)
    ) {
      const currentId = cartId ?? (await cart.create({})).cart?.id;
      if (!currentId) return failure(unavailable, 503);
      result = await cart.addBundle(
        {bundleId: id, quantity, items: variantIds.map((merchandiseId) => ({merchandiseId}))},
        {cartId: currentId},
      );
    } else if (operation === 'update' && cartId && lineIdPattern.test(id) && validQuantity) {
      result = await cart.updateLines([{id, quantity}], {cartId});
    } else if (operation === 'remove' && cartId && lineIdPattern.test(id)) {
      const ids = lineIds === undefined ? [id] : lineIds;
      if (!validIds(ids, lineIdPattern)) return failure('Невалидна заявка.', 400);
      result = await cart.removeLines(ids, {cartId});
    } else {
      return failure('Невалидна заявка.', 400);
    }

    if (!result.cart && cartId && result.userErrors?.some((error) => error.field?.[0] === 'cartId')) {
      return Response.json(
        {
          cart: null,
          message: 'Количката е изтекла. Добави желания продукт отново.',
        },
        {status: 409, headers},
      );
    }
    const messages = [
      ...(result.userErrors ?? []).map(({message}) => message),
      ...(result.warnings ?? []).map(({message}) => message),
    ].filter(Boolean);
    const message =
      [...new Set(messages)].join(' ') ||
      (!result.cart || result.errors?.length ? 'Промяната не беше потвърдена. Провери количката.' : '');
    if (!result.cart || result.errors?.length) return failure(message, 409);
    return Response.json({cart: publicCart(result.cart), message}, {headers});
  } catch {
    return failure(unavailable, 503);
  }
}

const GREEN_MONTH_PRODUCT_QUERY = `#graphql
  query GreenMonthPopupProduct($handle: String!, $buyer: BuyerInput) @inContext(buyer: $buyer) {
    product(handle: $handle) {
      id
      availableForSale
      productType
      customizations { required }
      bundle {
        products {
          quantity
          product {
            title
            customizations { required }
            variants(first: 100) {
              pageInfo { hasNextPage }
              nodes { id title availableForSale }
            }
          }
        }
      }
      variants(first: 100) {
        pageInfo { hasNextPage }
        nodes { ...GreenMonthPopupVariant }
      }
      selectedOrFirstAvailableVariant { ...GreenMonthPopupVariant }
    }
  }
  fragment GreenMonthPopupVariant on ProductVariant {
    id
    sku
    availableForSale
    minimumQuantity
    selectedOptions { value }
    price { amount currencyCode formatted }
    compareAtPrice { amount currencyCode formatted }
    image { url }
  }
` as const;

export function getConfiguredStoreId() {
  return process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID ?? "";
}

export function getCheckoutUrl(sessionId?: string) {
  const productId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRODUCT_ID ?? "";
  if (!productId) {
    return "";
  }

  const base = productId.startsWith("http") ? productId : `https://checkout.lemonsqueezy.com/buy/${productId}`;

  if (!sessionId) {
    return base;
  }

  const url = new URL(base);
  url.searchParams.set("checkout[custom][session_id]", sessionId);
  return url.toString();
}

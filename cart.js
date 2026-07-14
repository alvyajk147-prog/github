/* ===========================================================
   Brushify — Cart state
   A tiny localStorage-backed cart, equivalent to the React
   CartProvider/useCart context in the original source.
   =========================================================== */

const CART_KEY = "brushify:cart";

function readCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  document.dispatchEvent(new CustomEvent("cart:change", { detail: { items } }));
}

const Cart = {
  getItems() {
    return readCart();
  },
  subtotal() {
    return readCart().reduce((s, i) => s + i.price * i.qty, 0);
  },
  count() {
    return readCart().reduce((s, i) => s + i.qty, 0);
  },
  add(item, qty = 1) {
    const items = readCart();
    const existing = items.find((p) => p.id === item.id);
    if (existing) {
      existing.qty += qty;
    } else {
      items.push({ ...item, qty });
    }
    writeCart(items);
    Cart.open();
  },
  remove(id) {
    writeCart(readCart().filter((p) => p.id !== id));
  },
  setQty(id, qty) {
    const items = readCart().map((p) =>
      p.id === id ? { ...p, qty: Math.max(1, qty) } : p
    );
    writeCart(items);
  },
  clear() {
    writeCart([]);
  },
  open() {
    document.dispatchEvent(new CustomEvent("cart:open"));
  },
  close() {
    document.dispatchEvent(new CustomEvent("cart:close"));
  },
  toggle() {
    document.dispatchEvent(new CustomEvent("cart:toggle"));
  },
};

window.Cart = Cart;

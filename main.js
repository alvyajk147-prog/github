/* ===========================================================
   Brushify — shared site behavior
   Nav scroll/blur state, mobile menu, mini-cart rendering,
   reveal-on-scroll (IntersectionObserver), active nav link.
   =========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initNav();
  initMobileMenu();
  initMiniCart();
  initReveal();
  markActiveLink();
});

/* ---------- nav scroll blur ---------- */
function initNav() {
  const nav = document.querySelector(".site-nav");
  if (!nav) return;
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- mobile menu ---------- */
function initMobileMenu() {
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!toggle || !menu) return;
  const iconOpen = toggle.querySelector(".icon-menu");
  const iconClose = toggle.querySelector(".icon-close");
  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.toggle("open");
    if (iconOpen && iconClose) {
      iconOpen.style.display = isOpen ? "none" : "";
      iconClose.style.display = isOpen ? "" : "none";
    }
  });
  menu.querySelectorAll("a").forEach((a) =>
    a.addEventListener("click", () => {
      menu.classList.remove("open");
      if (iconOpen && iconClose) {
        iconOpen.style.display = "";
        iconClose.style.display = "none";
      }
    })
  );
}

/* ---------- active nav link ---------- */
function markActiveLink() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll(`.nav-links a[data-page="${page}"]`).forEach((a) => {
    a.classList.add("active");
  });
}

/* ---------- reveal on scroll ---------- */
function initReveal() {
  const els = document.querySelectorAll(".reveal");
  if (!els.length) return;
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  els.forEach((el) => io.observe(el));
}

/* ---------- mini cart ---------- */
function initMiniCart() {
  const overlay = document.querySelector(".cart-overlay");
  const drawer = document.querySelector(".mini-cart");
  const openBtns = document.querySelectorAll("[data-cart-open]");
  const closeBtns = document.querySelectorAll("[data-cart-close]");
  const badgeEls = document.querySelectorAll(".cart-badge");
  const body = document.querySelector(".mini-cart-body");
  const foot = document.querySelector(".mini-cart-foot");

  function setOpen(open) {
    if (!overlay || !drawer) return;
    overlay.classList.toggle("open", open);
    drawer.classList.toggle("open", open);
    document.body.style.overflow = open ? "hidden" : "";
  }

  openBtns.forEach((b) => b.addEventListener("click", () => setOpen(true)));
  closeBtns.forEach((b) => b.addEventListener("click", () => setOpen(false)));
  if (overlay) overlay.addEventListener("click", () => setOpen(false));

  document.addEventListener("cart:open", () => setOpen(true));
  document.addEventListener("cart:close", () => setOpen(false));
  document.addEventListener("cart:toggle", () =>
    setOpen(!drawer.classList.contains("open"))
  );
  document.addEventListener("cart:change", render);

  function render() {
    const items = Cart.getItems();
    const count = Cart.count();
    const subtotal = Cart.subtotal();

    badgeEls.forEach((el) => {
      el.textContent = String(count);
      el.style.display = count > 0 ? "flex" : "none";
    });

    if (!body) return;

    if (items.length === 0) {
      body.innerHTML = `
        <div class="mini-cart-empty">
          <div class="ring">✦</div>
          <p class="muted">Your cart is empty.</p>
          <a href="product.html" data-cart-close>Discover Brushify →</a>
        </div>`;
      if (foot) foot.style.display = "none";
      return;
    }

    body.innerHTML = `<ul>${items
      .map(
        (it) => `
      <li class="cart-line" data-id="${it.id}">
        <div class="thumb"><img src="${it.image}" alt="${it.name}"></div>
        <div class="info">
          <div class="row-top">
            <p>${it.name}</p>
            <button data-remove aria-label="Remove">${icon("trash")}</button>
          </div>
          <p class="price">$${it.price.toFixed(2)}</p>
          <div class="qty-control">
            <button data-decr aria-label="Decrease">${icon("minus")}</button>
            <span>${it.qty}</span>
            <button data-incr aria-label="Increase">${icon("plus")}</button>
          </div>
        </div>
      </li>`
      )
      .join("")}</ul>`;

    body.querySelectorAll(".cart-line").forEach((line) => {
      const id = line.dataset.id;
      line.querySelector("[data-remove]").addEventListener("click", () => Cart.remove(id));
      line.querySelector("[data-incr]").addEventListener("click", () => {
        const item = Cart.getItems().find((i) => i.id === id);
        Cart.setQty(id, item.qty + 1);
      });
      line.querySelector("[data-decr]").addEventListener("click", () => {
        const item = Cart.getItems().find((i) => i.id === id);
        Cart.setQty(id, item.qty - 1);
      });
    });

    if (foot) {
      foot.style.display = "";
      const amt = foot.querySelector(".amt");
      if (amt) amt.textContent = `$${subtotal.toFixed(2)}`;
    }

    // re-run reveal for any newly-injected nodes (no-op if none)
  }

  render();
}

/* ---------- tiny inline icon helper (mini-cart only) ---------- */
function icon(name) {
  const icons = {
    trash:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
    minus:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    plus:
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  };
  return icons[name] || "";
}

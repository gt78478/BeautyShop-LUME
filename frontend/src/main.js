import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const state = {
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  user: null,
  products: [],
  meta: { categories: [], brands: [] },
  cart: { items: [], subtotal_cents: 0 },
  orders: [],
  filters: { q: "", category: "", brand: "" },
};

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  maximumFractionDigits: 0,
});

function clp(cents) {
  return money.format(Math.round(cents / 100));
}

function headers(json = true) {
  const output = {};
  if (json) output["Content-Type"] = "application/json";
  if (state.token) output.Authorization = `Bearer ${state.token}`;
  return output;
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: { ...headers(options.body !== undefined), ...(options.headers || {}) },
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.detail || `HTTP ${response.status}`);
  }
  return response.status === 204 ? null : response.json();
}

async function loadBase() {
  const [meta, products] = await Promise.all([
    api("/catalog/meta"),
    api(`/products?${new URLSearchParams(clean(state.filters))}`),
  ]);
  state.meta = meta;
  state.products = products.items;
  if (state.token) {
    await Promise.allSettled([loadUser(), loadCart(), loadOrders()]);
  }
  render();
}

async function loadUser() {
  state.user = await api("/users/me");
}

async function loadCart() {
  state.cart = await api("/cart");
}

async function loadOrders() {
  state.orders = await api("/orders");
}

function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, value]) => value));
}

function setTokens(payload) {
  state.token = payload.access_token;
  state.refreshToken = payload.refresh_token;
  localStorage.setItem("token", state.token);
  localStorage.setItem("refreshToken", state.refreshToken);
}

function logout() {
  state.token = null;
  state.refreshToken = null;
  state.user = null;
  state.cart = { items: [], subtotal_cents: 0 };
  state.orders = [];
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  render();
}

function appShell() {
  return `
    <div class="announce">Despacho gratis desde ${clp(4500000)} en Chile</div>
    <header class="topbar">
      <nav>
        <a href="#catalog">Catalogo</a>
        <a href="#cart">Carrito</a>
        <a href="#orders">Pedidos</a>
      </nav>
      <button class="brand" data-action="home">BeautyShop <span>Chile</span></button>
      <div class="actions">
        <span class="user">${state.user ? state.user.email : "Invitado"}</span>
        ${state.user ? `<button class="ghost" data-action="logout">Salir</button>` : `<button class="ghost" data-action="show-auth">Entrar</button>`}
        <button class="cart-pill" data-action="scroll-cart">Bolsa ${state.cart.items.length}</button>
      </div>
    </header>
    <main>
      <section class="hero">
        <div class="hero-media" role="img" aria-label="Cosmetica premium"></div>
        <div class="hero-copy">
          <p class="eyebrow">cosmetica limpia para rutinas reales</p>
          <h1>BeautyShop Chile</h1>
          <p>Skincare, maquillaje y cuidado capilar adaptados al mercado chileno: CLP, RUT, regiones y pagos locales.</p>
          <div class="hero-actions">
            <a class="primary" href="#catalog">Comprar ahora</a>
            <button class="secondary" data-action="demo-login">Demo login</button>
          </div>
        </div>
      </section>
      <section class="strip">
        <span>Mercado Pago ready</span>
        <span>JWT account</span>
        <span>Stock local</span>
        <span>es-CL / en</span>
      </section>
      ${authPanel()}
      ${catalog()}
      ${cart()}
      ${checkout()}
      ${orders()}
      ${admin()}
    </main>
  `;
}

function authPanel() {
  if (state.user) return "";
  return `
    <section class="auth-panel" id="auth">
      <form class="panel" data-form="login">
        <h2>Entrar</h2>
        <input name="email" type="email" placeholder="Email" value="demo@beautyshop.cl" required />
        <input name="password" type="password" placeholder="Password" value="demo1234" required />
        <button class="primary">Entrar</button>
      </form>
      <form class="panel" data-form="register">
        <h2>Crear cuenta</h2>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Minimo 6 caracteres" required />
        <button class="secondary">Registrarme</button>
      </form>
    </section>
  `;
}

function catalog() {
  return `
    <section class="section" id="catalog">
      <div class="section-head">
        <div>
          <p class="eyebrow">catalogo</p>
          <h2>Productos destacados</h2>
        </div>
        <form class="filters" data-form="filters">
          <input name="q" placeholder="Buscar serum, crema..." value="${state.filters.q}" />
          <select name="category">
            <option value="">Categoria</option>
            ${state.meta.categories.map((item) => `<option ${item === state.filters.category ? "selected" : ""}>${item}</option>`).join("")}
          </select>
          <select name="brand">
            <option value="">Marca</option>
            ${state.meta.brands.map((item) => `<option ${item === state.filters.brand ? "selected" : ""}>${item}</option>`).join("")}
          </select>
          <button class="icon" title="Buscar">⌕</button>
        </form>
      </div>
      <div class="product-grid">
        ${state.products.map(productCard).join("") || `<p class="muted">Sin productos para estos filtros.</p>`}
      </div>
    </section>
  `;
}

function productCard(product) {
  return `
    <article class="product">
      <img src="${product.image_url}" alt="${product.name}" />
      <div class="product-body">
        <div class="meta-row">
          <span>${product.category?.name || "Beauty"}</span>
          <span>${product.brand?.name || ""}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description || ""}</p>
        <div class="buy-row">
          <strong>${clp(product.price_cents)}</strong>
          <button class="primary small" data-action="add-cart" data-id="${product.id}">Agregar</button>
        </div>
      </div>
    </article>
  `;
}

function cart() {
  return `
    <section class="section split" id="cart">
      <div>
        <p class="eyebrow">carrito</p>
        <h2>Bolsa de compra</h2>
        <div class="cart-list">
          ${state.cart.items.map((item) => `
            <div class="line">
              <img src="${item.product.image_url}" alt="${item.product.name}" />
              <div>
                <strong>${item.product.name}</strong>
                <span>${item.quantity} x ${clp(item.unit_price_cents)}</span>
              </div>
              <button class="icon" title="Quitar" data-action="remove-cart" data-id="${item.id}">×</button>
            </div>
          `).join("") || `<p class="muted">Tu bolsa esta vacia.</p>`}
        </div>
      </div>
      <aside class="summary">
        <span>Subtotal</span>
        <strong>${clp(state.cart.subtotal_cents)}</strong>
        <span>Despacho estimado</span>
        <strong>${state.cart.items.length ? clp(399000) : clp(0)}</strong>
      </aside>
    </section>
  `;
}

function checkout() {
  if (!state.user || !state.cart.items.length) return "";
  return `
    <section class="section checkout">
      <p class="eyebrow">checkout</p>
      <h2>Datos de entrega</h2>
      <form class="checkout-form" data-form="checkout">
        <input name="full_name" placeholder="Nombre completo" required />
        <input name="rut" placeholder="RUT" required />
        <input name="phone" placeholder="Telefono" />
        <input name="city" placeholder="Region / ciudad" value="Santiago" required />
        <input name="commune" placeholder="Comuna" required />
        <input name="address_line1" placeholder="Direccion" required />
        <input name="postal_code" placeholder="Codigo postal" />
        <button class="primary">Crear pedido</button>
      </form>
    </section>
  `;
}

function orders() {
  if (!state.user) return "";
  return `
    <section class="section" id="orders">
      <p class="eyebrow">cuenta</p>
      <h2>Historial de pedidos</h2>
      <div class="order-grid">
        ${state.orders.map((order) => `
          <article class="order">
            <div class="meta-row"><span>#${order.id}</span><span>${order.status}</span></div>
            <strong>${clp(order.total_cents)}</strong>
            <p>${order.items.map((item) => `${item.quantity}x ${item.product_name_snapshot}`).join(", ")}</p>
            <button class="secondary small" data-action="pay" data-id="${order.id}">Pagar</button>
          </article>
        `).join("") || `<p class="muted">Aun no tienes pedidos.</p>`}
      </div>
    </section>
  `;
}

function admin() {
  if (state.user?.role !== "admin") return "";
  return `
    <section class="section admin" id="admin">
      <p class="eyebrow">admin</p>
      <h2>Dashboard</h2>
      <div id="admin-dashboard" class="metric-grid"></div>
    </section>
  `;
}

function render() {
  document.querySelector("#app").innerHTML = appShell();
  if (state.user?.role === "admin") loadDashboard();
}

async function loadDashboard() {
  const data = await api("/admin/dashboard").catch(() => null);
  if (!data) return;
  document.querySelector("#admin-dashboard").innerHTML = `
    <div><span>Usuarios</span><strong>${data.users}</strong></div>
    <div><span>Productos</span><strong>${data.products}</strong></div>
    <div><span>Pedidos</span><strong>${data.orders}</strong></div>
    <div><span>Ingresos</span><strong>${clp(data.revenue_cents)}</strong></div>
  `;
}

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("form");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  try {
    if (form.dataset.form === "login" || form.dataset.form === "register") {
      setTokens(await api(`/auth/${form.dataset.form}`, { method: "POST", body: JSON.stringify(data) }));
      await loadBase();
    }
    if (form.dataset.form === "filters") {
      state.filters = data;
      await loadBase();
    }
    if (form.dataset.form === "checkout") {
      const order = await api("/orders", {
        method: "POST",
        body: JSON.stringify({
          rut: data.rut,
          address: {
            full_name: data.full_name,
            phone: data.phone,
            city: data.city,
            commune: data.commune,
            address_line1: data.address_line1,
            postal_code: data.postal_code,
          },
        }),
      });
      const payment = await api("/payments/create", {
        method: "POST",
        body: JSON.stringify({ order_id: order.id, provider: "mercado_pago" }),
      });
      alert(`Pedido creado. Demo checkout: ${payment.checkout_url}`);
      await Promise.all([loadCart(), loadOrders()]);
      render();
    }
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener("click", async (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  const action = target.dataset.action;
  try {
    if (action === "logout") logout();
    if (action === "show-auth") document.querySelector("#auth")?.scrollIntoView({ behavior: "smooth" });
    if (action === "scroll-cart") document.querySelector("#cart")?.scrollIntoView({ behavior: "smooth" });
    if (action === "demo-login") {
      setTokens(await api("/auth/login", { method: "POST", body: JSON.stringify({ email: "demo@beautyshop.cl", password: "demo1234" }) }));
      await loadBase();
    }
    if (action === "add-cart") {
      if (!state.user) return document.querySelector("#auth")?.scrollIntoView({ behavior: "smooth" });
      await api("/cart/items", { method: "POST", body: JSON.stringify({ product_id: Number(target.dataset.id), quantity: 1 }) });
      await loadCart();
      render();
    }
    if (action === "remove-cart") {
      await api(`/cart/items/${target.dataset.id}`, { method: "DELETE" });
      await loadCart();
      render();
    }
    if (action === "pay") {
      const payment = await api("/payments/create", { method: "POST", body: JSON.stringify({ order_id: Number(target.dataset.id) }) });
      alert(`Demo checkout: ${payment.checkout_url}`);
    }
  } catch (error) {
    alert(error.message);
  }
});

loadBase().catch((error) => {
  document.querySelector("#app").innerHTML = `<main class="error"><h1>API no disponible</h1><p>${error.message}</p><p>Inicia backend en ${API}</p></main>`;
});


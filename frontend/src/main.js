import "./styles.css";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

const state = {
  token: localStorage.getItem("token"),
  refreshToken: localStorage.getItem("refreshToken"),
  lang: localStorage.getItem("lang") || "ru",
  user: null,
  products: [],
  meta: { categories: [], brands: [] },
  cart: { items: [], subtotal_cents: 0 },
  orders: [],
  filters: { q: "", category: "", brand: "" },
  cartOpen: false,
  route: routeFromPath(),
  admin: {
    dashboard: null,
    products: [],
    users: [],
    orders: [],
    statuses: [],
  },
};

function routeFromPath() {
  if (location.pathname === "/admin") return "admin";
  if (location.pathname === "/auth") return "auth";
  return "shop";
}

function navigate(path) {
  history.pushState({}, "", path);
  state.route = routeFromPath();
}

const i18n = {
  en: {
    announce: "Free shipping from",
    catalog: "Catalog",
    cart: "Cart",
    close: "Close",
    orders: "Orders",
    guest: "Guest",
    logout: "Logout",
    login: "Login",
    bag: "Bag",
    heroEyebrow: "clean cosmetics for real routines",
    heroCopy: "Skincare, makeup and hair care adapted for the Chilean market: CLP, RUT, regions and local payments.",
    shopNow: "Shop now",
    demoLogin: "Demo login",
    benefitDelivery: "Chile-wide delivery",
    benefitCurrency: "Prices in CLP",
    benefitCare: "Curated beauty care",
    benefitCheckout: "Secure checkout",
    authTitle: "Login",
    email: "Email",
    password: "Password",
    createAccount: "Create account",
    minPassword: "Minimum 6 characters",
    register: "Register",
    authSubtitle: "Use your account to manage orders, checkout faster and access admin tools.",
    backToShop: "Back to shop",
    productTitle: "Featured products",
    searchPlaceholder: "Search serum, cream...",
    category: "Category",
    brand: "Brand",
    noProducts: "No products for these filters.",
    add: "Add",
    remove: "Remove",
    cartTitle: "Shopping bag",
    emptyCart: "Your bag is empty.",
    subtotal: "Subtotal",
    shipping: "Estimated shipping",
    checkout: "Checkout",
    deliveryData: "Delivery details",
    fullName: "Full name",
    phone: "Phone",
    city: "Region / city",
    commune: "Commune",
    address: "Address",
    postalCode: "Postal code",
    createOrder: "Create order",
    account: "Account",
    orderHistory: "Order history",
    noOrders: "You do not have orders yet.",
    pay: "Pay",
    dashboard: "Dashboard",
    adminPanel: "Admin panel",
    storefront: "Storefront",
    inventory: "Inventory",
    customers: "Customers",
    customer: "Customer",
    active: "Active",
    hidden: "Hidden",
    lowStock: "Low stock",
    status: "Status",
    restore: "Restore",
    save: "Save",
    order: "Order",
    items: "Items",
    total: "Total",
    role: "Role",
    productManagement: "Product management",
    operations: "Operations",
    recentOrders: "Recent orders",
    newProduct: "New product",
    name: "Name",
    price: "Price CLP",
    stockInput: "Stock",
    imageUrl: "Image URL",
    description: "Description",
    addProduct: "Add product",
    delete: "Delete",
    confirmDelete: "Delete product from catalog?",
    orderCreated: "Order created. Demo payment:",
    demoCheckout: "Demo payment:",
    apiUnavailable: "API unavailable",
    startBackend: "Start backend at",
    users: "Users",
    products: "Products",
    revenue: "Revenue",
  },
  pt: {
    announce: "Frete gratis a partir de",
    catalog: "Catalogo",
    cart: "Carrinho",
    close: "Fechar",
    orders: "Pedidos",
    guest: "Visitante",
    logout: "Sair",
    login: "Entrar",
    bag: "Sacola",
    heroEyebrow: "cosmeticos limpos para rotinas reais",
    heroCopy: "Skincare, maquiagem e cuidado capilar adaptados ao mercado chileno: CLP, RUT, regioes e pagamentos locais.",
    shopNow: "Comprar agora",
    demoLogin: "Login demo",
    benefitDelivery: "Entrega em todo o Chile",
    benefitCurrency: "Precos em CLP",
    benefitCare: "Cuidados selecionados",
    benefitCheckout: "Checkout seguro",
    authTitle: "Entrar",
    email: "Email",
    password: "Senha",
    createAccount: "Criar conta",
    minPassword: "Minimo 6 caracteres",
    register: "Registrar",
    authSubtitle: "Use sua conta para gerenciar pedidos, fazer checkout mais rapido e acessar ferramentas admin.",
    backToShop: "Voltar para loja",
    productTitle: "Produtos destacados",
    searchPlaceholder: "Buscar serum, creme...",
    category: "Categoria",
    brand: "Marca",
    noProducts: "Sem produtos para estes filtros.",
    add: "Adicionar",
    remove: "Remover",
    cartTitle: "Sacola de compras",
    emptyCart: "Sua sacola esta vazia.",
    subtotal: "Subtotal",
    shipping: "Frete estimado",
    checkout: "Checkout",
    deliveryData: "Dados de entrega",
    fullName: "Nome completo",
    phone: "Telefone",
    city: "Regiao / cidade",
    commune: "Comuna",
    address: "Endereco",
    postalCode: "Codigo postal",
    createOrder: "Criar pedido",
    account: "Conta",
    orderHistory: "Historico de pedidos",
    noOrders: "Voce ainda nao tem pedidos.",
    pay: "Pagar",
    dashboard: "Dashboard",
    adminPanel: "Painel admin",
    storefront: "Loja",
    inventory: "Inventario",
    customers: "Clientes",
    customer: "Cliente",
    active: "Ativo",
    hidden: "Oculto",
    lowStock: "Estoque baixo",
    status: "Status",
    restore: "Restaurar",
    save: "Salvar",
    order: "Pedido",
    items: "Itens",
    total: "Total",
    role: "Papel",
    productManagement: "Gestao de produtos",
    operations: "Operacoes",
    recentOrders: "Pedidos recentes",
    newProduct: "Novo produto",
    name: "Nome",
    price: "Preco CLP",
    stockInput: "Estoque",
    imageUrl: "URL da imagem",
    description: "Descricao",
    addProduct: "Adicionar produto",
    delete: "Excluir",
    confirmDelete: "Excluir produto do catalogo?",
    orderCreated: "Pedido criado. Demo checkout:",
    demoCheckout: "Demo checkout:",
    apiUnavailable: "API indisponivel",
    startBackend: "Inicie o backend em",
    users: "Usuarios",
    products: "Produtos",
    revenue: "Receita",
  },
  ru: {
    announce: "Бесплатная доставка от",
    catalog: "Каталог",
    cart: "Корзина",
    close: "Закрыть",
    orders: "Заказы",
    guest: "Гость",
    logout: "Выйти",
    login: "Войти",
    bag: "Корзина",
    heroEyebrow: "чистая косметика для ежедневного ухода",
    heroCopy: "Уход за кожей, макияж и средства для волос для чилийского рынка: CLP, RUT, регионы и локальные платежи.",
    shopNow: "К покупкам",
    demoLogin: "Демо-вход",
    benefitDelivery: "Доставка по Чили",
    benefitCurrency: "Цены в CLP",
    benefitCare: "Подобранный уход",
    benefitCheckout: "Безопасная оплата",
    authTitle: "Вход",
    email: "Email",
    password: "Пароль",
    createAccount: "Создать аккаунт",
    minPassword: "Минимум 6 символов",
    register: "Зарегистрироваться",
    authSubtitle: "Войдите, чтобы управлять заказами, быстрее оформлять покупки и пользоваться админкой.",
    backToShop: "Вернуться в магазин",
    productTitle: "Популярные товары",
    searchPlaceholder: "Найти сыворотку, крем...",
    category: "Категория",
    brand: "Бренд",
    noProducts: "Нет товаров для этих фильтров.",
    add: "Добавить",
    remove: "Удалить",
    cartTitle: "Корзина покупок",
    emptyCart: "Корзина пуста.",
    subtotal: "Итого",
    shipping: "Доставка",
    checkout: "Оформление",
    deliveryData: "Данные доставки",
    fullName: "Полное имя",
    phone: "Телефон",
    city: "Регион / город",
    commune: "Коммуна",
    address: "Адрес",
    postalCode: "Почтовый индекс",
    createOrder: "Создать заказ",
    account: "Аккаунт",
    orderHistory: "История заказов",
    noOrders: "Заказов пока нет.",
    pay: "Оплатить",
    dashboard: "Панель",
    adminPanel: "Админ-панель",
    storefront: "Магазин",
    inventory: "Склад",
    customers: "Клиенты",
    customer: "Клиент",
    active: "Активен",
    hidden: "Скрыт",
    lowStock: "Мало на складе",
    status: "Статус",
    restore: "Вернуть",
    save: "Сохранить",
    order: "Заказ",
    items: "Позиции",
    total: "Сумма",
    role: "Роль",
    productManagement: "Управление товарами",
    operations: "Операции",
    recentOrders: "Последние заказы",
    newProduct: "Новый товар",
    name: "Название",
    price: "Цена CLP",
    stockInput: "Остаток",
    imageUrl: "URL картинки",
    description: "Описание",
    addProduct: "Добавить товар",
    delete: "Удалить",
    confirmDelete: "Удалить товар из каталога?",
    orderCreated: "Заказ создан. Демо-оплата:",
    demoCheckout: "Демо-оплата:",
    apiUnavailable: "API недоступен",
    startBackend: "Запусти backend на",
    users: "Пользователи",
    products: "Товары",
    revenue: "Выручка",
  },
};

function t(key) {
  return i18n[state.lang]?.[key] || i18n.en[key] || key;
}

function escapeAttr(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

const money = new Intl.NumberFormat("es-CL", {
  style: "currency",
  currency: "CLP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function clp(cents) {
  return money.format(Math.round(cents / 100));
}

function roleLabel(role) {
  if (state.lang === "ru") {
    return role === "admin" ? "администратор" : "покупатель";
  }
  if (state.lang === "pt") {
    return role === "admin" ? "administrador" : "cliente";
  }
  return role === "admin" ? "administrator" : "customer";
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
    await loadUser().catch(() => logout());
    await Promise.allSettled([loadCart(), loadOrders()]);
    if (state.route === "admin" && state.user?.role === "admin") {
      await loadAdminData();
    }
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

async function loadAdminData() {
  if (state.user?.role !== "admin") return;
  const [dashboard, products, users, orders, statuses] = await Promise.all([
    api("/admin/dashboard"),
    api("/admin/products"),
    api("/admin/users"),
    api("/admin/orders"),
    api("/admin/order-statuses"),
  ]);
  state.admin = {
    dashboard,
    products,
    users,
    orders,
    statuses: statuses.items,
  };
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
  navigate("/");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  render();
}

function appShell() {
  if (state.route === "auth") {
    return authShell();
  }
  if (state.route === "admin" && state.user?.role === "admin") {
    return adminShell();
  }
  return `
    <div class="announce">${t("announce")} ${clp(4500000)} ${state.lang === "ru" ? "по Чили" : state.lang === "pt" ? "no Chile" : "in Chile"}</div>
    <header class="topbar">
      <nav>
        <a href="#catalog">${t("catalog")}</a>
        <a href="#orders">${t("orders")}</a>
        ${state.user?.role === "admin" ? `<button class="nav-button" data-action="go-admin">${t("adminPanel")}</button>` : ""}
      </nav>
      <button class="brand" data-action="home">БьютиШоп <span>Чили</span></button>
      <div class="actions">
        <select class="lang-select" data-action="change-lang" aria-label="Language">
          <option value="en" ${state.lang === "en" ? "selected" : ""}>EN</option>
          <option value="pt" ${state.lang === "pt" ? "selected" : ""}>PT</option>
          <option value="ru" ${state.lang === "ru" ? "selected" : ""}>RU</option>
        </select>
        ${state.user ? `<span class="user">${state.user.email}</span>` : ""}
        ${state.user ? `<button class="ghost" data-action="logout">${t("logout")}</button>` : `<button class="ghost" data-action="go-auth">${t("login")}</button>`}
        <button class="cart-pill" data-action="open-cart">${t("bag")} ${state.cart.items.length}</button>
      </div>
    </header>
    <main>
      <section class="hero">
        <div class="hero-media" role="img" aria-label="Cosmetica premium"></div>
        <div class="hero-copy">
          <p class="eyebrow">${t("heroEyebrow")}</p>
          <h1>БьютиШоп Чили</h1>
          <p>${t("heroCopy")}</p>
          <div class="hero-actions">
            <a class="primary" href="#catalog">${t("shopNow")}</a>
            <button class="secondary" data-action="demo-login">${t("demoLogin")}</button>
          </div>
        </div>
      </section>
      <section class="strip">
        <span>${t("benefitDelivery")}</span>
        <span>${t("benefitCurrency")}</span>
        <span>${t("benefitCare")}</span>
        <span>${t("benefitCheckout")}</span>
      </section>
      ${catalog()}
      ${orders()}
    </main>
    ${cartDrawer()}
  `;
}

function authShell() {
  return `
    <main class="auth-page">
      <section class="auth-hero">
        <button class="brand" data-action="go-shop">БьютиШоп <span>Чили</span></button>
        <div>
          <p class="eyebrow">${t("account")}</p>
          <h1>${t("authTitle")}</h1>
          <p>${t("authSubtitle")}</p>
        </div>
        <button class="ghost" data-action="go-shop">${t("backToShop")}</button>
      </section>
      <section class="auth-panel" id="auth">
      <form class="panel" data-form="login">
        <h2>${t("authTitle")}</h2>
        <input name="email" type="email" placeholder="${t("email")}" value="demo@beautyshop.cl" required />
        <input name="password" type="password" placeholder="${t("password")}" value="demo1234" required />
        <button class="primary">${t("login")}</button>
      </form>
      <form class="panel" data-form="register">
        <h2>${t("createAccount")}</h2>
        <input name="email" type="email" placeholder="${t("email")}" required />
        <input name="password" type="password" placeholder="${t("minPassword")}" minlength="6" required />
        <input name="password_confirm" type="password" placeholder="${t("password")}" minlength="6" required />
        <button class="secondary">${t("register")}</button>
      </form>
      </section>
    </main>
  `;
}

function catalog() {
  return `
    <section class="section" id="catalog">
      <div class="section-head">
        <div>
          <p class="eyebrow">${t("catalog")}</p>
          <h2>${t("productTitle")}</h2>
        </div>
        <form class="filters" data-form="filters">
          <input name="q" placeholder="${t("searchPlaceholder")}" value="${state.filters.q}" />
          <select name="category">
            <option value="">${t("category")}</option>
            ${state.meta.categories.map((item) => `<option ${item === state.filters.category ? "selected" : ""}>${item}</option>`).join("")}
          </select>
          <select name="brand">
            <option value="">${t("brand")}</option>
            ${state.meta.brands.map((item) => `<option ${item === state.filters.brand ? "selected" : ""}>${item}</option>`).join("")}
          </select>
          <button class="icon" title="${t("searchPlaceholder")}">⌕</button>
        </form>
      </div>
      <div class="product-grid">
        ${state.products.map(productCard).join("") || `<p class="muted">${t("noProducts")}</p>`}
      </div>
    </section>
  `;
}

function productCard(product) {
  return `
    <article class="product">
      <div class="product-media">
        <img src="${product.image_url}" alt="${product.name}" />
      </div>
      <div class="product-body">
        <div class="meta-row">
          <span>${product.category?.name || "Beauty"}</span>
          <span>${product.brand?.name || ""}</span>
        </div>
        <h3>${product.name}</h3>
        <p>${product.description || ""}</p>
        <div class="buy-row">
          <strong>${clp(product.price_cents)}</strong>
          <div class="card-actions">
            <button class="primary small" data-action="add-cart" data-id="${product.id}">${t("add")}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function cartDrawer() {
  return `
    <div class="drawer-backdrop ${state.cartOpen ? "open" : ""}" data-action="close-cart"></div>
    <aside class="cart-drawer ${state.cartOpen ? "open" : ""}" id="cart" aria-hidden="${state.cartOpen ? "false" : "true"}">
      <div class="drawer-head">
        <div>
          <p class="eyebrow">${t("cart")}</p>
          <h2>${t("cartTitle")}</h2>
        </div>
        <button class="icon" title="${t("close")}" data-action="close-cart">×</button>
      </div>
      <div class="drawer-body">
        <div class="cart-list">
          ${state.cart.items.map((item) => `
            <div class="line">
              <img src="${item.product.image_url}" alt="${item.product.name}" />
              <div>
                <strong>${item.product.name}</strong>
                <span>${item.quantity} x ${clp(item.unit_price_cents)}</span>
              </div>
              <button class="icon" title="${t("remove")}" data-action="remove-cart" data-id="${item.id}">×</button>
            </div>
          `).join("") || `<p class="muted">${t("emptyCart")}</p>`}
        </div>
        <div class="summary">
          <span>${t("subtotal")}</span>
          <strong>${clp(state.cart.subtotal_cents)}</strong>
          <span>${t("shipping")}</span>
          <strong>${state.cart.items.length ? clp(399000) : clp(0)}</strong>
        </div>
        ${checkout()}
      </div>
    </aside>
  `;
}

function checkout() {
  if (!state.user || !state.cart.items.length) return "";
  return `
    <section class="checkout">
      <p class="eyebrow">${t("checkout")}</p>
      <h2>${t("deliveryData")}</h2>
      <form class="checkout-form" data-form="checkout">
        <input name="full_name" placeholder="${t("fullName")}" required />
        <input name="rut" placeholder="RUT" required />
        <input name="phone" placeholder="${t("phone")}" />
        <input name="city" placeholder="${t("city")}" value="Santiago" required />
        <input name="commune" placeholder="${t("commune")}" required />
        <input name="address_line1" placeholder="${t("address")}" required />
        <input name="postal_code" placeholder="${t("postalCode")}" />
        <button class="primary">${t("createOrder")}</button>
      </form>
    </section>
  `;
}

function orders() {
  if (!state.user) return "";
  return `
    <section class="section" id="orders">
      <p class="eyebrow">${t("account")}</p>
      <h2>${t("orderHistory")}</h2>
      <div class="order-grid">
        ${state.orders.map((order) => `
          <article class="order">
            <div class="meta-row"><span>#${order.id}</span><span>${order.status}</span></div>
            <strong>${clp(order.total_cents)}</strong>
            <p>${order.items.map((item) => `${item.quantity}x ${item.product_name_snapshot}`).join(", ")}</p>
            <button class="secondary small" data-action="pay" data-id="${order.id}">${t("pay")}</button>
          </article>
        `).join("") || `<p class="muted">${t("noOrders")}</p>`}
      </div>
    </section>
  `;
}

function adminShell() {
  const dashboard = state.admin.dashboard || {};
  return `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <button class="brand admin-brand" data-action="go-shop">БьютиШоп <span>Чили</span></button>
        <button class="admin-nav active" data-action="admin-scroll" data-target="overview">${t("dashboard")}</button>
        <button class="admin-nav" data-action="admin-scroll" data-target="inventory">${t("inventory")}</button>
        <button class="admin-nav" data-action="admin-scroll" data-target="orders-admin">${t("orders")}</button>
        <button class="admin-nav" data-action="admin-scroll" data-target="customers">${t("customers")}</button>
        <button class="admin-nav" data-action="go-shop">${t("storefront")}</button>
      </aside>
      <main class="admin-main">
        <header class="admin-top">
          <div>
            <p class="eyebrow">${t("operations")}</p>
            <h1>${t("adminPanel")}</h1>
          </div>
          <div class="actions">
            <select class="lang-select" data-action="change-lang" aria-label="Language">
              <option value="en" ${state.lang === "en" ? "selected" : ""}>EN</option>
              <option value="pt" ${state.lang === "pt" ? "selected" : ""}>PT</option>
              <option value="ru" ${state.lang === "ru" ? "selected" : ""}>RU</option>
            </select>
            <span class="user">${state.user.email}</span>
            <button class="ghost" data-action="logout">${t("logout")}</button>
          </div>
        </header>

        <section class="admin-section" id="overview">
          <div class="admin-metrics">
            <div><span>${t("revenue")}</span><strong>${clp(dashboard.revenue_cents || 0)}</strong></div>
            <div><span>${t("orders")}</span><strong>${dashboard.orders || 0}</strong></div>
            <div><span>${t("active")}</span><strong>${dashboard.active_products || 0}</strong></div>
            <div><span>${t("lowStock")}</span><strong>${dashboard.low_stock || 0}</strong></div>
            <div><span>${t("customers")}</span><strong>${dashboard.users || 0}</strong></div>
            <div><span>${t("hidden")}</span><strong>${dashboard.hidden_products || 0}</strong></div>
          </div>
        </section>

        <section class="admin-section admin-two-col" id="inventory">
          <form class="admin-form" data-form="admin-product">
            <h2>${t("newProduct")}</h2>
            <input name="name" placeholder="${t("name")}" required />
            <input name="category" placeholder="${t("category")}" required />
            <input name="brand" placeholder="${t("brand")}" required />
            <input name="price" type="number" min="1" placeholder="${t("price")}" required />
            <input name="amount" type="number" min="0" placeholder="${t("stockInput")}" value="10" required />
            <input name="image_url" placeholder="${t("imageUrl")}" />
            <textarea name="description" placeholder="${t("description")}"></textarea>
            <button class="primary">${t("addProduct")}</button>
          </form>
          <div class="admin-card">
            <div class="admin-card-head">
              <div>
                <p class="eyebrow">${t("inventory")}</p>
                <h2>${t("productManagement")}</h2>
              </div>
            </div>
            ${adminProductsTable()}
          </div>
        </section>

        <section class="admin-section" id="orders-admin">
          <div class="admin-card">
            <div class="admin-card-head">
              <div>
                <p class="eyebrow">${t("recentOrders")}</p>
                <h2>${t("orders")}</h2>
              </div>
            </div>
            ${adminOrdersTable()}
          </div>
        </section>

        <section class="admin-section" id="customers">
          <div class="admin-card">
            <div class="admin-card-head">
              <div>
                <p class="eyebrow">${t("customers")}</p>
                <h2>${t("users")}</h2>
              </div>
            </div>
            ${adminUsersTable()}
          </div>
        </section>
      </main>
    </div>
  `;
}

function adminProductsTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("name")}</th>
            <th>${t("category")}</th>
            <th>${t("brand")}</th>
            <th>${t("price")}</th>
            <th>${t("stockInput")}</th>
            <th>${t("imageUrl")}</th>
            <th>${t("description")}</th>
            <th>${t("status")}</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${state.admin.products.map((product) => `
            <tr class="${product.is_active ? "" : "muted-row"}">
              <td><input class="table-input" name="name" form="product-${product.id}" value="${escapeAttr(product.name)}" required /></td>
              <td><input class="table-input" name="category" form="product-${product.id}" value="${escapeAttr(product.category?.name || "")}" required /></td>
              <td><input class="table-input" name="brand" form="product-${product.id}" value="${escapeAttr(product.brand?.name || "")}" required /></td>
              <td><input class="table-input compact" name="price" form="product-${product.id}" type="number" min="1" value="${Math.round(product.price_cents / 100)}" required /></td>
              <td><input class="table-input compact" name="amount" form="product-${product.id}" type="number" min="0" value="${product.amount}" required /></td>
              <td><input class="table-input wide" name="image_url" form="product-${product.id}" value="${escapeAttr(product.image_url || "")}" /></td>
              <td><input class="table-input wide" name="description" form="product-${product.id}" value="${escapeAttr(product.description || "")}" /></td>
              <td>
                <select class="status-select" name="is_active" form="product-${product.id}">
                  <option value="true" ${product.is_active ? "selected" : ""}>${t("active")}</option>
                  <option value="false" ${!product.is_active ? "selected" : ""}>${t("hidden")}</option>
                </select>
              </td>
              <td class="row-actions">
                <form id="product-${product.id}" data-form="admin-product-update" data-id="${product.id}"></form>
                <button class="secondary small" type="submit" form="product-${product.id}">${t("save")}</button>
                <button class="danger small" data-action="delete-product" data-id="${product.id}">${t("delete")}</button>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function adminOrdersTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>${t("order")}</th>
            <th>${t("customer")}</th>
            <th>${t("items")}</th>
            <th>${t("total")}</th>
            <th>${t("status")}</th>
          </tr>
        </thead>
        <tbody>
          ${state.admin.orders.map((order) => `
            <tr>
              <td><strong>#${order.id}</strong></td>
              <td>#${order.user_id}</td>
              <td>${order.items.map((item) => `${item.quantity}x ${item.product_name_snapshot}`).join(", ")}</td>
              <td>${clp(order.total_cents)}</td>
              <td>
                <select class="status-select" data-action="order-status" data-id="${order.id}">
                  ${state.admin.statuses.map((status) => `<option value="${status}" ${status === order.status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
              </td>
            </tr>
          `).join("") || `<tr><td colspan="5">${t("noOrders")}</td></tr>`}
        </tbody>
      </table>
    </div>
  `;
}

function adminUsersTable() {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>${t("email")}</th>
            <th>${t("role")}</th>
            <th>${t("status")}</th>
          </tr>
        </thead>
        <tbody>
          ${state.admin.users.map((user) => `
            <tr>
              <td>${user.id}</td>
              <td><strong>${user.email}</strong></td>
              <td>${roleLabel(user.role)}</td>
              <td><span class="status ${user.is_active ? "ok" : "off"}">${user.is_active ? t("active") : t("hidden")}</span></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function render() {
  document.querySelector("#app").innerHTML = appShell();
}

document.addEventListener("submit", async (event) => {
  const form = event.target.closest("form");
  if (!form) return;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  try {
    if (form.dataset.form === "login" || form.dataset.form === "register") {
      if (form.dataset.form === "register") {
        if (data.password !== data.password_confirm) {
          throw new Error(state.lang === "ru" ? "Пароли не совпадают" : state.lang === "pt" ? "As senhas nao coincidem" : "Passwords do not match");
        }
        delete data.password_confirm;
      }
      setTokens(await api(`/auth/${form.dataset.form}`, { method: "POST", body: JSON.stringify(data) }));
      await loadBase();
      if (state.user?.role === "admin") {
        await loadAdminData();
        navigate("/admin");
        render();
      } else {
        navigate("/");
        render();
      }
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
      alert(`${t("orderCreated")} ${payment.checkout_url}`);
      await Promise.all([loadCart(), loadOrders()]);
      render();
    }
    if (form.dataset.form === "admin-product") {
      await api("/admin/products", {
        method: "POST",
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          brand: data.brand,
          description: data.description,
          amount: Number(data.amount || 0),
          price_cents: Number(data.price) * 100,
          image_url: data.image_url || "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
        }),
      });
      form.reset();
      await Promise.all([loadBase(), loadAdminData()]);
      render();
    }
    if (form.dataset.form === "admin-product-update") {
      await api(`/admin/products/${form.dataset.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: data.name,
          category: data.category,
          brand: data.brand,
          description: data.description,
          amount: Number(data.amount || 0),
          price_cents: Number(data.price) * 100,
          image_url: data.image_url,
          is_active: data.is_active === "true",
        }),
      });
      await Promise.all([loadBase(), loadAdminData()]);
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
    if (action === "go-auth") {
      navigate("/auth");
      render();
    }
    if (action === "go-admin") {
      if (state.user?.role !== "admin") return;
      navigate("/admin");
      await loadAdminData();
      render();
    }
    if (action === "go-shop") {
      navigate("/");
      render();
    }
    if (action === "admin-scroll") {
      document.querySelector(`#${target.dataset.target}`)?.scrollIntoView({ behavior: "smooth" });
    }
    if (action === "open-cart") {
      state.cartOpen = true;
      render();
    }
    if (action === "close-cart") {
      state.cartOpen = false;
      render();
    }
    if (action === "demo-login") {
      setTokens(await api("/auth/login", { method: "POST", body: JSON.stringify({ email: "demo@beautyshop.cl", password: "demo1234" }) }));
      await loadBase();
    }
    if (action === "add-cart") {
      if (!state.user) {
        navigate("/auth");
        return render();
      }
      await api("/cart/items", { method: "POST", body: JSON.stringify({ product_id: Number(target.dataset.id), quantity: 1 }) });
      await loadCart();
      state.cartOpen = true;
      render();
    }
    if (action === "remove-cart") {
      await api(`/cart/items/${target.dataset.id}`, { method: "DELETE" });
      await loadCart();
      state.cartOpen = true;
      render();
    }
    if (action === "pay") {
      const payment = await api("/payments/create", { method: "POST", body: JSON.stringify({ order_id: Number(target.dataset.id) }) });
      alert(`${t("demoCheckout")} ${payment.checkout_url}`);
    }
    if (action === "delete-product") {
      if (!confirm(t("confirmDelete"))) return;
      await api(`/admin/products/${target.dataset.id}`, { method: "DELETE" });
      await Promise.all([loadBase(), loadAdminData()]);
      render();
    }
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener("change", async (event) => {
  const target = event.target.closest("[data-action='change-lang']");
  const statusTarget = event.target.closest("[data-action='order-status']");
  try {
    if (target) {
      state.lang = target.value;
      localStorage.setItem("lang", state.lang);
      render();
    }
    if (statusTarget) {
      await api(`/admin/orders/${statusTarget.dataset.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: statusTarget.value }),
      });
      await loadAdminData();
      render();
    }
  } catch (error) {
    alert(error.message);
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || !state.cartOpen) return;
  state.cartOpen = false;
  render();
});

window.addEventListener("popstate", async () => {
  state.route = routeFromPath();
  if (state.route === "admin" && state.user?.role === "admin") {
    await loadAdminData();
  }
  render();
});

loadBase().catch((error) => {
  document.querySelector("#app").innerHTML = `<main class="error"><h1>${t("apiUnavailable")}</h1><p>${error.message}</p><p>${t("startBackend")} ${API}</p></main>`;
});

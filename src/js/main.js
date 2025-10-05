let allProductsCache = [];
let currentSortType = "default";
let currentPage = 1;
let selectedProduct = null;

// ====================== ROUTES ======================

const routes = {
  "/": "pages/home.html",
  "/about": "pages/about.html",
  "/cart": "pages/cart.html",
  "/catalog": "pages/catalog.html",
  "/contact": "pages/contact.html",
  "/product": "pages/product-details-template.html",
};

function getCurrentPath() {
  return window.location.hash.slice(1) || "/";
}

// ====================== UPDATE ACTIVE LINK ======================
function updateActiveLink() {
  const currentPath = window.location.hash.slice(1) || "/";
  const links = document.querySelectorAll(".header-nav a");
  if (!links.length) return;
  links.forEach((link) => {
    const href = link.getAttribute("href");
    link.classList.toggle("active", href === "#" + currentPath);
  });
}

// ====================== LOAD HTML ======================
async function loadHTML(selector, path) {
  const container = document.querySelector(selector);
  if (!container) return;
  try {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to load ${path}`);
    const html = await res.text();
    container.innerHTML = html;
  } catch (err) {
    console.error(err);
  }
}

// ====================== SWIPER INIT ======================
function initSwiper(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const swiper = new Swiper(selector, {
    slidesPerView: "auto",
    freeMode: true,
    loop: false,
    spaceBetween: 38,
    slidesOffsetBefore: 20,
    slidesOffsetAfter: 20,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  if (!swiper) return;
}

// ====================== TRAVEL SWIPER INIT ======================
function initTravelsSwiper() {
  const selector = ".suitcase-grid";
  const container = document.querySelector(selector);
  if (!container) return;

  const swiper = new Swiper(selector, {
    slidesPerView: "auto",
    freeMode: true,
    loop: false,
    spaceBetween: 38,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  if (!swiper) return;
}

// ====================== GALLERY SWIPER INIT ======================
function initGallerySwiper() {
  const selector = ".product-gallery .thumbs";
  const container = document.querySelector(selector);
  if (!container) return;

  const swiper = new Swiper(selector, {
    slidesPerView: "auto",
    freeMode: true,
    loop: false,
    spaceBetween: 15,
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });

  if (!swiper) return;
}

// ====================== NAVIGATE ======================
async function navigate(path) {
  const content = document.querySelector(".main");
  const pagePath = routes[path] || routes["/"];
  try {
    const res = await fetch(pagePath);
    const html = await res.text();
    content.innerHTML = html;

    updateActiveLink();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });

    switch (path) {
      case "/": {
        await loadProductCards(
          ".selected-products-container",
          "Selected Products"
        );
        await loadProductCards(
          ".products-arrival-container",
          "New Products Arrival"
        );

        initSwiper(".selected-products-swiper");
        initSwiper(".products-arrival-swiper");
        initTravelsSwiper();

        initAddToCart(".selected-products-container");
        initAddToCart(".products-arrival-container");

        initProductCardClick(".product-card");
        break;
      }

      case "/catalog": {
        await loadBestProductCards(".best-products-container", "Top Best Sets");
        await loadAllProductCards(".products-container");
        initAddToCart(".products-container");
        initProductCardClick(".product-card");
        initProductCardClick(".best-product-card");

        const sortSelect = document.getElementById("sort-select");
        if (sortSelect) {
          sortSelect.addEventListener("change", (e) => {
            loadAllProductCards(
              ".products-container",
              e.target.value,
              currentPage
            );
          });
        }
        initSearchModelsHandler();
        initSearchHandler();
        break;
      }

      case "/product": {
        if (!selectedProduct) {
          const saved = localStorage.getItem("selectedProduct");
          if (saved) {
            selectedProduct = JSON.parse(saved);
          }
        }
        loadProductDetails(selectedProduct);
        await loadProductCards(".products-like-container", "You May Also Like");
        initSwiper(".products-like-swiper");
        initAddToCart(".products-like-swiper");
        initTabs();
        initRequiredSpanHandler();
        initProductPageAddToCart();
        initReviewFormValidation();
        initGallerySwiper();
        break;
      }

      case "/cart": {
        loadCart();
        break;
      }

      case "/contact": {
        initContactFormValidation();
        break;
      }
    }
  } catch (err) {
    content.innerHTML = "<h1>Page not found</h1>";
    console.error(err);
  }
}

// ====================== HASH NAVIGATION ======================
document.querySelector(".header").addEventListener("click", (e) => {
  const link = e.target.closest("a");
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href.startsWith("/")) return;
  e.preventDefault();
  window.location.hash = href;
});

window.addEventListener("hashchange", () => {
  navigate(getCurrentPath());
});

// ====================== INIT CONTENT ======================
async function init() {
  await loadHTML(".header", "/src/components/header.html");
  await loadHTML(".footer", "/src/components/footer.html");

  initModalWindow();

  const savedProduct = localStorage.getItem("selectedProduct");
  if (savedProduct) {
    selectedProduct = JSON.parse(savedProduct);
  }

  updateCartBadge(getCartCount());
  navigate(getCurrentPath());
}

init();

// ====================== PRODUCT CARD CLICK ======================

function initProductCardClick(selector) {
  document.addEventListener("click", async (e) => {
    const card = e.target.closest(selector);
    if (!card) return;

    const raw = card.dataset.product;
    if (!raw) return;

    try {
      const productData = JSON.parse(decodeURIComponent(raw));
      selectedProduct = productData;
      localStorage.setItem("selectedProduct", JSON.stringify(selectedProduct));

      if (getCurrentPath() === "/product") {
        loadProductDetails(selectedProduct);
        await loadProductCards(".products-like-container", "You May Also Like");
        initSwiper(".products-like-swiper");
        initTabs();
        initRequiredSpanHandler();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        window.location.hash = "/product";
      }
    } catch (err) {
      console.error("Invalid product data", err);
    }
  });
}

// ====================== PRODUCT CARD LOADING ======================
async function loadProductCards(containerSelector, blockName) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
  const isSwiper = container.classList.contains("swiper-wrapper");

  try {
    const res = await fetch("/src/assets/data.json");
    if (!res.ok) throw new Error("Failed to load JSON");
    const { data } = await res.json();

    let products = data;
    if (blockName)
      products = data.filter((item) => item.blocks.includes(blockName));

    const templateRes = await fetch("/src/components/product-card.html");
    if (!templateRes.ok)
      throw new Error("Failed to load template product-card.html");
    const templateHTML = await templateRes.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = templateHTML.trim();
    const template = tempDiv.querySelector("#product-card-template");

    container.innerHTML = "";
    products.forEach((product) => {
      const clone = template.content.cloneNode(true);
      const productCard = clone.querySelector(".product-card");
      if (isSwiper) productCard.classList.add("swiper-slide");

      clone.querySelector(".image").src = product.imageUrl;
      clone.querySelector(".image").alt = product.name;
      clone.querySelector(".name").textContent = product.name;
      clone.querySelector(".price").textContent = `$${product.price}`;

      const badge = clone.querySelector(".badge");
      if (product.salesStatus) badge.textContent = "Sale";
      else badge.remove();

      productCard.dataset.product = encodeURIComponent(JSON.stringify(product));
      container.appendChild(clone);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load products</p>";
  }
}

// ====================== BEST PRODUCT CARDS ======================
async function loadBestProductCards(containerSelector, blockName) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  try {
    const res = await fetch("/src/assets/data.json");
    if (!res.ok) throw new Error("Failed to load JSON");
    const { data } = await res.json();

    let products = data;
    if (blockName)
      products = data.filter((item) => item.blocks.includes(blockName));

    const templateRes = await fetch("/src/components/product-card.html");
    if (!templateRes.ok)
      throw new Error("Failed to load template product-card.html");
    const templateHTML = await templateRes.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = templateHTML.trim();
    const template = tempDiv.querySelector("#best-product-card-template");

    container.innerHTML = "";
    products.forEach((product) => {
      const clone = template.content.cloneNode(true);
      const productCard = clone.querySelector(".best-product-card");

      clone.querySelector(".image").src = product.imageUrl;
      clone.querySelector(".image").alt = product.name;
      clone.querySelector(".name").textContent = product.name;
      clone.querySelector(".price").textContent = `$${product.price}`;

      const ratingEl = clone.querySelector(".rating");
      renderStars(ratingEl, product.rating);

      productCard.dataset.product = encodeURIComponent(JSON.stringify(product));
      container.appendChild(clone);
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load products</p>";
  }
}

// ====================== ALL PRODUCT CARDS ======================
async function loadAllProductCards(
  containerSelector,
  sortType = currentSortType,
  page = currentPage,
  perPage = 12
) {
  currentSortType = sortType;
  currentPage = page;

  const container = document.querySelector(containerSelector);
  if (!container) return;

  try {
    if (!allProductsCache.length) {
      const res = await fetch("/src/assets/data.json");
      if (!res.ok) throw new Error("Failed to load JSON");
      const { data } = await res.json();
      allProductsCache = data;
    }

    let products = [...allProductsCache];
    switch (sortType) {
      case "price-asc": {
        products.sort((a, b) => a.price - b.price);
        break;
      }
      case "price-desc": {
        products.sort((a, b) => b.price - a.price);
        break;
      }
      case "popularity": {
        products.sort((a, b) => b.popularity - a.popularity);
        break;
      }
      case "rating": {
        products.sort((a, b) => b.rating - a.rating);
        break;
      }
      default:
        break;
    }

    const totalPages = Math.ceil(products.length / perPage);
    const start = (page - 1) * perPage;
    const end = Math.min(start + perPage, products.length);
    const paginatedProducts = products.slice(start, end);

    const templateRes = await fetch("/src/components/product-card.html");
    const templateHTML = await templateRes.text();
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = templateHTML.trim();
    const template = tempDiv.querySelector("#product-card-template");

    container.innerHTML = "";
    paginatedProducts.forEach((product) => {
      const clone = template.content.cloneNode(true);

      const productCard = clone.querySelector(".product-card");

      clone.querySelector(".image").src = product.imageUrl;
      clone.querySelector(".image").alt = product.name;
      clone.querySelector(".name").textContent = product.name;
      clone.querySelector(".price").textContent = `$${product.price}`;

      const badge = clone.querySelector(".badge");
      if (product.salesStatus) {
        badge.textContent = "Sale";
      } else {
        badge.remove();
      }

      productCard.dataset.product = encodeURIComponent(JSON.stringify(product));

      container.appendChild(clone);
    });

    updateResultsInfo(start + 1, end, products.length);

    renderPagination(container, totalPages, page, (newPage) => {
      loadAllProductCards(containerSelector, currentSortType, newPage, perPage);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Failed to load products</p>";
  }
}

// ====================== PAGINATION ======================

function renderPagination(container, totalPages, currentPage, onPageChange) {
  let pagination =
    container.parentElement.parentElement.querySelector(".pagination");
  pagination.innerHTML = "";
  if (totalPages <= 1) return;

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement("button");
    btn.textContent = i;
    btn.className = i === currentPage ? "active" : "";
    btn.addEventListener("click", () => onPageChange(i));
    pagination.appendChild(btn);
  }

  const navBtn = document.createElement("button");
  navBtn.textContent = currentPage === 1 ? "Next" : "Previous";
  navBtn.className = "nav-btn";
  navBtn.addEventListener("click", () => {
    const newPage = currentPage === 1 ? currentPage + 1 : currentPage - 1;
    onPageChange(newPage);
  });
  pagination.appendChild(navBtn);
}

// ====================== RESULT INFO ======================

function updateResultsInfo(from, to, total) {
  const info = document.querySelector(".results-info");
  if (!info) return;
  info.textContent = `Showing ${from}–${to} of ${total} Results`;
}

// ====================== PRODUCT DETAILS ======================
function loadProductDetails(product) {
  if (!product) return;

  const mainImage = document.querySelector(".product-gallery .main-image img");
  const thumbs = document.querySelectorAll(".thumbs .wrapper-thumb img");
  const title = document.querySelector(".product-title");
  const price = document.querySelector(".product-price span");
  const starsContainer = document.querySelector(".product-rating .stars");

  if (!mainImage || !title || !price) return;

  mainImage.src = product.imageUrl;
  mainImage.alt = product.name;

  thumbs.forEach((thumb) => {
    thumb.src = product.imageUrl;
    thumb.alt = product.name;
  });

  title.textContent = product.name;
  price.textContent = `$${product.price}`;
  renderStars(starsContainer, product.rating);
}

// ====================== STARS ======================
function renderStars(container, rating) {
  const maxStars = 5;
  container.innerHTML = "";
  for (let i = 1; i <= maxStars; i++) {
    const star = document.createElement("span");
    if (rating >= i) star.className = "star full";
    else if (rating >= i - 0.5) star.className = "star half";
    else star.className = "star empty";
    container.appendChild(star);
  }
}

// ====================== REQUIRED FIELD HANDLER ======================
function initRequiredSpanHandler() {
  const fields = document.querySelectorAll(
    ".form-row input, .form-textarea textarea"
  );
  fields.forEach((field) => {
    const requiredSpan = field.parentElement.querySelector(".required");
    if (!requiredSpan) return;
    const originalPlaceholder = field.getAttribute("placeholder") || "";

    field.addEventListener("focus", () => {
      field.setAttribute("placeholder", "");
      requiredSpan.style.display = "none";
    });

    field.addEventListener("blur", () => {
      field.value = field.value.trim();
      if (field.value === "") {
        field.setAttribute("placeholder", originalPlaceholder);
        requiredSpan.style.display = "inline";
      } else {
        requiredSpan.style.display = "none";
      }
    });

    field.addEventListener("input", () => {
      requiredSpan.style.display = field.value.length === 0 ? "inline" : "none";
    });
  });
}

// ====================== SEARCH FIELD HANDLER ======================
function initSearchModelsHandler() {
  const field = document.querySelector("#search-models");
  if (!field) return;
  const searchIcon = field.parentElement.querySelector(".search-icon");
  if (!searchIcon) return;

  const originalPlaceholder = field.getAttribute("placeholder") || "";

  field.addEventListener("focus", () => {
    field.setAttribute("placeholder", "");
    searchIcon.style.display = "none";
  });

  field.addEventListener("blur", () => {
    field.value = field.value.trim();
    if (field.value === "") {
      field.setAttribute("placeholder", originalPlaceholder);
      searchIcon.style.display = "inline";
    } else {
      searchIcon.style.display = "none";
    }
  });

  field.addEventListener("input", () => {
    searchIcon.style.display = field.value.length === 0 ? "inline" : "none";
  });
}

// ====================== TABS ======================
function initTabs() {
  const tabButtons = document.querySelectorAll(".tabs-nav li");
  const tabPanels = document.querySelectorAll(".tabs-content > section");
  if (!tabButtons.length || !tabPanels.length) return;

  tabButtons.forEach((btn, i) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      tabButtons.forEach((b) => b.classList.remove("active"));
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      tabPanels[i].classList.add("active");
    });
  });
}

// ====================== INIT ADD TO CART ======================
function initAddToCart(containerSelector) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = e.target.closest(".btn");
    if (!btn) return;
    e.stopPropagation();

    showTooltip(btn);

    const card = btn.closest("[data-product]");
    if (!card) return;

    let product;
    try {
      product = JSON.parse(decodeURIComponent(card.dataset.product));
    } catch (err) {
      console.error("Invalid data-product format", err);
      return;
    }

    addProductToCart(product);
    updateCartBadge(getCartCount());
  });
}

// ====================== ADD TO CART ======================
function addProductToCart(product) {
  console.log(product);
  const key = "cart";
  const cart = JSON.parse(localStorage.getItem(key)) || [];

  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  localStorage.setItem(key, JSON.stringify(cart));
}

// ====================== CART COUNT======================
function getCartCount() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
}

// ====================== CART BADGE======================
function updateCartBadge(count) {
  const badge = document.querySelector(".cart-badge");
  if (!badge) return;

  if (count > 0) {
    badge.textContent = count;
    badge.style.display = "grid";
  } else {
    badge.style.display = "none";
  }
}

// ====================== CART ======================
function loadCart() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const tbody = document.querySelector(".cart-body");
  const template = document.querySelector("#cart-item-template")?.content;

  if (!tbody || !template) return;

  tbody.innerHTML = "";

  let subtotal = 0;

  cart.forEach((item) => {
    const clone = template.cloneNode(true);
    const row = clone.querySelector("tr");
    if (row) {
      row.dataset.productId = item.id;
    }

    clone.querySelector(".image").src = item.imageUrl;
    clone.querySelector(".image").alt = item.name;
    clone.querySelector(".name").textContent = item.name;
    clone.querySelector(".price").textContent = `$${item.price}`;
    clone.querySelector(".qty").textContent = item.qty;
    clone.querySelector(".total").textContent = `$${item.price * item.qty}`;

    tbody.appendChild(clone);
    subtotal += item.price * item.qty;
  });

  updateCartSummary(subtotal);
}

// ====================== UPDATE ROW ======================
function updateRow(product) {
  const row = document.querySelector(`tr[data-product-id="${product.id}"]`);
  if (!row) return;

  row.querySelector(".qty").textContent = product.qty;
  row.querySelector(".total").textContent = `$${product.qty * product.price}`;
}

// ====================== UPDATE CART SUMMARY ======================
function updateCartSummary(subtotal) {
  const subtotalElem = document.querySelector(".subtotal");
  const discountElem = document.querySelector(".discount");
  const shippingElem = document.querySelector(".shipping");
  const summaryElem = document.querySelector(".summary");

  const DELIVERY_COST_PER_ITEM = 30;
  let discountPercent = 0;

  if (subtotal >= 10000) {
    discountPercent = 30;
  } else if (subtotal >= 5000) {
    discountPercent = 20;
  } else if (subtotal >= 3000) {
    discountPercent = 15;
  } else if (subtotal >= 2000) {
    discountPercent = 10;
  } else if (subtotal >= 1000) {
    discountPercent = 5;
  }

  const discountAmount = (subtotal * discountPercent) / 100;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const deliveryTotal = getCartCount() * DELIVERY_COST_PER_ITEM;
  const grandTotal = subtotalAfterDiscount + deliveryTotal;

  if (subtotalElem) subtotalElem.textContent = `$${subtotal}`;
  if (discountElem) discountElem.textContent = `$${discountAmount}`;
  if (shippingElem) shippingElem.textContent = `$${deliveryTotal}`;
  if (summaryElem) summaryElem.textContent = `$${grandTotal}`;

  const discountRow = document.querySelector(".discount-row");
  if (!discountRow) return;
  if (discountAmount === 0) {
    discountRow.classList.add("hidden");
  } else {
    discountRow.classList.remove("hidden");
  }
}

// ====================== CART EVENT HANDLERS ======================
function handleQtyPlus(product) {
  product.qty += 1;
  updateRow(product);
}

function handleQtyMinus(product) {
  if (product.qty > 1) {
    product.qty -= 1;
    updateRow(product);
  }
}

function handleDelete(productIndex, row, cart) {
  cart.splice(productIndex, 1);
  row.remove();
}

function handleClearCart(cart) {
  cart.length = 0;
  document.querySelector(".cart-body").innerHTML = "";
}

function handleContinueShopping() {
  window.location.hash = "/catalog";
}

function handleCheckout(cart) {
  const totalEl = document.querySelector(".cart-summary .summary");
  const total = totalEl
    ? parseFloat(totalEl.textContent.replace(/[^0-9.-]+/g, ""))
    : 0;

  if (total > 0) {
    alert(`Thank you for your purchase! Your total is ${total}.`);
    localStorage.removeItem("cart");
    document.querySelector(".cart-body").innerHTML = "";
    updateCartBadge(0);
    updateCartSummary(0);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  } else {
    alert("Your cart is empty. Add some products before checkout.");
  }
}

document.addEventListener("click", (e) => {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const row = e.target.closest("tr[data-product-id]");
  const productId = row?.dataset.productId;
  const productIndex = cart.findIndex((item) => item.id == productId);
  const product = productIndex !== -1 ? cart[productIndex] : null;

  if (e.target.closest(".qty-plus") && product) handleQtyPlus(product);
  if (e.target.closest(".qty-minus") && product) handleQtyMinus(product);
  if (e.target.closest(".cart-delete") && product)
    handleDelete(productIndex, row, cart);
  if (e.target.closest(".cart .clear")) handleClearCart(cart);
  if (e.target.closest(".cart .continue")) handleContinueShopping();
  if (e.target.closest(".cart-summary .checkout")) handleCheckout(cart);

  if (
    e.target.closest(".qty-plus") ||
    e.target.closest(".qty-minus") ||
    e.target.closest(".cart-delete") ||
    e.target.closest(".cart .clear")
  ) {
    localStorage.setItem("cart", JSON.stringify(cart));
    const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
    updateCartSummary(subtotal);
    updateCartBadge(getCartCount());
  }

  if (e.target.closest(".cart .clear")) {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }
});

// ====================== PRODUCT DEETAILS ======================
function initProductPageAddToCart() {
  const form = document.querySelector(".product-options");
  if (!form) return;

  const sizeSelect = form.querySelector("#sizeSelect");
  const colorSelect = form.querySelector("#colorSelect");
  const categorySelect = form.querySelector("#categorySelect");

  [sizeSelect, colorSelect, categorySelect].forEach((select) => {
    if (!select.parentElement.querySelector(".error-message")) {
      const small = document.createElement("small");
      small.classList.add("error-message");
      select.parentElement.appendChild(small);
    }
  });

  function showError(select, message) {
    select.classList.add("error");
    const small = select.parentElement.querySelector(".error-message");
    if (small) small.textContent = message;
  }

  function clearError(select) {
    select.classList.remove("error");
    const small = select.parentElement.querySelector(".error-message");
    if (small) small.textContent = "";
  }

  function checkSelect(select, fieldName) {
    if (!select.value) {
      showError(select, `Please select a ${fieldName}.`);
      return false;
    }
    clearError(select);
    return true;
  }

  [sizeSelect, colorSelect, categorySelect].forEach((select) => {
    select.addEventListener("change", () => {
      if (select === sizeSelect) checkSelect(sizeSelect, "size");
      if (select === colorSelect) checkSelect(colorSelect, "color");
      if (select === categorySelect) checkSelect(categorySelect, "category");
    });
  });

  const qtyEl = form.querySelector(".quantity .qty");
  const plusBtn = form.querySelector(".quantity .qty-plus");
  const minusBtn = form.querySelector(".quantity .qty-minus");

  let qty = 1;

  plusBtn.addEventListener("click", () => {
    qty++;
    qtyEl.textContent = qty;
  });

  minusBtn.addEventListener("click", () => {
    if (qty > 1) {
      qty--;
      qtyEl.textContent = qty;
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const valid =
      checkSelect(sizeSelect, "size") &&
      checkSelect(colorSelect, "color") &&
      checkSelect(categorySelect, "category");

    if (!valid) return;

    if (!selectedProduct) return;

    const productWithOptions = {
      ...selectedProduct,
      qty,
    };

    const key = "cart";
    let cart = JSON.parse(localStorage.getItem(key)) || [];

    const existingIndex = cart.findIndex(
      (item) => item.id === productWithOptions.id
    );

    if (existingIndex !== -1) {
      cart[existingIndex].qty += qty;
    } else {
      cart.push(productWithOptions);
    }

    localStorage.setItem(key, JSON.stringify(cart));
    updateCartBadge(getCartCount());

    alert("Product added to cart successfully!");

    form.reset();
    qty = 1;
    qtyEl.textContent = qty;
    [sizeSelect, colorSelect, categorySelect].forEach(clearError);
  });
}

// ====================== TOOLTIP ======================
function showTooltip(btn) {
  let tooltip = document.querySelector(".tooltip");
  if (!tooltip) {
    tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    tooltip.textContent = "Product added to cart!";
    document.body.appendChild(tooltip);
  }
  const rect = btn.getBoundingClientRect();
  tooltip.style.top = rect.bottom + 8 + "px";
  tooltip.style.left = rect.left + "px";

  requestAnimationFrame(() => {
    tooltip.classList.add("show");
  });

  clearTimeout(tooltip.hideTimeout);
  tooltip.hideTimeout = setTimeout(() => {
    tooltip.classList.remove("show");
  }, 1000);
}

// ====================== FORM FEADBACK ======================
function showError(input, message) {
  const small = input.parentElement.querySelector(".error-message");
  small.textContent = message;
  input.classList.add("error");
}

function clearError(input) {
  const small = input.parentElement.querySelector(".error-message");
  small.textContent = "";
  input.classList.remove("error");
}

function checkName() {
  const value = nameInput.value.trim();
  if (value.length < 2) {
    showError(nameInput, "Name must be at least 2 characters.");
    return false;
  }
  clearError(nameInput);
  return true;
}

function checkEmail() {
  const value = emailInput.value.trim();
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(value)) {
    showError(emailInput, "Enter a valid email address.");
    return false;
  }
  clearError(emailInput);
  return true;
}

function initContactFormValidation() {
  const form = document.getElementById("feedback-form");
  if (!form) return;

  const nameInput = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  const topicInput = form.querySelector("#topic");
  const messageInput = form.querySelector("#message");

  function checkTopic() {
    if (topicInput.value.trim() === "") {
      showError(topicInput, "Topic is required.");
      return false;
    }
    clearError(topicInput);
    return true;
  }

  function checkMessage() {
    const value = messageInput.value.trim();
    if (value.length < 10) {
      showError(messageInput, "Message must be at least 10 characters.");
      return false;
    }
    clearError(messageInput);
    return true;
  }

  [nameInput, emailInput, topicInput, messageInput].forEach((input) =>
    input.addEventListener("blur", () => {
      if (input === nameInput) checkName();
      if (input === emailInput) checkEmail();
      if (input === topicInput) checkTopic();
      if (input === messageInput) checkMessage();
    })
  );

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const valid = checkName() && checkEmail() && checkTopic() && checkMessage();
    if (valid) {
      alert("Form sent successfully!");
      form.reset();
    }
  });
}

// ====================== FORM REVIEW ======================
function initReviewFormValidation() {
  const form = document.querySelector(".review-form form");
  if (!form) return;

  const reviewInput = form.querySelector("#review-text");
  const nameInput = form.querySelector("#review-name");
  const emailInput = form.querySelector("#review-email");

  function checkReview() {
    const value = reviewInput.value.trim();
    if (value.length < 10) {
      showError(reviewInput, "Review must be at least 10 characters.");
      return false;
    }
    clearError(reviewInput);
    return true;
  }

  [reviewInput, nameInput, emailInput].forEach((input) => {
    input.addEventListener("blur", () => {
      if (input === reviewInput) checkReview();
      if (input === nameInput) checkName();
      if (input === emailInput) checkEmail();
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid = checkReview() && checkName() && checkEmail();
    if (valid) {
      alert("Review submitted successfully!");
      form.reset();
    }
  });
}

// ====================== SEARCH ======================
function initSearchHandler() {
  const searchInput = document.querySelector("#search-models");
  if (!searchInput) return;

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) return;

      const found = allProductsCache.find(
        (item) =>
          item.id.toLowerCase() === query ||
          item.name.toLowerCase().includes(query)
      );

      if (found) {
        selectedProduct = found;
        localStorage.setItem("selectedProduct", JSON.stringify(found));
        window.location.hash = "/product";
      } else {
        alert("Product not found!");
      }
    }
  });
}

// ====================== MODAL ======================
function initModalWindow() {
  const body = document.body;
  const modal = document.querySelector(".modal");
  const openBtn = document.querySelector(".fa-user");
  const closeBtn = document.querySelector(".modal-close");
  const overlay = document.querySelector(".overlay");
  const modalForm = document.querySelector(".modal-form");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  openBtn.addEventListener("click", (e) => {
    e.preventDefault();
    modal.style.display = "flex";
    body.style.overflow = "hidden";
  });

  closeBtn.addEventListener("click", () => {
    modalForm.reset();
    clearError(emailInput);
    clearError(passwordInput);
    modal.style.display = "none";
    body.style.overflow = "visible";
  });

  overlay.addEventListener("click", () => {
    modalForm.reset();
    clearError(emailInput);
    clearError(passwordInput);
    modal.style.display = "none";
    body.style.overflow = "visible";
  });

  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const valid = checkEmail() && checkPassword();
    if (valid) {
      alert("Successfully logged in!");
      modalForm.reset();
      modal.style.display = "none";
      body.style.overflow = "visible";
    }
  });

  function checkPassword() {
    const value = passwordInput.value.trim();
    if (value.length < 6) {
      showError(passwordInput, "Password must be at least 6 characters.");
      return false;
    }
    clearError(passwordInput);
    return true;
  }

  [emailInput, passwordInput].forEach((input) =>
    input.addEventListener("blur", () => {
      if (input === emailInput) checkEmail();
      if (input === passwordInput) checkPassword();
    })
  );
}

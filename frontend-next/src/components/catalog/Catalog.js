import { useMemo, useState } from "react";

const number = new Intl.NumberFormat("ru-RU", {
  maximumFractionDigits: 0,
});

function list(value) {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  return String(value).split(",").filter(Boolean);
}

function FilterGroup({ label, options, selected, onToggle, searchPlaceholder }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const visibleOptions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return options;
    return options.filter((item) => item.toLowerCase().includes(term));
  }, [options, query]);

  return (
    <div className={`filter-block${open ? " open" : ""}`}>
      <button className="filter-trigger" type="button" onClick={() => setOpen((value) => !value)}>
        <span>{label}</span>
        <strong>{selected.length ? selected.length : ""}</strong>
        <i aria-hidden="true">›</i>
      </button>
      <div className="filter-field">
        <input
          aria-label={label}
          disabled={!open}
          placeholder={searchPlaceholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>
      {open && (
        <div className="filter-options">
          {visibleOptions.map((item) => (
            <button
              className={selected.includes(item) ? "active" : ""}
              key={item}
              type="button"
              onClick={() => onToggle(item)}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Catalog({ products, meta, filters, setFilters, t, addCart }) {
  const selectedCategories = list(filters.category);
  const selectedBrands = list(filters.brand);

  function setImageRatio(event) {
    const image = event.currentTarget;

    if (!image.naturalWidth || !image.naturalHeight) return;

    image.closest(".product")?.style.setProperty(
      "--product-image-ratio",
      `${image.naturalWidth} / ${image.naturalHeight}`,
    );
  }

  function updateSearch(value) {
    setFilters((current) => ({ ...current, q: value }));
  }

  function toggleFilter(key, value) {
    setFilters((current) => {
      const selected = list(current[key]);
      const next = selected.includes(value)
        ? selected.filter((item) => item !== value)
        : [...selected, value];
      return { ...current, [key]: next };
    });
  }

  return (
    <section className="section catalog-section" id="catalog">
      <div className="catalog-layout">
        <aside className="catalog-rail" aria-label={t("filters")}>
          <label className="search-line" data-placeholder={t("findOwn")}>
            <span aria-hidden="true">⌕</span>
            <input
              value={filters.q || ""}
              aria-label={t("findOwn")}
              onChange={(event) => updateSearch(event.target.value)}
            />
            {!filters.q && <em aria-hidden="true">{t("findOwn")}</em>}
          </label>
          <FilterGroup
            label={t("category")}
            options={meta.categories}
            selected={selectedCategories}
            searchPlaceholder={t("findCategory")}
            onToggle={(value) => toggleFilter("category", value)}
          />
          <FilterGroup
            label={t("brand")}
            options={meta.brands}
            selected={selectedBrands}
            searchPlaceholder={t("findBrand")}
            onToggle={(value) => toggleFilter("brand", value)}
          />
        </aside>
        <div className="product-grid">
          {products.length ? products.map((product) => (
            <article className="product" key={product.id}>
              <div className="product-media">
                <button className="favorite-button" type="button" aria-label={t("favorite")}>♡</button>
                <img src={product.image_url} alt={product.name} onLoad={setImageRatio} />
                <button className="quick-cart" type="button" onClick={() => addCart(product.id)} aria-label={t("add")}>
                  <span aria-hidden="true">▢</span>
                </button>
              </div>
              <div className="product-body">
                <div className="meta-row"><span>{product.category?.name || "Beauty"}</span></div>
                <h3>{product.name}</h3>
                <div className="buy-row">
                  <strong>{number.format(Math.round(product.price_cents / 100))}</strong>
                </div>
              </div>
            </article>
          )) : <p className="muted">{t("noProducts")}</p>}
        </div>
      </div>
    </section>
  );
}

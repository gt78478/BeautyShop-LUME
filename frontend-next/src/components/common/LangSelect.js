import { useEffect, useRef, useState } from "react";

const languages = [
  { value: "ru", label: "RU" },
  { value: "en", label: "EN" },
  { value: "pt", label: "PT" },
];

export function LangSelect({ lang, changeLang }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function closeMenu(event) {
      if (!rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeMenu);
    return () => document.removeEventListener("pointerdown", closeMenu);
  }, []);

  function choose(nextLang) {
    changeLang(nextLang);
    setOpen(false);
  }

  return (
    <div className="lang-picker" ref={rootRef}>
      <button
        className="lang-control"
        data-lang={lang.toUpperCase()}
        type="button"
        aria-label="Language"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
      <span className="translate-icon" aria-hidden="true">
        <svg viewBox="0 0 32 32" focusable="false">
          <path d="M4.5 19.5c1.3 4.1 5.1 7 9.5 7 3 0 5.7-1.3 7.5-3.4" />
          <path d="M18.5 22.9h3.1v3.1" />
          <path d="M27.5 12.5c-1.3-4.1-5.1-7-9.5-7-3 0-5.7 1.3-7.5 3.4" />
          <path d="M13.5 9.1h-3.1V6" />
          <path d="M7.5 19.5h7.8" />
          <path d="M11.4 14.6v9.5" />
          <path d="M20.5 19.8l3.3-8.2 3.3 8.2" />
          <path d="M21.8 16.8h4" />
        </svg>
      </span>
      </button>
      {open && (
        <div className="lang-menu" role="menu">
          {languages.map((item) => (
            <button
              className={item.value === lang ? "active" : ""}
              key={item.value}
              type="button"
              role="menuitem"
              onClick={() => choose(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

// Типографика M3 — глобальные классы md-typescale-* (безопасно на сервере, это CSS).
import "@material/web/typography/md-typescale-styles.css";
import { useEffect } from "react";

// Регистрация md-* (customElements.define) только в браузере — на сервере падает.
// Поэтому покомпонентный dynamic import в useEffect. Список растёт по фазам.
export function MdRegistry() {
  useEffect(() => {
    void Promise.all([
      import("@material/web/button/filled-button.js"),
      import("@material/web/button/filled-tonal-button.js"),
      import("@material/web/button/text-button.js"),
      import("@material/web/textfield/outlined-text-field.js"),
      import("@material/web/select/outlined-select.js"),
      import("@material/web/select/select-option.js"),
      import("@material/web/chips/chip-set.js"),
      import("@material/web/chips/filter-chip.js"),
    ]).catch(() => {});
  }, []);

  return null;
}

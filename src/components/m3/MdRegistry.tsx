"use client";

// Типографика M3 — глобальные классы md-typescale-*.
import "@material/web/typography/md-typescale-styles.css";

// Покомпонентная регистрация md-* добавляется здесь по фазам (Ф1+),
// импортом вида: import "@material/web/button/filled-button.js";
// Регистрация только на клиенте — кастомные элементы трогают customElements.

export function MdRegistry() {
  return null;
}

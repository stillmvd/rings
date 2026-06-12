import type { HTMLAttributes, RefAttributes } from "react";

// Переходный широкий тип: помимо стандартных HTML-атрибутов разрешает любые
// свойства/атрибуты веб-компонента (value, label, selected, ...). Строгие пропсы
// появятся в React-обёртках md-* на Ф1.
type MdElement<T = HTMLElement> = HTMLAttributes<T> &
  RefAttributes<T> & { [attr: string]: unknown };

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "md-elevation": MdElement;
      "md-ripple": MdElement;
      "md-focus-ring": MdElement;
      "md-icon": MdElement;
      "md-icon-button": MdElement;
      "md-filled-button": MdElement;
      "md-filled-tonal-button": MdElement;
      "md-elevated-button": MdElement;
      "md-outlined-button": MdElement;
      "md-text-button": MdElement;
      "md-fab": MdElement;
      "md-branded-fab": MdElement;
      "md-filled-text-field": MdElement;
      "md-outlined-text-field": MdElement;
      "md-filled-select": MdElement;
      "md-outlined-select": MdElement;
      "md-select-option": MdElement;
      "md-switch": MdElement;
      "md-checkbox": MdElement;
      "md-radio": MdElement;
      "md-slider": MdElement;
      "md-chip-set": MdElement;
      "md-assist-chip": MdElement;
      "md-filter-chip": MdElement;
      "md-input-chip": MdElement;
      "md-suggestion-chip": MdElement;
      "md-dialog": MdElement;
      "md-divider": MdElement;
      "md-list": MdElement;
      "md-list-item": MdElement;
      "md-menu": MdElement;
      "md-menu-item": MdElement;
      "md-sub-menu": MdElement;
      "md-tabs": MdElement;
      "md-primary-tab": MdElement;
      "md-secondary-tab": MdElement;
      "md-linear-progress": MdElement;
      "md-circular-progress": MdElement;
    }
  }
}

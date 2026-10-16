/* Shared helpers for classic scripts; no imports or fetch required. */
(() => {
  const escape = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[character],
    );
  const icon = (name) =>
    `<svg aria-hidden="true"><use href="#${name}-icon"></use></svg>`;

  // Initialization is once per element, including when a parent moves its children.
  class DocsElement extends HTMLElement {
    connectedCallback() {
      if (this.initialized) return;
      this.initialized = true;
      this.render();
    }
  }

  const siteRoot = new URL("../../", document.currentScript.src);
  const siteUrl = (path) => new URL(path, siteRoot).href;
  window.DocsComponents = { DocsElement, escape, icon, siteUrl };
})();

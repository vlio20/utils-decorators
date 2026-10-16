(() => {
  const { DocsElement, siteUrl } = window.DocsComponents;
  class DocsShell extends DocsElement {
    render() {
      const content = [...this.childNodes];
      this.innerHTML = shellMarkup;
      this.querySelector("[data-page-slot]").append(...content);
      const pageId = this.querySelector("docs-page").getAttribute("page-id");
      this.querySelectorAll(".sidebar nav a").forEach((anchor) => {
        const selected =
          (anchor.dataset.page || anchor.hash.slice(1)) === pageId;
        anchor.classList.toggle("selected", selected);
        if (selected) anchor.setAttribute("aria-current", "page");
        else anchor.removeAttribute("aria-current");
      });
    }
  }

  const shellMarkup = `    <svg
      class="icon-definitions"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <symbol id="search-icon" viewBox="0 0 24 24">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 4 4" />
        </symbol>
        <symbol id="copy-icon" viewBox="0 0 24 24">
          <rect x="8" y="7" width="11" height="14" rx="2" />
          <path d="M15 7V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" />
        </symbol>
        <symbol id="sun-icon" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path
            d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"
          />
        </symbol>
        <symbol id="menu-icon" viewBox="0 0 24 24">
          <path d="M4 6h16M4 12h16M4 18h16" />
        </symbol>
        <symbol id="arrow-icon" viewBox="0 0 24 24">
          <path d="M5 12h14m-5-5 5 5-5 5" />
        </symbol>
        <symbol id="github-icon" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            stroke="none"
            d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.86c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.64-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.82c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.75c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
          />
        </symbol>
      </defs>
    </svg>
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="header">
      <button
        class="icon-button menu-toggle"
        aria-label="Open navigation"
        aria-expanded="false"
        aria-controls="sidebar"
      >
        <svg><use href="#menu-icon" /></svg>
      </button>
      <a class="brand" href="${siteUrl("index.html#after")}">
        <span class="brand-mark">@</span>
        <span>utils-decorators</span>
      </a>
      <span class="header-label">
        Docs
        <span class="version">3.0</span>
      </span>
      <button
        class="search-trigger"
        aria-label="Search documentation"
        aria-keyshortcuts="Control+K Meta+K"
      >
        <svg><use href="#search-icon" /></svg>
        <span>Search documentation...</span>
        <kbd>Ctrl/⌘ K</kbd>
      </button>
      <div class="header-actions">
        <a
          class="icon-button"
          href="https://github.com/vlio20/utils-decorators"
          aria-label="GitHub repository"
        >
          <svg><use href="#github-icon" /></svg>
        </a>
        <span class="divider"></span>
        <button
          class="icon-button theme-toggle"
          aria-label="Switch to dark mode"
          aria-pressed="false"
        >
          <svg><use href="#sun-icon" /></svg>
        </button>
      </div>
    </header>
    <button
      class="nav-overlay"
      aria-label="Close navigation"
      tabindex="-1"
      hidden
    ></button>
    <aside class="sidebar" id="sidebar" aria-label="Documentation navigation">
      <nav>
        <p class="nav-heading">Get started</p>
        <a data-page="install" href="${siteUrl("index.html#install")}">Installation</a>
        <a data-page="migration" href="${siteUrl("index.html#migration")}">Migration to 3.0.0</a>
        <div class="nav-rule"></div>
        <p class="nav-heading">Decorators</p>
        <details open>
          <summary>Lifecycle</summary>
          <div class="nav-group">
            <a data-page="after" class="selected" aria-current="page" href="${siteUrl("index.html#after")}">
              after
            </a>
            <a data-page="before" href="${siteUrl("index.html#before")}">before</a>
          </div>
        </details>
        <details open>
          <summary>Timing</summary>
          <div class="nav-group">
            <a data-page="debounce" href="${siteUrl("index.html#debounce")}">debounce</a>
            <a data-page="throttle" href="${siteUrl("index.html#throttle")}">throttle</a>
            <a data-page="throttleAsync" href="${siteUrl("index.html#throttleAsync")}">throttleAsync</a>
            <a data-page="delay" href="${siteUrl("index.html#delay")}">delay</a>
            <a data-page="timeout" href="${siteUrl("index.html#timeout")}">timeout</a>
            <a data-page="rateLimit" href="${siteUrl("index.html#rateLimit")}">rateLimit</a>
          </div>
        </details>
        <details open>
          <summary>Caching</summary>
          <div class="nav-group">
            <a data-page="memoize" href="${siteUrl("index.html#memoize")}">memoize</a>
            <a data-page="memoizeAsync" href="${siteUrl("index.html#memoizeAsync")}">memoizeAsync</a>
          </div>
        </details>
        <details>
          <summary>Control flow</summary>
          <div class="nav-group">
            <a data-page="cancelPrevious" href="${siteUrl("index.html#cancelPrevious")}">cancelPrevious</a>
            <a data-page="delegate" href="${siteUrl("index.html#delegate")}">delegate</a>
            <a data-page="multiDispatch" href="${siteUrl("index.html#multiDispatch")}">multiDispatch</a>
            <a data-page="onError" href="${siteUrl("index.html#onError")}">onError</a>
            <a data-page="readonly" href="${siteUrl("index.html#readonly")}">readonly</a>
            <a data-page="refreshable" href="${siteUrl("index.html#refreshable")}">refreshable</a>
            <a data-page="retry" href="${siteUrl("index.html#retry")}">retry</a>
            <a data-page="execTime" href="${siteUrl("index.html#execTime")}">execTime</a>
          </div>
        </details>
      </nav>
      <div class="install">
        <span class="install-caption">A little less repetitive code.</span>
        <button
          data-copy="npm i utils-decorators"
          aria-label="Copy install command"
        >
          <code>npm i utils-decorators</code>
          <svg><use href="#copy-icon" /></svg>
        </button>
      </div>
    </aside>
<div class="content-layout" data-page-slot></div>
    <dialog class="search-dialog" aria-labelledby="search-title">
      <h2 id="search-title" class="sr-only">Search documentation</h2>
      <div class="search-input-row">
        <svg><use href="#search-icon" /></svg>
        <input
          id="search-input"
          type="search"
          placeholder="Search documentation…"
          autocomplete="off"
          aria-label="Search documentation"
          aria-controls="search-results"
        />
        <button class="close-search" aria-label="Close search">Esc</button>
      </div>
      <p class="search-caption">Jump to a decorator or guide</p>
      <div id="search-results" class="search-results"></div>
      <div class="search-footer">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd>
          to navigate
        </span>
        <span>
          <kbd>↵</kbd>
          to open
        </span>
      </div>
    </dialog>
    <div class="toast" role="status" aria-live="polite"></div>
`;

  customElements.define("docs-shell", DocsShell);
})();

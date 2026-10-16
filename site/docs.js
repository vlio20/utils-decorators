/* Plain scripts keep the docs usable over file:// as well as static hosting. */
(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const themeButton = $(".theme-toggle");
  function syncTheme() {
    const dark = document.documentElement.dataset.theme === "dark";
    themeButton.setAttribute(
      "aria-label",
      `Switch to ${dark ? "light" : "dark"} mode`,
    );
    themeButton.setAttribute("aria-pressed", String(dark));
  }
  syncTheme();
  themeButton.addEventListener("click", () => {
    const theme =
      document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("docs-theme", theme);
    } catch {
      /* Storage may be disabled. */
    }
    syncTheme();
  });

  const menu = $(".menu-toggle");
  const mobileQuery = window.matchMedia("(max-width: 760px)");
  const sidebar = $(".sidebar");
  sidebar.inert = mobileQuery.matches;
  function closeMenu(restoreFocus = false) {
    document.body.classList.remove("nav-open");
    menu.setAttribute("aria-expanded", "false");
    menu.setAttribute("aria-label", "Open navigation");
    $(".nav-overlay").hidden = true;
    sidebar.inert = mobileQuery.matches;
    if (restoreFocus) menu.focus();
  }
  menu.addEventListener("click", () => {
    const open = !document.body.classList.contains("nav-open");
    document.body.classList.toggle("nav-open", open);
    menu.setAttribute("aria-expanded", String(open));
    menu.setAttribute("aria-label", `${open ? "Close" : "Open"} navigation`);
    $(".nav-overlay").hidden = !open;
    sidebar.inert = mobileQuery.matches && !open;
  });
  $(".nav-overlay").addEventListener("click", () => closeMenu(true));
  $$(".sidebar a").forEach((link) =>
    link.addEventListener("click", () => closeMenu()),
  );
  mobileQuery.addEventListener("change", () => closeMenu());

  let toastTimer;
  function notify(message) {
    const toast = $(".toast");
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("visible");
    toastTimer = setTimeout(() => toast.classList.remove("visible"), 2500);
  }
  async function copyText(text) {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(text);
    } catch {
      const field = document.createElement("textarea");
      field.value = text;
      field.style.cssText = "position:fixed;opacity:0;top:0;left:0";
      document.body.append(field);
      field.select();
      const copied = document.execCommand("copy");
      field.remove();
      if (!copied) throw new Error("Copy failed");
    }
  }
  async function copyAndNotify(text, button) {
    try {
      await copyText(text);
      notify("Copied to clipboard");
    } catch {
      notify("Unable to copy. Please select and copy the text.");
    }
    button.focus();
  }
  document.addEventListener("docs-copy", (event) => {
    copyAndNotify(event.detail.text, event.detail.button);
  });
  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-copy]");
    if (button) copyAndNotify(button.dataset.copy, button);
  });

  const dialog = $(".search-dialog");
  const input = $("#search-input");
  const results = $("#search-results");
  const entries = $$(".sidebar nav a").map((link) => ({
    title: link.textContent.replace("↗", "").trim(),
    href: link.getAttribute("href"),
    group:
      link.closest("details")?.querySelector("summary").textContent ||
      "Get started",
  }));
  function renderSearch() {
    const query = input.value.trim().toLowerCase();
    const matches = entries.filter((entry) =>
      `${entry.title} ${entry.group}`.toLowerCase().includes(query),
    );
    results.replaceChildren();
    for (const entry of matches) {
      const link = document.createElement("a");
      link.href = entry.href;
      const title = document.createElement("span");
      title.textContent = entry.title;
      const group = document.createElement("small");
      group.textContent = entry.group;
      link.append(title, group);
      results.append(link);
    }
    if (!matches.length) {
      const empty = document.createElement("p");
      empty.className = "empty-search";
      empty.textContent = "No results. Try a decorator name, like “after”.";
      results.append(empty);
    }
    results.scrollTop = 0;
  }
  function openSearch() {
    closeMenu();
    input.value = "";
    renderSearch();
    dialog.showModal();
    input.focus();
  }
  $(".search-trigger").addEventListener("click", openSearch);
  $(".close-search").addEventListener("click", () => dialog.close());
  input.addEventListener("input", renderSearch);
  results.addEventListener("click", (event) => {
    if (event.target.closest("a")) dialog.close();
  });
  dialog.addEventListener("click", (event) => {
    const bounds = dialog.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      dialog.close();
  });
  dialog.addEventListener("keydown", (event) => {
    const links = [...results.querySelectorAll("a")];
    const current = links.indexOf(document.activeElement);
    if (event.key === "ArrowDown" && links.length) {
      event.preventDefault();
      links[(current + 1) % links.length].focus();
    } else if (event.key === "ArrowUp" && links.length) {
      event.preventDefault();
      if (current <= 0) input.focus();
      else links[current - 1].focus();
    } else if (
      event.key === "Enter" &&
      document.activeElement === input &&
      links.length
    ) {
      event.preventDefault();
      links[0].click();
    }
  });
  document.addEventListener("keydown", (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else openSearch();
    }
    if (event.key === "Escape" && document.body.classList.contains("nav-open"))
      closeMenu(true);
  });

  function updateToc() {
    const sections = $$("main section");
    const current =
      sections
        .filter((section) => section.getBoundingClientRect().top <= 160)
        .at(-1) || sections[0];
    $$(".toc nav a").forEach((link) => {
      const active = link.dataset.section === current?.id;
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }
  let scrollPending = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollPending)
        requestAnimationFrame(() => {
          updateToc();
          scrollPending = false;
        });
      scrollPending = true;
    },
    { passive: true },
  );
  // Native section anchors work over file:// and static HTTP hosting.
  // Accept earlier #after/configuration links for the current page too.
  const pageTags = new Map([
    ["install", "install-page"],
    ["migration", "migration-page"],
    ["after", "after-page"],
    ["before", "before-page"],
    ["cancelPrevious", "cancel-previous-page"],
    ["debounce", "debounce-page"],
    ["delay", "delay-page"],
    ["delegate", "delegate-page"],
    ["execTime", "exec-time-page"],
    ["memoize", "memoize-page"],
    ["memoizeAsync", "memoize-async-page"],
    ["multiDispatch", "multi-dispatch-page"],
    ["onError", "on-error-page"],
    ["leakyBucket", "leaky-bucket-page"],
    ["rateLimit", "rate-limit-page"],
    ["readonly", "readonly-page"],
    ["refreshable", "refreshable-page"],
    ["retry", "retry-page"],
    ["throttle", "throttle-page"],
    ["throttleAsync", "throttle-async-page"],
    ["timeout", "timeout-page"],
  ]);
  function followHash() {
    const [hashPage, hashSection] = location.hash.slice(1).split("/");
    // Preserve the previous TypeScript guide URL within installation.
    const requested = hashPage === "typescript" ? "install" : hashPage;
    const section = hashPage === "typescript" ? "typescript" : hashSection;
    const pageTag = pageTags.get(requested);
    if (pageTag && $("docs-page").getAttribute("page-id") !== requested) {
      $("[data-page-slot]").replaceChildren(document.createElement(pageTag));
    }
    const page = $("docs-page");
    const pageId = page.getAttribute("page-id");
    $(".skip-link").href = `#${pageId}/main`;
    document.title = `${page.getAttribute("heading")} — utils-decorators`;
    $("meta[name=description]").content = page
      .querySelector(".intro")
      .textContent.trim()
      .replace(/\s+/g, " ");
    $$(".sidebar nav a").forEach((anchor) => {
      const selected = anchor.dataset.page === pageId;
      anchor.classList.toggle("selected", selected);
      if (selected) anchor.setAttribute("aria-current", "page");
      else anchor.removeAttribute("aria-current");
    });
    const targetId = requested === pageId ? section : requested;
    requestAnimationFrame(() => {
      if (targetId) {
        const target = document.getElementById(targetId);
        target?.scrollIntoView();
        if (targetId === "main") target?.focus({ preventScroll: true });
      } else if (requested === pageId) window.scrollTo(0, 0);
      updateToc();
    });
  }
  window.addEventListener("hashchange", followHash);
  followHash();
})();

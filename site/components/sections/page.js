(() => {
  const { DocsElement, escape, icon, referenceUrl } = window.DocsComponents;
  class DocsPage extends DocsElement {
    render() {
      const content = [...this.childNodes];
      const title = this.getAttribute("heading");
      const category = this.getAttribute("category");
      this.innerHTML = `<main id="main" tabindex="-1"><div class="breadcrumb"><a href="${escape(referenceUrl(this.getAttribute("page-id")))}">Decorators</a><span>/</span>${escape(category)}</div><div class="page-title"><h1>${escape(title)}</h1><span class="badge">${escape(category)}</span></div></main>`;
      const main = this.querySelector("main");
      main.append(...content);
      const footer = document.createElement("footer");
      footer.className = "page-footer";
      const editPath = this.getAttribute("edit-path") || "site/index.html";
      footer.innerHTML = `<a class="edit-link" href="https://github.com/vlio20/utils-decorators/edit/codex/3.0.0/${editPath.split("/").map(encodeURIComponent).join("/")}">Edit this page ↗</a>`;
      if (this.hasAttribute("next-href"))
        footer.innerHTML += `<a class="next-page" href="${escape(this.getAttribute("next-href"))}"><span>Up next</span><strong>${escape(this.getAttribute("next-title"))} ${icon("arrow")}</strong></a>`;
      main.append(footer);
      const toc = document.createElement("aside");
      toc.className = "toc";
      toc.setAttribute("aria-label", "On this page");
      toc.innerHTML = `<p class="nav-heading">On this page</p><nav></nav><div class="nav-rule"></div><a class="edit-link" href="https://github.com/vlio20/utils-decorators/blob/codex/3.0.0/${escape(this.getAttribute("source"))}">View source ↗</a><div class="toc-note">Small utilities.<br>More readable code.</div>`;
      this.append(toc);
      // Page components insert their child components at runtime. Wait for them
      // to initialize before deriving the table of contents.
      queueMicrotask(() => {
        for (const section of main.querySelectorAll("section")) {
          const anchor = document.createElement("a");
          anchor.href = `#${this.getAttribute("page-id")}/${section.id}`;
          anchor.dataset.section = section.id;
          anchor.textContent = section.querySelector("h2").textContent;
          toc.querySelector("nav").append(anchor);
        }
      });
    }
  }

  customElements.define("docs-page", DocsPage);
})();

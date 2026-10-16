(() => {
  const { DocsElement, escape } = window.DocsComponents;
  class DocsSection extends DocsElement {
    render() {
      const content = [...this.childNodes];
      const id = this.getAttribute("anchor");
      const pageId = this.closest("docs-page").getAttribute("page-id");
      const section = document.createElement("section");
      section.id = id;
      section.setAttribute("aria-labelledby", `${id}-title`);
      section.innerHTML = `<h2 id="${escape(id)}-title"><a href="#${escape(pageId)}/${escape(id)}">${escape(this.getAttribute("heading"))}</a></h2>`;
      section.append(...content);
      this.replaceChildren(section);
    }
  }

  customElements.define("docs-section", DocsSection);
})();

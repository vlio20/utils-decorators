(() => {
  const { DocsElement } = window.DocsComponents;
  class DocsCallout extends DocsElement {
    render() {
      const content = [...this.childNodes];
      this.innerHTML =
        '<div class="note"><span class="info-icon" aria-hidden="true">i</span><p></p></div>';
      this.querySelector("p").append(...content);
    }
  }

  customElements.define("docs-callout", DocsCallout);
})();

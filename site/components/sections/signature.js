(() => {
  const { DocsElement } = window.DocsComponents;
  class DocsSignature extends DocsElement {
    render() {
      this.classList.add("signature");
      const label = document.createElement("span");
      label.textContent = this.getAttribute("label");
      this.append(label);
    }
  }

  customElements.define("docs-signature", DocsSignature);
})();

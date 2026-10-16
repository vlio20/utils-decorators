(() => {
  const { DocsElement } = window.DocsComponents;
  class DocsConfigTable extends DocsElement {
    render() {
      const table = this.querySelector("table");
      if (!table) return;
      if (!table.tHead) {
        const head = table.createTHead();
        head.innerHTML =
          '<tr><th scope="col">Option</th><th scope="col">Type</th><th scope="col">Description</th></tr>';
      }
      const wrapper = document.createElement("div");
      wrapper.className = "table-scroll";
      wrapper.append(table);
      this.replaceChildren(wrapper);
    }
  }

  customElements.define("docs-config-table", DocsConfigTable);
})();

(() => {
  const { DocsElement } = window.DocsComponents;
  class DocsTabs extends DocsElement {
    render() {
      const variants = [
        ...this.querySelectorAll(":scope > template[data-variant]"),
      ];
      const shared = [...this.children].filter(
        (child) => child.tagName !== "TEMPLATE",
      );
      const section = (id, title) => {
        const element = document.createElement("docs-section");
        element.setAttribute("anchor", id);
        element.setAttribute("heading", title);
        return element;
      };
      const usage = section("usage", "Usage");
      const config = section("configuration", "Configuration");
      const tablist = document.createElement("div");
      tablist.className = "tabs";
      tablist.setAttribute("role", "tablist");
      tablist.setAttribute("aria-label", "API form");
      usage.append(tablist);
      const signatures = [];
      for (const template of variants) {
        const id = template.dataset.variant;
        const content = template.content.cloneNode(true);
        const signature = content.querySelector("docs-signature");
        const panel = content.querySelector("[data-example]");
        const configuration = content.querySelector("[data-configuration]");
        signature.id = `${id}-signature`;
        panel.id = `${id}-panel`;
        configuration.id = `${id}-configuration`;
        for (const part of [signature, panel, configuration])
          part.dataset.variant = id;
        const tab = document.createElement("button");
        tab.id = `${id}-tab`;
        tab.dataset.tab = id;
        tab.setAttribute("role", "tab");
        tab.setAttribute(
          "aria-controls",
          `${panel.id} ${signature.id} ${configuration.id}`,
        );
        tab.textContent = template.dataset.label;
        tablist.append(tab);
        panel.setAttribute("role", "tabpanel");
        panel.setAttribute("aria-labelledby", tab.id);
        panel.tabIndex = 0;
        signatures.push(signature);
        usage.append(panel);
        config.append(configuration);
      }
      usage.append(...shared);
      this.replaceChildren(...signatures, usage, config);
      this.select(variants[0].dataset.variant);
      this.addEventListener("click", (event) => {
        const tab = event.target.closest("[role=tab]");
        if (tab) this.select(tab.dataset.tab);
      });
      this.addEventListener("keydown", (event) => {
        const tabs = [...this.querySelectorAll("[role=tab]")];
        const index = tabs.indexOf(event.target);
        if (index < 0) return;
        let next;
        if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft")
          next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next !== undefined) {
          event.preventDefault();
          this.select(tabs[next].dataset.tab, true);
        }
      });
    }
    select(id, focus = false) {
      this.querySelectorAll("[data-variant]").forEach((element) => {
        element.hidden = element.dataset.variant !== id;
      });
      this.querySelectorAll("[role=tab]").forEach((tab) => {
        const active = tab.dataset.tab === id;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        if (active && focus) tab.focus();
      });
    }
  }

  customElements.define("docs-tabs", DocsTabs);
})();

(() => {
  const { DocsElement, escape, icon } = window.DocsComponents;
  class DocsCode extends DocsElement {
    render() {
      const pre = this.querySelector("pre");
      if (!pre) return;
      const code = pre.querySelector("code");
      const text = code.textContent;
      const panel = document.createElement("div");
      panel.className = "code-panel";
      const filename = this.getAttribute("filename");
      const language = this.getAttribute("language") || "typescript";
      if (filename) {
        panel.innerHTML = `<div class="code-toolbar"><span>${escape(filename)}</span><div><span>${escape(language === "typescript" ? "TypeScript" : language)}</span><button>${icon("copy")}Copy</button></div></div>`;
        panel.querySelector("button").addEventListener("click", (event) => {
          this.dispatchEvent(
            new CustomEvent("docs-copy", {
              bubbles: true,
              detail: { text, button: event.currentTarget },
            }),
          );
        });
      }
      code.className = `language-${language}`;
      panel.append(pre);
      this.replaceChildren(panel);
      if (window.hljs) hljs.highlightBlock(code);
    }
  }

  customElements.define("docs-code", DocsCode);
})();

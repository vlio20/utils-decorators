# Documentation site

Open `index.html` directly, or serve the repository with
`python3 -m http.server 4173` and visit `http://localhost:4173/site/`.
The same files run on static hosting with no build, install, module imports, or
runtime fetch calls. Publish the repository root to use its `index.html` redirect,
which preserves guide and utility hashes when opening `site/`. Alternatively,
publish `site/` directly. Installation, migration to 3.0.0, and all 19 utility
pages use the shared components.

## Structure

- `index.html`: shared entry point, styles, and ordered deferred scripts. Displays
  `<after-page>` inside `<docs-shell>`.
- `pages/<page>/<page>-page.js`: one native page component per guide or utility, with
  an HTML template using the shared sections and common components.
- `components/common/`: base helpers, shell, code blocks, and callouts.
- `components/sections/`: page layout, sections, tabs, signatures, and config tables.
- `docs.js`: search, theme, mobile navigation, clipboard feedback, and section links.
- `docs.css`: shared light-DOM styling.
- `libs/`: vendored Highlight.js, its reference stylesheet, and Tailwind CSS.

## Page components

A utility component composes markup directly, rather than supplying a configuration
object or duplicating the shell. For example:

```js
(() => {
  const { DocsElement } = window.DocsComponents;

  class ExamplePage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="example" heading="example" category="Lifecycle"
          source="src/example/example.ts"
          edit-path="site/pages/example/example-page.js">
          <p class="lead">What this utility does.</p>
          <docs-section anchor="behavior" heading="How it works">
            <p>Explain the behavior here.</p>
            <docs-callout>A useful note.</docs-callout>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("example-page", ExamplePage);
})();
```

Use `pages/after/after-page.js` for a complete example including decorator/function
tabs. Each tab is a native `<template data-variant="..." data-label="...">` with
`<docs-signature>`, a `[data-example]` block, and a `[data-configuration]` block.
Code belongs inside `<docs-code filename="..." language="typescript">` with a
`<pre><code>` child. `<docs-config-table>` wraps a normal table and supplies its
shared column headings. Ordinary HTML provides prose, lists, and details.

Escape HTML inside code examples, and escape literal backticks and `${...}` when
embedding them in the component’s JavaScript template string.

Load shared components first, utility page components next, the shell last, then
`docs.js`. `DocsElement` initializes each element once so moving it into the shared
layout does not duplicate event handlers. The page layout derives its table of
contents after child components initialize. Load a new page script before the shell, add its page ID and custom-element name
to `pageTags` in `docs.js`, and add its `data-page` navigation link to the shell.
Routes such as `#before` and `#before/configuration` switch page components inside
the same shared shell; section-only hashes remain on the selected page.

Links resolve from the site root using helpers in `components/common/base.js` so
hosting under a repository subdirectory works too. Page-qualified section links such as `#memoize/configuration` survive refreshes.
Legacy section-only links such as `#configuration` still work on the selected page.

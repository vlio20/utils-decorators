(() => {
  const { DocsElement } = window.DocsComponents;

  class InstallPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="install" heading="Installation" category="Get started"
          source="package.json" edit-path="site/pages/install/install-page.js"
          next-title="Migration to 3.0.0" next-href="#migration">
          <p class="lead">Write less repetitive code with decorators and function wrappers.</p>
          <p class="intro">Use utils-decorators in Node.js or browser applications. Import just the utilities you need; the package provides CommonJS, ES modules, and TypeScript declarations.</p>
          <docs-section anchor="install" heading="Install the package">
            <docs-code filename="terminal" language="bash"><pre><code>npm install utils-decorators@3</code></pre></docs-code>
            <p>Version 3.0.1 requires Node.js <code>^22.18.0 || &gt;=24.11.0</code>. The package is tree-shakable when your bundler uses its ES module build.</p>
            <docs-callout>Upgrading from 2.x? Read the <a href="#migration">migration to 3.0.0</a> guide before updating. It covers changes to instance state, refreshable loading, and public types.</docs-callout>
          </docs-section>
          <docs-section anchor="functions" heading="Use a function wrapper">
            <p>Function wrappers work in plain JavaScript and TypeScript without decorator syntax or decorator compiler settings.</p>
            <docs-code filename="example.js" language="javascript"><pre><code>import { memoizify } from 'utils-decorators';

const double = memoizify((value) =&gt; value * 2);
console.log(double(21)); // 42; later calls with 21 use the cache.</code></pre></docs-code>
            <p>In CommonJS, use <code>const { memoizify } = require('utils-decorators');</code>. Each wrapper owns its state; create separate wrappers for independent caches, timers, or queues.</p>
          </docs-section>
          <docs-section anchor="typescript" heading="TypeScript setup">
            <p>Since version 3.0.1, <code>@throttleAsync</code>, <code>@throttle</code>, <code>@debounce</code>, and <code>@delay</code> support TypeScript <code>private</code> and <code>protected</code> methods while preserving method type validation.</p>
            <p>Use TypeScript 5.4+ with <code>strict</code> enabled. Decorator syntax uses TypeScript's legacy decorators and requires <code>experimentalDecorators</code>; standard decorators are not supported.</p>
            <docs-code filename="tsconfig.json" language="json"><pre><code>{
  "compilerOptions": {
    "target": "ES2020",
    "strict": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}</code></pre></docs-code>
            <p><code>useDefineForClassFields: false</code> lets field initializers use the setter installed by <a href="#readonly">@readonly</a>. For <a href="#refreshable">@refreshable</a>, use a <code>declare</code> property so field emission does not shadow its accessor. Function-only use does not require either decorator setting.</p>
            <docs-code filename="search-box.ts" language="typescript"><pre><code>import { debounce } from 'utils-decorators';

class SearchBox {
  @debounce(250)
  search(query: string): void {
    console.log(query);
  }
}

new SearchBox().search('decorators');</code></pre></docs-code>
            <p>Wrappers infer argument tuples, return values, and explicit <code>this</code> requirements from the source function. Configuration callbacks infer their payloads too:</p>
            <docs-code filename="inference.ts" language="typescript"><pre><code>import { afterify } from 'utils-decorators';

const load = afterify(async (id: number) =&gt; ({ id }), {
  wait: true,
  func: ({ args, response }) =&gt; console.log(args[0], response.id),
});

load(42); // Promise&lt;{ id: number }&gt;
// load('42'); // Type error.</code></pre></docs-code>
            <p>Legacy decorator callbacks cannot infer payloads backward from the decorated method. Annotate them when needed, for example <code>AfterParams&lt;number, [number]&gt;</code>; otherwise payloads safely default to <code>unknown</code>. See <a href="#migration/types">type migration</a> for affected declarations.</p>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("install-page", InstallPage);
})();

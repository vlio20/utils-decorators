(() => {
  const { DocsElement } = window.DocsComponents;

  class ReadonlyPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="readonly" heading="readonly" category="Properties"
          source="src/readonly/readonly.ts" edit-path="site/pages/readonly/readonly-page.js"
          next-title="refreshable" next-href="#refreshable">
          <p class="lead">Initialize once, then prevent assignment.</p>
          <p class="intro">Mark a property or method as nonwritable at runtime. A decorated field accepts its first assignment on each instance, while an existing method descriptor becomes nonwritable immediately.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">readonly</span>()</code></docs-signature>
              <div data-example>
                <docs-code filename="account.ts" language="typescript"><pre><code>import { readonly } from 'utils-decorators';

class Account {
  @readonly()
  id: string;

  constructor(id: string) {
    this.id = id; // First assignment creates a nonwritable own property.
  }
}

const first = new Account('a');
const second = new Account('b');
console.log(first.id, second.id); // 'a', 'b'

try {
  first.id = 'changed'; // TypeScript permits this; strict-mode execution throws.
} catch (error) {
  console.log(error instanceof TypeError); // true
}</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @readonly()</p>
                <p class="form-guidance">No options are accepted. The decorator supports string and symbol property keys. It does not change the property's TypeScript type; add the language's <code>readonly</code> modifier separately when you also want compile-time assignment checks.</p>
                <details class="api-detail"><summary>Object contents remain mutable</summary>
                  <p>The property reference becomes nonwritable, but its value is not frozen. Nested objects and arrays can still be modified.</p>
                  <docs-code language="typescript"><pre><code>import { readonly } from 'utils-decorators';

class Preferences {
  @readonly()
  settings = { theme: 'light' };
}

const preferences = new Preferences();
preferences.settings.theme = 'dark'; // Allowed: changes the existing object.
console.log(preferences.settings.theme); // 'dark'
console.log(Object.getOwnPropertyDescriptor(preferences, 'settings')?.writable);
// false with assignment-based field initialization</code></pre></docs-code>
                </details>
                <details class="api-detail"><summary>Protecting a method descriptor</summary>
                  <p>For methods, the decorator sets the existing prototype descriptor's <code>writable</code> flag to <code>false</code>. Calls and their original argument and return types are preserved.</p>
                  <docs-code language="typescript"><pre><code>import { readonly } from 'utils-decorators';

class Formatter {
  @readonly()
  format(value: number): string {
    return value.toFixed(2);
  }
}

console.log(new Formatter().format(2)); // '2.00'
console.log(Object.getOwnPropertyDescriptor(Formatter.prototype, 'format')?.writable);
// false</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>Field protection relies on assignment-based initialization, as with TypeScript's <code>useDefineForClassFields: false</code>. Native class fields and define-based emission create an own property directly and bypass the prototype setter. The field examples assume assignment-based emission.</docs-callout>
          </docs-tabs>
          <docs-section anchor="behavior" heading="How it works">
            <ul class="behavior-list">
              <li>For a field without a descriptor, the decorator installs a configurable setter on the prototype. The first assignment through that setter creates an own property on the receiver with <code>writable: false</code>, <code>enumerable: true</code>, and <code>configurable: true</code>.</li>
              <li>Each instance initializes independently. An initializer consumes that instance's first assignment; assigning again in the constructor then fails. Until initialization, reading through the setter-only prototype property returns <code>undefined</code>.</li>
              <li>After initialization, ordinary assignment to the nonwritable property throws <code>TypeError</code> in strict mode. In non-strict JavaScript, it is silently ignored.</li>
              <li>The field remains configurable, so explicit deletion or <code>Object.defineProperty</code> can remove or replace its protection. This is an assignment guard, not a permanent lock or an object freeze.</li>
              <li>For a supplied descriptor, only <code>writable</code> is changed. Methods keep their implementation and other descriptor flags. Accessors are unsupported because accessor descriptors cannot also specify <code>writable</code>.</li>
              <li>There is no standalone function wrapper. The exported <code>readonly()</code> returns the decorator, which can also be applied directly to a target, key, and optional property descriptor.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("readonly-page", ReadonlyPage);
})();

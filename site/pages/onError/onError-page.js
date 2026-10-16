(() => {
  const { DocsElement } = window.DocsComponents;

  class OnErrorPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="onError" heading="onError" category="Errors"
          source="src/on-error/on-error.ts" edit-path="site/pages/onError/onError-page.js"
          next-title="rateLimit" next-href="#rateLimit">
          <p class="lead">Turn a failed call into a recovery result.</p>
          <p class="intro">Catch a source error and pass it, along with the original arguments, to a recovery handler. Return a fallback, await recovery work, or rethrow to keep the call rejected.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">onError</span>({ func: handler | methodKey })</code></docs-signature>
              <div data-example>
                <docs-code filename="user-service.ts" language="typescript"><pre><code>import { onError } from 'utils-decorators';

class UserService {
  @onError({ func: 'recoverName' })
  async getName(id: number): Promise&lt;string&gt; {
    if (id &lt; 0) throw new Error('Invalid user');
    return 'User ' + id;
  }

  recoverName(error: unknown, args: [number]): string {
    console.warn(args[0], error instanceof Error ? error.message : error);
    return 'Guest';
  }
}

const name = await new UserService().getName(-1); // 'Guest'</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @onError(config)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>func</code><span class="required">Required</span></td><td><code>handler | method key</code></td><td>A recovery callback or compatible method key on the receiver. Receives <code>(error, args)</code>. A named method is bound to that receiver.</td></tr>
                </tbody></table></docs-config-table>
                <p class="form-guidance">The method must return a compatible <code>Promise</code>. Its handler must return the method's resolved result type, or a promise/thenable of that type. A callback's arguments start as <code>unknown[]</code>; annotate the tuple when needed.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">onErrorify</span>(fn, { func: handler | methodKey }): (...args) =&gt; Promise&lt;Result | Fallback&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="parse-count.ts" language="typescript"><pre><code>import { onErrorify } from 'utils-decorators';

const parseCount = onErrorify((text: string): number =&gt; {
  const value = Number(text);
  if (!Number.isFinite(value)) throw new Error('Invalid count');
  return value;
}, {
  func: (error, args) =&gt; {
    console.warn('Could not parse', args[0], error);
    return null;
  },
});

const valid: number | null = await parseCount('42'); // 42
const fallback: number | null = await parseCount('oops'); // null</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · onErrorify(fn, config)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>function</code></td><td>A synchronous or asynchronous source. Its argument types and receiver requirement are preserved.</td></tr>
                  <tr><td><code>func</code><span class="required">Required</span></td><td><code>handler | method key</code></td><td>Recovery handler inside the configuration object. Callback arguments are inferred from the source, and its fallback can have a different type. Named handlers require a compatible receiver.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Advanced: recovering with receiver state</summary>
                  <p>Declare the source's <code>this</code> type and call the wrapper with a receiver containing the named handler. Both source and named handler use that receiver.</p>
                  <docs-code language="typescript"><pre><code>import { onErrorify } from 'utils-decorators';

type Receiver = {
  fallback: number;
  recover(error: unknown, args: [number]): number;
};

function divide(this: Receiver, divisor: number): number {
  if (divisor === 0) throw new Error('Division by zero');
  return 100 / divisor;
}

const safeDivide = onErrorify(divide, { func: 'recover' });
const receiver: Receiver = {
  fallback: 0,
  recover(error, args) {
    console.warn(error, args[0]);
    return this.fallback;
  },
};

const result = await safeDivide.call(receiver, 0); // 0</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>The wrapper always returns a native promise, even for a synchronous source. The recovery handler is awaited automatically; there is no <code>wait</code> option.</docs-callout>
          </docs-tabs>
          <docs-section anchor="handler" heading="Handler arguments">
            <div class="payload-grid">
              <div><code>error</code><p>The thrown value or rejection reason, typed as <code>unknown</code>. JavaScript can throw any value; narrow it before reading properties.</p></div>
              <div><code>args</code><p>The original argument tuple, passed as the second argument. Object arguments retain their references.</p></div>
            </div>
            <p>The handler's resolved return value replaces the failed result. To log and preserve failure, throw the error again. Returning nothing recovers to <code>undefined</code>, subject to the decorator's return-type constraint.</p>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Call source</li><li><span>02</span>Catch failure</li><li><span>03</span>Await recovery</li></ol>
            <ul class="behavior-list">
              <li>Successful results pass through without calling the handler. Synchronous throws and asynchronous rejections from the source both enter recovery.</li>
              <li>Recovery is part of the returned promise. A handler throw or rejection rejects that promise; the handler is not called again for its own failure.</li>
              <li>Named handlers are resolved and bound before the source runs, outside the recovery block. A missing or noncallable named handler rejects the wrapper's promise without invoking the source or another handler.</li>
              <li>Callback handlers receive no automatic instance binding. Use a closure or named method when recovery needs instance state.</li>
              <li>The function form can widen the result to include a different fallback type. The decorator keeps the declared method contract, so recovery must fit its existing promise result.</li>
              <li>Promise identity and extra properties on custom promises are not preserved. Await the returned promise to observe either the original result or the recovery outcome.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("on-error-page", OnErrorPage);
})();

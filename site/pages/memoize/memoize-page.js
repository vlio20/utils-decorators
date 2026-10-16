(() => {
  const { DocsElement } = window.DocsComponents;

  class MemoizePage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="memoize" heading="memoize" category="Caching"
          source="src/memoize/memoize.ts" edit-path="site/pages/memoize/memoize-page.js"
          next-title="memoizeAsync" next-href="#memoizeAsync">
          <p class="lead">Compute once, reuse the result.</p>
          <p class="intro">Cache a function’s return value by its arguments. Repeated calls with the same key return the stored value until it is deleted or expires.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">memoize</span>(input?: MemoizeConfig | number)</code></docs-signature>
              <div data-example>
                <docs-code filename="price-service.ts" language="typescript"><pre><code>import { memoize } from 'utils-decorators';

class PriceService {
  constructor(private readonly currency: string) {}

  priceKey(productId: number): string {
    return this.currency + ':' + productId;
  }

  @memoize({ keyResolver: 'priceKey', expirationTimeMs: 1000 })
  getPrice(productId: number): string {
    console.log('Computing price');
    return this.currency + ' ' + productId * 10;
  }
}

const prices = new PriceService('USD');
console.log(prices.getPrice(42)); // Computes; returns 'USD 420'.
console.log(prices.getPrice(42)); // Cached; returns 'USD 420'.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @memoize(), @memoize(milliseconds), or @memoize(config)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>keyResolver</code><span class="optional">Optional</span></td><td><code>callback | method key</code></td><td>Receives the original arguments and returns a string. A named method is bound to the current instance. A callback is called without automatic instance binding. Defaults to <code>JSON.stringify(args)</code>.</td></tr>
                  <tr><td><code>expirationTimeMs</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Schedules deletion after a cache miss computes its result. Omit it to keep entries indefinitely. Passing a number directly is shorthand for this field.</td></tr>
                  <tr><td><code>cache</code><span class="optional">Optional</span></td><td><code>Cache&lt;ReturnValue&gt;</code></td><td>Synchronous storage, defaulting to a separate <code>Map</code> for each instance and decorated method. Its values must match the method’s return type. An explicitly supplied cache is reused across instances.</td></tr>
                </tbody></table></docs-config-table>
                <docs-callout>Each instance has its own default cache for this method. Include mutable result-affecting state in the key, as the currency example does. If you supply a shared cache, include instance identity when needed to prevent collisions.</docs-callout>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">memoizify</span>(fn: (...args: A) =&gt; T, input?: MemoizeConfig | number): (...args: A) =&gt; T</code></docs-signature>
              <div data-example>
                <docs-code filename="cached-total.ts" language="typescript"><pre><code>import { memoizify, Cache } from 'utils-decorators';

const entries = new Map&lt;string, number&gt;();
const cache: Cache&lt;number&gt; = entries;

const total = memoizify((quantity: number, price: number): number =&gt; {
  console.log('Computing total');
  return quantity * price;
}, {
  cache,
  keyResolver: (quantity, price) =&gt; quantity + ':' + price,
});

console.log(total(3, 20)); // Computes; returns 60.
console.log(total(3, 20)); // Cached; returns 60.
entries.delete('3:20');
console.log(total(3, 20)); // Computes again; returns 60.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · memoizify(fn), memoizify(fn, milliseconds), or memoizify(fn, config)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; T</code></td><td>The source function. Argument types, return type, and any explicit <code>this</code> requirement are preserved.</td></tr>
                  <tr><td><code>keyResolver</code><span class="optional">Optional</span></td><td><code>callback | method key</code></td><td>Use an argument-based callback for standalone functions. A method key requires an explicit compatible receiver; see below. Defaults to <code>JSON.stringify(args)</code>.</td></tr>
                  <tr><td><code>expirationTimeMs</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Delay before deleting each newly computed entry. Omitted by default; cache hits do not extend the delay. A number as the second argument is shorthand.</td></tr>
                  <tr><td><code>cache</code><span class="optional">Optional</span></td><td><code>Cache&lt;T&gt;</code></td><td>Synchronous storage for the source’s return values. Defaults to a separate <code>Map</code> for each call to <code>memoizify</code>.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Advanced: use a named resolver with a receiver</summary>
                  <p>Declare the source’s receiver type, then call the wrapper with that receiver. The resolver is bound to the same receiver as the source.</p>
                  <docs-code filename="receiver-key.ts" language="typescript"><pre><code>import { memoizify } from 'utils-decorators';

type Receiver = {
  currency: string;
  key(id: number): string;
};

function getPrice(this: Receiver, id: number): string {
  return this.currency + ' ' + id * 10;
}

const cachedPrice = memoizify(getPrice, { keyResolver: 'key' });
const receiver: Receiver = {
  currency: 'EUR',
  key(id) { return this.currency + ':' + id; },
};

console.log(cachedPrice.call(receiver, 42)); // 'EUR 420'</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>For promise-returning work, consider <a href="#memoizeAsync">memoizeAsync</a>, which caches resolved values. <code>memoize</code> stores the raw return value, including a promise and its eventual rejection.</docs-callout>
          </docs-tabs>
          <docs-section anchor="cache" heading="The Cache contract">
            <p>Provide synchronous methods with these signatures. A <code>Map&lt;string, T&gt;</code> satisfies the exported <code>Cache&lt;T&gt;</code> interface.</p>
            <docs-config-table><table class="contract-table"><thead><tr><th scope="col">Method</th><th scope="col">Contract</th></tr></thead><tbody>
              <tr><td><code>has(key: string): boolean</code></td><td>Determines whether the source can be skipped. Cached <code>undefined</code>, <code>null</code>, and other falsy results are valid hits.</td></tr>
              <tr><td><code>get(key: string): T | null | undefined</code></td><td>Returns the stored value. When <code>has</code> is true, this must supply the corresponding value; the wrapper trusts that contract.</td></tr>
              <tr><td><code>set(key: string, value: T): void</code></td><td>Stores a computed result. The wrapper reads it back with <code>get</code> before returning.</td></tr>
              <tr><td><code>delete(key: string): void</code></td><td>Removes an entry when its scheduled expiry runs. You can also delete entries directly to invalidate them.</td></tr>
            </tbody></table></docs-config-table>
            <p>Reusing one cache across wrappers also shares its key space. Choose distinct key prefixes when those functions produce different results.</p>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Resolve key</li><li><span>02</span>Read or compute</li><li><span>03</span>Return cached value</li></ol>
            <ul class="behavior-list">
              <li>The resolver runs on every call, including cache hits. The default JSON key omits receiver identity and follows JSON serialization rules, which can collide for distinct values or throw on circular structures and bigint.</li>
              <li>On a miss, the source runs synchronously with the original arguments and receiver. Synchronous throws propagate and are not cached. Resolver and cache <code>has</code>, <code>set</code>, or <code>get</code> errors also propagate synchronously. Errors from scheduled cache deletion occur later in the expiry timer.</li>
              <li>Cached objects are returned by reference. Mutating one changes what later callers observe; no copy is made.</li>
              <li>Expiry uses a timer, not a timestamp check on access. A zero delay still deletes asynchronously, and a busy event loop can delay deletion. Hits do not reset the timer.</li>
              <li>Deleting an entry manually does not cancel its existing expiry timer. If you refill that key, the older timer can delete the replacement entry.</li>
              <li>The decorator isolates default caches per instance and method. A function wrapper shares its cache across its receivers. Supplying the same custom cache to decorators or wrappers intentionally shares storage and key space.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("memoize-page", MemoizePage);
})();

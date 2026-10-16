(() => {
  const { DocsElement } = window.DocsComponents;

  class MemoizeAsyncPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="memoizeAsync" heading="memoizeAsync" category="Caching"
          source="src/memoize-async/memoize-async.ts" edit-path="site/pages/memoizeAsync/memoizeAsync-page.js"
          next-title="multiDispatch" next-href="#multiDispatch">
          <p class="lead">Share pending work, then reuse the result.</p>
          <p class="intro">Cache resolved asynchronous results by argument key. Calls for the same key share pending work while the cache is checked and the source runs.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">memoizeAsync</span>(config?: AsyncMemoizeConfig | number)</code></docs-signature>
              <div data-example>
                <docs-code filename="user-service.ts" language="typescript"><pre><code>import { memoizeAsync } from 'utils-decorators';

class UserService {
  constructor(readonly tenant: string) {}

  cacheKey(id: number): string {
    return this.tenant + ':' + id;
  }

  @memoizeAsync({ expirationTimeMs: 5000, keyResolver: 'cacheKey' })
  async getName(id: number): Promise&lt;string&gt; {
    console.log('Loading', id);
    return 'User ' + id;
  }
}

const service = new UserService('team-a');
const names = await Promise.all([service.getName(42), service.getName(42)]);
// Loads once; names is ['User 42', 'User 42'].
await service.getName(42); // Uses the resolved cached value until expiration.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @memoizeAsync(config?)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>cache</code><span class="optional">Optional</span></td><td><code>Cache&lt;Result&gt; | AsyncCache&lt;Result&gt;</code></td><td>Storage for resolved values. Defaults to a new <code>Map</code> for this decorated method, shared across its instances.</td></tr>
                  <tr><td><code>keyResolver</code><span class="optional">Optional</span></td><td><code>callback | method key</code></td><td>Receives all original arguments and returns a string. Defaults to <code>JSON.stringify(args)</code>. Named resolvers are bound to the receiver; callbacks are not.</td></tr>
                  <tr><td><code>expirationTimeMs</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Schedules deletion after a newly computed value is stored. Omit for no automatic expiration. A number passed directly is shorthand for this option.</td></tr>
                </tbody></table></docs-config-table>
                <p class="form-guidance">Use on methods returning <code>Promise&lt;Result&gt;</code>. Cache keys do not automatically include the instance; include instance-specific state in a named resolver when results depend on it.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">memoizeAsyncify</span>(fn, config?: AsyncMemoizeConfig | number): (...args) =&gt; Promise&lt;Result&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="load-profile.ts" language="typescript"><pre><code>import { memoizeAsyncify } from 'utils-decorators';

const loadProfile = memoizeAsyncify(async (id: number): Promise&lt;string&gt; =&gt; {
  console.log('Loading', id);
  return 'Profile ' + id;
}, {
  keyResolver: (id) =&gt; 'profile:' + id,
  expirationTimeMs: 1000,
});

const profile: string = await loadProfile(7);
await loadProfile(7); // Reuses 'Profile 7' while cached.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · memoizeAsyncify(fn, config?)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; Promise&lt;Result&gt;</code></td><td>The asynchronous source. The wrapper preserves argument types and the source's receiver requirement.</td></tr>
                  <tr><td><code>cache</code><span class="optional">Optional</span></td><td><code>Cache&lt;Result&gt; | AsyncCache&lt;Result&gt;</code></td><td>Storage for resolved values. Defaults to a new <code>Map</code> per wrapper.</td></tr>
                  <tr><td><code>keyResolver</code><span class="optional">Optional</span></td><td><code>callback | method key</code></td><td>A string-producing resolver of the source's arguments, inferred from <code>fn</code>. Defaults to <code>JSON.stringify(args)</code>. A method key requires a compatible call receiver.</td></tr>
                  <tr><td><code>expirationTimeMs</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Expiration delay after storing each new value. Also accepted directly as the second argument. Omitted by default.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Advanced: an asynchronous cache</summary>
                  <p><code>AsyncCache</code> stores resolved values, not promises. Its <code>has</code> result decides whether a value exists; cached <code>null</code> and <code>undefined</code> are valid hits.</p>
                  <docs-code language="typescript"><pre><code>import { AsyncCache, memoizeAsyncify } from 'utils-decorators';

const values = new Map&lt;string, string | null&gt;();
const cache: AsyncCache&lt;string | null&gt; = {
  has: async (key) =&gt; values.has(key),
  get: async (key) =&gt; values.get(key),
  set: async (key, value) =&gt; { values.set(key, value); },
  delete: async (key) =&gt; { values.delete(key); },
};

const findName = memoizeAsyncify(async (id: number): Promise&lt;string | null&gt; =&gt; {
  return id === 1 ? 'Ada' : null;
}, { cache });

await findName(2); // Stores null at the default key '[2]'.
await findName(2); // Cached null; does not run the source.
await cache.delete('[2]'); // Remove the resolved entry explicitly.</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>Keys must identify the complete result. The decorator shares its cache and pending work across instances, and a function wrapper shares them across all receivers using it.</docs-callout>
          </docs-tabs>
          <docs-section anchor="cache" heading="Cache contract">
            <p>Both cache interfaces provide <code>has(key)</code>, <code>get(key)</code>, <code>set(key, value)</code>, and <code>delete(key)</code>. <code>Cache</code> uses synchronous methods: <code>has</code> returns boolean, <code>get</code> returns a value, null, or undefined, and <code>set</code>/<code>delete</code> return void. <code>AsyncCache</code> returns promises of those same results. A standard <code>Map</code> satisfies the synchronous interface.</p>
            <p>Cache operations run on the cache object as their receiver. The wrapper awaits <code>has</code>, <code>get</code>, and <code>set</code>. Scheduled expiration calls <code>delete</code> without awaiting it, so handle deletion failures in a custom cache.</p>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Resolve key</li><li><span>02</span>Share pending work</li><li><span>03</span>Read or fill cache</li></ol>
            <ul class="behavior-list">
              <li>The key resolver runs on every call, before checking pending work. If it throws, that call rejects before any pending state is read or created. The default JSON key can collide for values JSON does not distinguish and rejects circular arguments. Use a resolver suited to your inputs.</li>
              <li>Matching concurrent calls share one cache lookup and source computation. The wrapper returns native promises, without guaranteeing promise identity. After completion, the in-flight entry is removed and subsequent calls consult the resolved-value cache.</li>
              <li>The source receives the first call's arguments and receiver for a pending key. A cached result can therefore be returned to another receiver with that same key.</li>
              <li>Source throws, rejected source promises, and failed cache writes reject the call and remove the pending entry, allowing a retry. A failed write may still have changed a custom cache.</li>
              <li>If <code>cache.has</code> or <code>cache.get</code> fails, the rejected pending entry is retained. Later calls with that key keep rejecting through that entry; deleting the resolved cache value does not clear it.</li>
              <li>Expiration starts after a successful cache write, not when the source starts. Hits do not refresh it, and pre-existing entries do not receive a new timer. Timers delete by key, so replacing an entry externally does not cancel its previously scheduled deletion.</li>
              <li>No wrapper-level clear or cancellation API is exposed. Deleting from a supplied cache removes resolved data but does not cancel pending work or its later write.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("memoize-async-page", MemoizeAsyncPage);
})();

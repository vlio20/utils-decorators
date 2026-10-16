(() => {
  const { DocsElement } = window.DocsComponents;

  class DelegatePage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="delegate" heading="delegate" category="Async"
          source="src/delegate/delegate.ts" edit-path="site/pages/delegate/delegate-page.js"
          next-title="execTime" next-href="#execTime">
          <p class="lead">Share one request while it is in flight.</p>
          <p class="intro">Concurrent calls with the same key receive the same promise. Once that promise settles, the next call starts fresh work.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">delegate</span>(keyResolver?: (...args: A) =&gt; string)</code></docs-signature>
              <div data-example>
                <docs-code filename="user-service.ts" language="typescript"><pre><code>import { delegate } from 'utils-decorators';

class UserService {
  requests = 0;

  @delegate()
  async getName(id: number): Promise&lt;string&gt; {
    this.requests += 1;
    await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 100));
    return 'User ' + id;
  }
}

const service = new UserService();
const first = service.getName(42);
const second = service.getName(42);
console.log(first === second); // true
console.log(await Promise.all([first, second])); // ['User 42', 'User 42']
console.log(service.requests); // 1

await service.getName(42); // The previous request has finished.
console.log(service.requests); // 2</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @delegate(keyResolver?)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>keyResolver</code><span class="optional">Optional</span></td><td><code>(...args) =&gt; string</code></td><td>Receives the method’s arguments and returns the deduplication key. Defaults to <code>JSON.stringify(args)</code>. Pass the resolver directly, for example <code>@delegate((id: number) =&gt; String(id))</code>.</td></tr>
                </tbody></table></docs-config-table>
                <docs-callout>The decorated method shares its pending map across instances. Calls with the same key can share a result produced using the first instance’s state.</docs-callout>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">delegatify</span>(fn: (...args: A) =&gt; Promise&lt;T&gt;, keyResolver?: (...args: A) =&gt; string): (...args: A) =&gt; Promise&lt;T&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="load-user.ts" language="typescript"><pre><code>import { delegatify } from 'utils-decorators';

type UserRequest = { id: number; traceId: string };

const loadUser = delegatify(
  async (request: UserRequest): Promise&lt;string&gt; =&gt; {
    await Promise.resolve();
    console.log('Request trace:', request.traceId);
    return 'User ' + request.id;
  },
  request =&gt; String(request.id),
);

const first = loadUser({ id: 42, traceId: 'a' });
const second = loadUser({ id: 42, traceId: 'b' });
console.log(first === second); // true; only trace 'a' reaches the source.
console.log(await second); // 'User 42'</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · delegatify(fn, keyResolver?)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; Promise&lt;T&gt;</code></td><td>The promise-returning function. The wrapper preserves argument types, resolved value type, and any explicit <code>this</code> requirement.</td></tr>
                  <tr><td><code>keyResolver</code><span class="optional">Optional</span></td><td><code>(...args) =&gt; string</code></td><td>Defaults to <code>JSON.stringify(args)</code>. Every argument that can change the result should contribute to the key. Calls that share a key use the first call’s arguments.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Keep pending work separate for each instance</summary>
                  <p>Create a wrapper in an instance field. Each call to <code>delegatify</code> owns a separate map, and the arrow function below captures its service instance.</p>
                  <docs-code filename="account-service.ts" language="typescript"><pre><code>import { delegatify } from 'utils-decorators';

class AccountService {
  constructor(private readonly account: string) {}

  getName = delegatify(async (id: number): Promise&lt;string&gt; =&gt; {
    await Promise.resolve();
    return this.account + ': User ' + id;
  });
}

const left = new AccountService('left');
const right = new AccountService('right');
console.log(await Promise.all([left.getName(42), right.getName(42)]));
// ['left: User 42', 'right: User 42']</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>This shares pending work only. For storing completed results, see <a href="#memoizeAsync">memoizeAsync</a>.</docs-callout>
          </docs-tabs>
          <docs-section anchor="keys" heading="Choose a key that represents the result">
            <p>The default key serializes the entire argument array. JSON serialization can collapse distinct values, depends on object property order, and throws for circular structures or unsupported values such as bigint. Supply a resolver when those rules do not fit your inputs.</p>
            <p>The resolver receives only the call arguments. It is not bound to the receiver, and the default key does not include <code>this</code>. Pass relevant identity as an argument or use independent wrappers when results depend on instance state.</p>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Compute key</li><li><span>02</span>Start or share promise</li><li><span>03</span>Remove settled entry</li></ol>
            <ul class="behavior-list">
              <li>The first call for a key invokes the source immediately with its receiver and arguments. Concurrent calls for that key return the same stored promise; different keys run independently.</li>
              <li>The stored promise comes from the source’s <code>.finally()</code>. It forwards the source’s value or rejection and removes its map entry on either outcome, before callers observe that settlement.</li>
              <li>All callers sharing a failed request receive its rejection. A later call can start a new attempt because failures are removed too.</li>
              <li>There is no expiry or capacity setting. A promise that never settles keeps its key occupied and later matching calls continue to share it.</li>
              <li>A resolver error or a synchronous throw from the source escapes synchronously; no entry is stored for that call.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("delegate-page", DelegatePage);
})();

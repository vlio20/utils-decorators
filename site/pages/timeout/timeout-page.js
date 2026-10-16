(() => {
  const { DocsElement } = window.DocsComponents;

  class TimeoutPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="timeout" heading="timeout" category="Async"
          source="src/timeout/timeout.ts" edit-path="site/pages/timeout/timeout-page.js">
          <p class="lead">Stop waiting when a call takes too long.</p>
          <p class="intro">Return a promise that settles with the source’s result or rejects with <code>TimeoutError</code> when its timer wins. The underlying operation continues after a timeout.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">timeout</span>(ms: number)</code></docs-signature>
              <div data-example>
                <docs-code filename="user-service.ts" language="typescript"><pre><code>import { timeout, TimeoutError } from 'utils-decorators';

class UserService {
  @timeout(20)
  async getName(id: number): Promise&lt;string&gt; {
    await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 100));
    return 'User ' + id;
  }
}

try {
  const name = await new UserService().getName(42);
  console.log(name);
} catch (error: unknown) {
  if (error instanceof TimeoutError) {
    console.log('The user lookup took too long');
  } else {
    throw error; // Preserve failures from the lookup itself.
  }
}</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @timeout(ms)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>ms</code><span class="required">Required</span></td><td><code>number</code></td><td>Delay passed to <code>setTimeout</code> for each call. There is no default or numeric validation; use a finite nonnegative duration.</td></tr>
                </tbody></table></docs-config-table>
                <p>Apply it to a method returning <code>Promise&lt;T&gt;</code>. The decorated call returns a new native promise, so methods requiring custom promise properties are not compatible.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">timeoutify</span>(fn: (...args: A) =&gt; Promise&lt;T&gt;, ms: number): (...args: A) =&gt; Promise&lt;T&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="get-name.ts" language="typescript"><pre><code>import { timeoutify } from 'utils-decorators';

async function getName(id: number): Promise&lt;string&gt; {
  await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 20));
  return 'User ' + id;
}

const getNameWithTimeout = timeoutify(getName, 100);
const result: Promise&lt;string&gt; = getNameWithTimeout(42);
console.log(await result); // 'User 42', when the source finishes first.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · timeoutify(fn, ms)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; Promise&lt;T&gt;</code></td><td>The promise-returning operation. The wrapper preserves argument types, resolved result type, and any explicit <code>this</code> requirement. Synchronous value-returning functions are not supported.</td></tr>
                  <tr><td><code>ms</code><span class="required">Required</span></td><td><code>number</code></td><td>Timer delay per invocation, starting after the source returns its promise. Values are passed directly to the host timer API.</td></tr>
                </tbody></table></docs-config-table>
              </div>
            </template>
            <docs-callout>A timeout rejects the caller’s promise; it does not abort a request, cancel work, or undo side effects. Use the underlying operation’s own cancellation API when needed.</docs-callout>
          </docs-tabs>
          <docs-section anchor="errors" heading="Recognize a timeout">
            <p>Import <code>TimeoutError</code> from <code>utils-decorators</code> and narrow an unknown error with <code>instanceof TimeoutError</code>. It extends <code>Error</code> and has the message <code>'timeout occurred after ' + ms</code>.</p>
            <p>If the source rejects before the timeout wins, its original rejection reason is forwarded unchanged. A source rejection need not be an <code>Error</code>, so keep other caught values typed as <code>unknown</code>.</p>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Invoke source</li><li><span>02</span>Schedule timeout</li><li><span>03</span>First settlement wins</li></ol>
            <ul class="behavior-list">
              <li>The source runs immediately with the original receiver and arguments. Each invocation gets an independent timer and promise; calls do not cancel or share one another’s timeouts.</li>
              <li>A source fulfillment resolves the returned promise, a source rejection rejects it, and the timeout callback rejects it with <code>TimeoutError</code>. Once settled, later outcomes cannot change it.</li>
              <li>A synchronous throw from a promise-returning source becomes a rejection of the returned promise. That throw prevents the timeout timer from being scheduled.</li>
              <li>The timeout is scheduled after the source returns, so it cannot interrupt synchronous work. A busy event loop can also delay the timeout callback beyond <code>ms</code>.</li>
              <li>Zero milliseconds still uses a timer, rather than an immediate rejection. An already fulfilled source promise can resolve the wrapper before that timer runs.</li>
              <li>The timer is not cleared when the source finishes and is not unreferenced in Node.js. It remains scheduled until it fires, even after an early result, and can keep a Node.js process alive until then.</li>
              <li>If the timeout wins, the source keeps running. Its later rejection has a handler attached by this wrapper, but any side effects still occur.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("timeout-page", TimeoutPage);
})();

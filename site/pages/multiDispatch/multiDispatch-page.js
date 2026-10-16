(() => {
  const { DocsElement } = window.DocsComponents;

  class MultiDispatchPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="multiDispatch" heading="multiDispatch" category="Async"
          source="src/multi-dispatch/multi-dispatch.ts" edit-path="site/pages/multiDispatch/multiDispatch-page.js"
          next-title="onError" next-href="#onError">
          <p class="lead">Run several attempts and take the first success.</p>
          <p class="intro">Start the same promise-returning operation multiple times without waiting between attempts. Return the first fulfilled result, or reject after every attempt fails.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">multiDispatch</span>(dispatchesAmount: number)</code></docs-signature>
              <div data-example>
                <docs-code filename="lookup-service.ts" language="typescript"><pre><code>import { multiDispatch } from 'utils-decorators';

class LookupService {
  private attempts = 0;

  @multiDispatch(2)
  async getName(id: number): Promise&lt;string&gt; {
    const attempt = ++this.attempts;
    const delay = attempt === 1 ? 100 : 20;
    await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, delay));
    return 'User ' + id + ' from attempt ' + attempt;
  }
}

const service = new LookupService();
console.log(await service.getName(42)); // 'User 42 from attempt 2'
// Attempt 1 continues until it finishes.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @multiDispatch(dispatchesAmount)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>dispatchesAmount</code><span class="required">Required</span></td><td><code>number</code></td><td>Total attempts started for each call. Pass a positive finite integer, such as <code>2</code>. The implementation does not validate the number.</td></tr>
                </tbody></table></docs-config-table>
                <p>Apply it to a method returning <code>Promise&lt;T&gt;</code>. The decorated call returns a native promise for the winning result; methods requiring extra custom promise properties are not compatible.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">multiDispatchify</span>(fn: (...args: A) =&gt; Promise&lt;T&gt;, dispatchesAmount: number): (...args: A) =&gt; Promise&lt;T&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="lookup.ts" language="typescript"><pre><code>import { multiDispatchify } from 'utils-decorators';

let attempts = 0;
const getName = multiDispatchify(async (id: number): Promise&lt;string&gt; =&gt; {
  const attempt = ++attempts;
  await Promise.resolve();
  if (attempt === 1) throw new Error('First attempt failed');
  return 'User ' + id;
}, 2);

console.log(await getName(42)); // 'User 42'
console.log(attempts); // 2; an early rejection does not end the call.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · multiDispatchify(fn, dispatchesAmount)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; Promise&lt;T&gt;</code></td><td>The operation to invoke repeatedly. Its argument types, resolved value type, and any explicit <code>this</code> requirement are preserved. Synchronous value-returning functions are not supported.</td></tr>
                  <tr><td><code>dispatchesAmount</code><span class="required">Required</span></td><td><code>number</code></td><td>Total attempts for each wrapper invocation. Use a positive finite integer. There is no default, delay, or retry backoff.</td></tr>
                </tbody></table></docs-config-table>
              </div>
            </template>
            <docs-callout>Every attempt performs the operation and its side effects. Losing attempts are not aborted. Use this for operations that are safe to repeat concurrently.</docs-callout>
          </docs-tabs>
          <docs-section anchor="results" heading="Success and failure">
            <ol class="flow"><li><span>01</span>Start all attempts</li><li><span>02</span>Wait for a success</li><li><span>03</span>Return its value</li></ol>
            <ul class="behavior-list">
              <li>The first fulfillment wins. Earlier rejections do not reject the combined promise while another attempt could still succeed.</li>
              <li>For a positive integer count, if every attempt rejects, the combined promise rejects with the last observed rejection reason. It does not collect errors into an aggregate.</li>
              <li>If no attempt fulfills and at least one stays pending, the combined promise stays pending too. There is no built-in timeout.</li>
              <li>Attempts start in a synchronous loop. Each receives the same argument values and receiver; synchronous work before a promise is returned runs in order, rather than on separate threads.</li>
              <li>A synchronous throw from a promise-returning source rejects the combined promise and stops launching further attempts. Previously launched work continues. In an <code>async</code> source, a throw becomes a rejected attempt, so remaining attempts still launch.</li>
              <li>Later outcomes cannot change a settled result. Rejections from the other launched promises have handlers attached by the wrapper.</li>
              <li>Each wrapper call has its own success and failure tracking. There is no deduplication across calls, although the source may still share instance or closure state.</li>
            </ul>
          </docs-section>
          <docs-section anchor="count" heading="Pass a positive integer count">
            <p>The count is used directly by the launch loop and the all-failed check. It is not rounded or rejected up front.</p>
            <ul class="behavior-list">
              <li><code>0</code>, negative numbers, <code>NaN</code>, and positive numbers below <code>1</code> launch no attempts and leave the returned promise pending.</li>
              <li>A positive fraction above <code>1</code> launches its whole-number portion of attempts, but the failure count never equals the fractional count. A success can resolve the call; all failures leave it pending.</li>
              <li><code>Infinity</code> makes the launch loop unbounded if the source keeps returning normally. Validate dynamic counts before calling the decorator or wrapper.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("multi-dispatch-page", MultiDispatchPage);
})();

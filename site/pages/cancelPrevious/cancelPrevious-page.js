(() => {
  const { DocsElement } = window.DocsComponents;

  class CancelPreviousPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="cancelPrevious" heading="cancelPrevious" category="Async"
          source="src/cancel-previous/cancel-previous.ts" edit-path="site/pages/cancelPrevious/cancelPrevious-page.js"
          next-title="debounce" next-href="#debounce">
          <p class="lead">Let the latest call supply the result.</p>
          <p class="intro">Reject the previous call’s pending promise whenever a new call starts. Useful for ignoring stale search results while the underlying requests continue running.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">cancelPrevious</span>()</code></docs-signature>
              <div data-example>
                <docs-code filename="search-service.ts" language="typescript"><pre><code>import { cancelPrevious, CanceledPromise } from 'utils-decorators';

class SearchService {
  @cancelPrevious()
  async search(query: string): Promise&lt;string[]&gt; {
    await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 100));
    return [query + ' result'];
  }
}

const service = new SearchService();
const stale = service.search('ca').catch((error: unknown) =&gt; {
  if (error instanceof CanceledPromise) return [];
  throw error;
});
const latest = service.search('cats');

console.log(await stale); // []
console.log(await latest); // ['cats result']</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @cancelPrevious()</p>
                <p>No configuration arguments. Apply it to a method returning <code>Promise&lt;T&gt;</code>. Each call forwards its arguments and receiver and returns a new native promise for that call’s result.</p>
                <docs-callout>The decorated method shares one cancellation slot across all instances. Calling it on another instance can reject the first instance’s pending call.</docs-callout>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">cancelPreviousify</span>(fn: (...args: A) =&gt; Promise&lt;T&gt;): (...args: A) =&gt; Promise&lt;T&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="search.ts" language="typescript"><pre><code>import { cancelPreviousify, CanceledPromise } from 'utils-decorators';

const search = cancelPreviousify(async (query: string): Promise&lt;string[]&gt; =&gt; {
  await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 100));
  return [query + ' result'];
});

const stale = search('ca').catch((error: unknown) =&gt; {
  if (error instanceof CanceledPromise) return [];
  throw error;
});
const latest = search('cats');

console.log(await stale); // []
console.log(await latest); // ['cats result']</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · cancelPreviousify(fn)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; Promise&lt;T&gt;</code></td><td>The promise-returning function to wrap. Argument types, resolved result type, and any explicit <code>this</code> requirement are preserved.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Keep cancellation separate for each instance</summary>
                  <p>Create a wrapper in an instance field so each service owns its cancellation slot. Separate calls to <code>cancelPreviousify</code> create independent slots.</p>
                  <docs-code filename="independent-search.ts" language="typescript"><pre><code>import { cancelPreviousify, CanceledPromise } from 'utils-decorators';

class SearchService {
  search = cancelPreviousify(async (query: string): Promise&lt;string&gt; =&gt; {
    await Promise.resolve();
    return query;
  });
}

const left = new SearchService();
const right = new SearchService();
const first = left.search('first').catch((error: unknown) =&gt; {
  if (error instanceof CanceledPromise) return 'superseded';
  throw error;
});
const other = right.search('other'); // Does not cancel left’s call.
const latest = left.search('latest'); // Cancels left’s first call.

console.log(await Promise.all([first, other, latest]));
// ['superseded', 'other', 'latest']</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>Cancellation rejects the returned promise with <code>CanceledPromise</code> (message: <code>'canceled'</code>). It does not abort a request, stop a timer, or undo side effects.</docs-callout>
          </docs-tabs>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Reject previous promise</li><li><span>02</span>Start new call</li><li><span>03</span>Forward its result</li></ol>
            <ul class="behavior-list">
              <li>Every invocation runs the original function immediately, even when arguments are identical. There is no debounce delay or comparison of inputs.</li>
              <li>The new call rejects the preceding wrapper promise before invoking the source. Its rejection handler runs in a promise microtask; attach handlers when creating each call to handle cancellation promptly.</li>
              <li>A settled wrapper promise cannot be canceled. If the source has resolved but its result has not yet reached the wrapper, a new call can still win and reject that pending wrapper.</li>
              <li>The latest call forwards the source’s resolved value or rejection. A synchronous throw from the source becomes a rejection of the returned promise.</li>
              <li>Superseded work continues. Its eventual value or error cannot change the already rejected wrapper promise, but its side effects still happen.</li>
              <li>Cancellation belongs to the wrapper, not the receiver or arguments. Reusing one wrapper with different receivers still shares its cancellation slot.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("cancel-previous-page", CancelPreviousPage);
})();

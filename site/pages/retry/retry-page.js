(() => {
  const { DocsElement } = window.DocsComponents;

  class RetryPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="retry" heading="retry" category="Errors"
          source="src/retry/retry.ts" edit-path="site/pages/retry/retry-page.js"
          next-title="throttle" next-href="#throttle">
          <p class="lead">Give a failed operation another attempt.</p>
          <p class="intro">Retry an asynchronous call after configured pauses. Each invocation starts immediately, then repeats the same arguments and receiver until it succeeds or runs out of retries.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">retry</span>(input: number | number[] | RetryInputConfig)</code></docs-signature>
              <div data-example>
                <docs-code filename="connection.ts" language="typescript"><pre><code>import { retry } from 'utils-decorators';

class Connection {
  private attempts = 0;

  @retry({ retries: 2, delay: 100, onRetry: 'reportRetry' })
  async connect(host: string): Promise&lt;string&gt; {
    this.attempts += 1;
    if (this.attempts &lt; 3) throw new Error('Not ready');
    return 'Connected to ' + host;
  }

  reportRetry(error: unknown, retryIndex: number, args: [host: string]): void {
    console.warn('Retry', retryIndex + 1, 'for', args[0], error);
  }
}

const result = await new Connection().connect('api.example.com'); // 'Connected to api.example.com' on attempt 3</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @retry(input)</p>
                <p class="form-guidance">Use a retry count, an array of delays, or the configuration below. The method must return a compatible <code>Promise</code>. Named retry hooks are bound to the instance.</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>retries</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Extra attempts after the first. Use a nonnegative integer. Mutually exclusive with <code>delaysArray</code>.</td></tr>
                  <tr><td><code>delaysArray</code><span class="optional">Optional</span></td><td><code>number[]</code></td><td>One delay in milliseconds for each retry. Its length is the number of extra attempts.</td></tr>
                  <tr><td><code>delay</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Pause for each count-based retry; defaults to <code>1000</code> ms. Ignored with <code>delaysArray</code>.</td></tr>
                  <tr><td><code>onRetry</code><span class="optional">Optional</span></td><td><code>callback | method key</code></td><td>Called as <code>(error, retryIndex, args)</code> before each retry's pause. A named method must exist on the receiver.</td></tr>
                </tbody></table></docs-config-table>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">retryfy</span>(fn, input: number | number[] | RetryInputConfig): (...args) =&gt; Promise&lt;Result&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="load-message.ts" language="typescript"><pre><code>import { retryfy } from 'utils-decorators';

let attempts = 0;
const loadMessage = retryfy(async (id: number): Promise&lt;string&gt; =&gt; {
  attempts += 1;
  if (attempts &lt; 3) throw new Error('Temporarily unavailable');
  return 'Message ' + id;
}, [100, 300]);

const message: string = await loadMessage(7);
// Initial attempt, retry after 100 ms, then retry after another 300 ms.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · retryfy(fn, input)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; Promise&lt;Result&gt;</code></td><td>The asynchronous source. Arguments and its receiver requirement are preserved.</td></tr>
                  <tr><td><code>input</code><span class="required">Required</span></td><td><code>number | number[] | config</code></td><td>A count uses 1000 ms per retry. An array supplies each pause. A configuration accepts <code>retries</code> or <code>delaysArray</code>, plus optional <code>delay</code> and <code>onRetry</code>, with the same meanings as the decorator.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Advanced: a retry hook with a receiver</summary>
                  <p>Declare a compatible <code>this</code> type on the source when using a method key. The wrapper binds the source once per invocation, preserving the receiver on every attempt.</p>
                  <docs-code language="typescript"><pre><code>import { retryfy } from 'utils-decorators';

type Receiver = {
  ready: boolean;
  prepare(error: unknown, retryIndex: number, args: [id: number]): void;
};

async function load(this: Receiver, id: number): Promise&lt;number&gt; {
  if (!this.ready) throw new Error('Not ready');
  return id;
}

const loadWithRetry = retryfy(load, { retries: 1, delay: 10, onRetry: 'prepare' });
const receiver: Receiver = {
  ready: false,
  prepare(error, retryIndex, args) {
    console.warn(error, retryIndex, args[0]);
    this.ready = true;
  },
};

const result = await loadWithRetry.call(receiver, 42); // 42 on the second attempt</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout><code>retries: 2</code> permits up to three source calls: the initial attempt and two retries. A zero count or empty delay array makes only the initial attempt.</docs-callout>
          </docs-tabs>
          <docs-section anchor="hook" heading="Retry hook">
            <p><code>onRetry(error, retryIndex, args)</code> receives the failure reason as <code>unknown</code> and a zero-based index: <code>0</code> before the first retry, <code>1</code> before the second. The third parameter is the original argument tuple, with the same object references used on every attempt. Existing hooks accepting only the error and index remain supported. Narrow the error before reading properties.</p>
            <p>The hook is called only when another attempt remains, before waiting. Its result is ignored and async hooks are not awaited. A synchronous hook throw stops retrying and rejects the returned promise with that error; handle rejected async hook promises inside the hook.</p>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Attempt call</li><li><span>02</span>Report failure</li><li><span>03</span>Wait and retry</li></ol>
            <ul class="behavior-list">
              <li>Only failures trigger retries. Successful results resolve the returned native promise without another attempt; exhausting attempts rejects it with the last source error. The first attempt has no configured pause.</li>
              <li>The public API requires promise-returning sources. A synchronous throw from such a source is still caught and retried. Each pause begins after the failed attempt and synchronous retry hook complete.</li>
              <li>Each invocation has its own retry sequence; concurrent calls are not combined or serialized. Retrying can repeat side effects, so use it for operations that can safely be attempted again.</li>
              <li>Named hooks are resolved before the retry sequence starts. A missing or noncallable named hook throws synchronously from the wrapper call. Callback hooks receive no automatic instance binding.</li>
              <li>Configuration is normalized when the wrapper is created. Runtime validation is limited: integer shorthand builds an array of delays, and negative counts can throw <code>RangeError</code>. Delay values are passed to timers without validation.</li>
              <li>Specify a count or delay array explicitly. A configuration omitting both currently creates one retry using <code>delay</code> (1000 ms by default). Types prohibit both options together; the runtime conflict check only rejects when both supplied values are truthy.</li>
              <li>No cancellation or timeout API is provided. A source promise that never settles prevents its retry sequence from advancing.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("retry-page", RetryPage);
})();

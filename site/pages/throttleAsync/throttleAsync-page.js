(() => {
  const { DocsElement } = window.DocsComponents;

  class ThrottleAsyncPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="throttleAsync" heading="throttleAsync" category="Concurrency"
          source="src/throttle-async/throttle-async.ts" edit-path="site/pages/throttleAsync/throttleAsync-page.js"
          next-title="timeout" next-href="#timeout">
          <p class="lead">Keep asynchronous work within a concurrency limit.</p>
          <p class="intro">Run a limited number of asynchronous calls at once and queue the rest in arrival order. Each call keeps its own arguments, receiver, promise, and result.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">throttleAsync</span>(parallelCalls?: number)</code></docs-signature>
              <div data-example>
                <docs-code filename="worker.ts" language="typescript"><pre><code>import { throttleAsync } from 'utils-decorators';

class Worker {
  @throttleAsync(2)
  async process(id: number): Promise&lt;string&gt; {
    console.log('Starting', id);
    await new Promise&lt;void&gt;((resolve) =&gt; setTimeout(resolve, 20));
    return 'Done ' + id;
  }
}

const worker = new Worker();
const results = await Promise.all([1, 2, 3].map((id) =&gt; worker.process(id)));
// Starts 1 and 2 immediately; 3 starts when a slot becomes available.
// results: ['Done 1', 'Done 2', 'Done 3']</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @throttleAsync(parallelCalls?)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>parallelCalls</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Maximum active calls; defaults to <code>1</code>. Pass a positive integer directly. This is a positional argument, not a configuration object.</td></tr>
                </tbody></table></docs-config-table>
                <p class="form-guidance">Use on promise-returning methods. One queue and concurrency counter are shared across all instances using this decorated method.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">throttleAsyncify</span>(fn, parallelCalls?: number): (...args) =&gt; Promise&lt;Result&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="process-jobs.ts" language="typescript"><pre><code>import { throttleAsyncify } from 'utils-decorators';

const processJob = throttleAsyncify(async (id: number): Promise&lt;string&gt; =&gt; {
  console.log('Starting', id);
  await new Promise&lt;void&gt;((resolve) =&gt; setTimeout(resolve, 10));
  return 'Job ' + id;
}); // One active call by default.

const results: string[] = await Promise.all([processJob(1), processJob(2)]);
// Job 2 starts after job 1 settles; both results are returned.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · throttleAsyncify(fn, parallelCalls?)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; Promise&lt;Result&gt;</code></td><td>The asynchronous source. Argument types, resolved result type, and receiver requirement are preserved.</td></tr>
                  <tr><td><code>parallelCalls</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Maximum active calls for this wrapper; defaults to <code>1</code>. All receivers using the same wrapper share its queue and limit.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Advanced: shared queue, separate receivers</summary>
                  <p>A queued call retains its original receiver. Sharing the wrapper serializes these two calls while preserving each receiver's state.</p>
                  <docs-code language="typescript"><pre><code>import { throttleAsyncify } from 'utils-decorators';

async function report(this: { name: string }, id: number): Promise&lt;string&gt; {
  await Promise.resolve();
  return this.name + ':' + id;
}

const queuedReport = throttleAsyncify(report);
const first = { name: 'First', queuedReport };
const second = { name: 'Second', queuedReport };

const results = await Promise.all([
  first.queuedReport(1),
  second.queuedReport(2),
]); // ['First:1', 'Second:2']</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>This limit counts active promises. It does not enforce a time interval, drop calls, or combine duplicate requests. A settled call frees a slot for the next queued call.</docs-callout>
          </docs-tabs>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Enqueue call</li><li><span>02</span>Wait for slot</li><li><span>03</span>Run and release</li></ol>
            <ul class="behavior-list">
              <li>If capacity is available, the source starts during the wrapper call. Otherwise its arguments and receiver stay in a FIFO queue until capacity becomes available. Completion order can differ from start order.</li>
              <li>Each invocation returns its own native promise. A source resolution or rejection settles that call's promise, and internal cleanup then releases the slot and starts the next call. One rejected source promise does not stop the queue.</li>
              <li>Use an <code>async</code> source or return rejected promises for failures. A source that throws synchronously before returning a promise bypasses cleanup, leaves its call promise pending, and consumes a slot permanently. If started immediately, that error throws from the wrapper call; if started from the queue, it rejects an internal cleanup chain.</li>
              <li>The limit is not validated. Zero, negative numbers, and <code>NaN</code> leave all calls pending. A positive fractional limit permits its rounded-up number of active calls; <code>Infinity</code> imposes no effective limit. Use positive integers.</li>
              <li>Queues are shared per wrapper or decorated method, rather than per receiver. Create separate wrappers when workloads need independent limits.</li>
              <li>There is no cancellation, queue-size limit, or built-in timeout. A source promise that never settles keeps its slot occupied. At limit one, awaiting another call through the same wrapper from inside the active source can deadlock.</li>
              <li>Queued object arguments and receivers are retained by reference. Mutations before execution can affect the source's result. Custom properties or identity of the source promise are not preserved.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("throttle-async-page", ThrottleAsyncPage);
})();

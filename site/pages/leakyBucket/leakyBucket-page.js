(() => {
  const { DocsElement } = window.DocsComponents;

  class LeakyBucketPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="leakyBucket" heading="leakyBucket" category="Rate control"
          source="src/leaky-bucket/leaky-bucket.ts" edit-path="site/pages/leakyBucket/leakyBucket-page.js"
          next-title="rateLimit" next-href="#rateLimit">
          <p class="lead">Queue bursts and start calls at a steady rate.</p>
          <p class="intro">Start the first call immediately, then space subsequent starts by at least <code>timeSpanMs / allowedCalls</code>. Waiting calls keep their arrival order and each caller receives its own promise.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">leakyBucket</span>(config: LeakyBucketConfigs)</code></docs-signature>
              <div data-example>
                <docs-code filename="api-client.ts" language="typescript"><pre><code>import { leakyBucket } from 'utils-decorators';

class ApiClient {
  @leakyBucket({ allowedCalls: 10, timeSpanMs: 1000, maxQueueSize: 500 })
  async getItem(id: number): Promise&lt;Response&gt; {
    return fetch('/api/items/' + id);
  }
}

const client = new ApiClient();
const results = await Promise.all([1, 2, 3].map(id =&gt; client.getItem(id)));
// Starts immediately, after at least 100 ms, and after at least 200 ms.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @leakyBucket(config)</p>
                <p>Use on methods returning <code>Promise&lt;T&gt;</code>. By default each method on each instance has its own queue and pacing budget. Supply a shared <code>bucket</code> to share a quota across instances or methods.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">leakyBucketify</span>(fn, config: LeakyBucketConfigs): (...args) =&gt; Promise&lt;Result&gt;</code></docs-signature>
              <div data-example>
                <docs-code filename="send-notifications.ts" language="typescript"><pre><code>import { leakyBucketify } from 'utils-decorators';

const send = leakyBucketify(async (message: string): Promise&lt;Response&gt; =&gt; {
  return fetch('/api/notifications', { method: 'POST', body: message });
}, { allowedCalls: 2, timeSpanMs: 1000 });

await Promise.all(['Hello', 'Welcome', 'Thanks'].map(message =&gt; send(message)));
// Sends one notification at a time interval of at least 500 ms.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · leakyBucketify(fn, config)</p>
                <p>The wrapper preserves the source's argument types, receiver requirement, and resolved result type. All receivers using the same wrapper share its queue. Separate wrappers get independent buckets unless given the same explicit bucket.</p>
              </div>
            </template>
            <docs-callout>Rate counts call starts, independently of completion. Slow requests can overlap. Use <code>throttleAsync</code> when you need to limit concurrent work. Use <code>rateLimit</code> when excess calls should invoke a handler instead of waiting.</docs-callout>
          </docs-tabs>
          <docs-section anchor="options" heading="Shared options">
            <docs-config-table><table><tbody>
              <tr><td><code>allowedCalls</code><span class="required">Required without bucket</span></td><td><code>number</code></td><td>Positive safe integer used to calculate the interval between starts.</td></tr>
              <tr><td><code>timeSpanMs</code><span class="required">Required without bucket</span></td><td><code>number</code></td><td>Positive finite duration in milliseconds. Dividing by allowedCalls must produce a positive interval.</td></tr>
              <tr><td><code>maxQueueSize</code><span class="optional">Optional</span></td><td><code>number</code></td><td>Maximum waiting calls, excluding running work; defaults to <code>1000</code>. Must be a non-negative safe integer. Zero admits only calls that can start immediately. Full queues reject with <code>Error('Leaky bucket queue is full.')</code>.</td></tr>
              <tr><td><code>bucket</code><span class="optional">Optional</span></td><td><code>LeakyBucket</code></td><td>A shared in-memory limiter, created with <code>new LeakyBucket({ allowedCalls, timeSpanMs, maxQueueSize? })</code>. Supply either this option or rate/queue options; their types are mutually exclusive.</td></tr>
              <tr><td><code>signalResolver</code><span class="optional">Optional</span></td><td><code>(...args) =&gt; AbortSignal | undefined</code></td><td>Receives the original arguments and is bound to the call's receiver. An aborted signal rejects a waiting call with <code>signal.reason</code>, removes it from the queue, and frees capacity. Resolver errors reject that call's promise.</td></tr>
            </tbody></table></docs-config-table>
            <p>Invalid numeric configuration throws a <code>RangeError</code> when constructing the bucket or creating the wrapper/decorated method.</p>
          </docs-section>
          <docs-section anchor="sharing" heading="Share an API quota">
            <p>Several endpoints can consume the same account quota. Reuse one bucket to pace all their starts in a single FIFO queue.</p>
            <docs-code filename="shared-quota.ts" language="typescript"><pre><code>import { LeakyBucket, leakyBucket } from 'utils-decorators';

const quota = new LeakyBucket({ allowedCalls: 10, timeSpanMs: 1000 });

class ApiClient {
  @leakyBucket({ bucket: quota })
  async getItem(id: number): Promise&lt;Response&gt; {
    return fetch('/api/items/' + id);
  }

  @leakyBucket({ bucket: quota })
  async listItems(): Promise&lt;Response&gt; {
    return fetch('/api/items');
  }
}

await Promise.all([new ApiClient().getItem(1), new ApiClient().listItems()]);
// These starts share the same 100 ms spacing.</code></pre></docs-code>
          </docs-section>
          <docs-section anchor="cancellation" heading="Cancel waiting work">
            <docs-code filename="cancel-request.ts" language="typescript"><pre><code>import { leakyBucketify } from 'utils-decorators';

const getItem = leakyBucketify(async (id: number, signal?: AbortSignal) =&gt; {
  return fetch('/api/items/' + id, { signal });
}, {
  allowedCalls: 1,
  timeSpanMs: 1000,
  signalResolver: (_id, signal) =&gt; signal,
});

await getItem(1);
const controller = new AbortController();
const pending = getItem(2, controller.signal);
const handled = pending.catch(error =&gt; console.log('Cancelled:', error));
controller.abort(new Error('No longer needed'));
await handled;
// Item 2 never starts if it is still waiting.</code></pre></docs-code>
            <p>The bucket removes its abort listener before starting a call. Once running, cancellation belongs to the source; forward the signal to <code>fetch</code> or another API that supports it. Already aborted calls reject before consuming queue capacity or changing pacing.</p>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Check signal and capacity</li><li><span>02</span>Wait in FIFO order</li><li><span>03</span>Start and forward result</li></ol>
            <ul class="behavior-list">
              <li>Idle time does not accumulate burst capacity. Each start establishes the next allowed start time using a monotonic clock. Timer delays may increase the spacing; the bucket does not catch up by launching a burst.</li>
              <li>Queued calls retain their original receiver and argument references. Completion order may differ from start order. A rejected promise or synchronous source throw rejects only its own call and does not stop the queue.</li>
              <li>Cancelling queued calls does not consume a start or reset the last start's pacing interval. All timers are cleared when cancellation empties the queue.</li>
              <li>Buckets live in the current JavaScript process. They do not coordinate quota across workers, servers, or browser tabs. Provider-specific windows and retry policies still need to be considered separately.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("leaky-bucket-page", LeakyBucketPage);
})();

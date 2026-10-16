(() => {
  const { DocsElement } = window.DocsComponents;

  class RateLimitPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="rateLimit" heading="rateLimit" category="Rate control"
          source="src/rate-limit/rate-limit.ts" edit-path="site/pages/rateLimit/rateLimit-page.js"
          next-title="readonly" next-href="#readonly">
          <p class="lead">Give each key a limited call budget.</p>
          <p class="intro">Count admitted calls and release each count after a configured delay. When a key reaches its allowance, a handler decides whether to stop the next call by throwing.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">rateLimit</span>(config: RateLimitConfigs)</code></docs-signature>
              <div data-example>
                <docs-code filename="report-service.ts" language="typescript"><pre><code>import { rateLimit } from 'utils-decorators';

class ReportService {
  constructor(private readonly account: string) {}

  limitKey(): string {
    return this.account;
  }

  @rateLimit({ allowedCalls: 2, timeSpanMs: 1000, keyResolver: 'limitKey' })
  generate(): string {
    return 'Report for ' + this.account;
  }
}

const reports = new ReportService('team-a');
reports.generate();
reports.generate();
try {
  reports.generate(); // No report is generated on this call.
} catch (error) {
  console.log('Call budget exhausted');
}</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @rateLimit(config)</p>
                <p>With the default synchronous counter, methods keep their return type. An asynchronous counter requires a method declaring a compatible <code>Promise&lt;T&gt;</code> return type.</p>
                <docs-callout>Each instance has its own default counter for this method. The default key groups all arguments on that instance into one budget. An explicitly supplied counter shares storage across instances; use a named resolver to separate budgets when needed.</docs-callout>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">rateLimitify</span>(fn, config: RateLimitConfigs): wrappedFunction</code></docs-signature>
              <div data-example>
                <docs-code filename="send-report.ts" language="typescript"><pre><code>import { rateLimitify } from 'utils-decorators';

const sendReport = rateLimitify((account: string): string =&gt; {
  return 'Sent for ' + account;
}, {
  allowedCalls: 1,
  timeSpanMs: 1000,
  keyResolver: account =&gt; account,
  exceedHandler: account =&gt; { throw new Error('Please try again later for ' + account); },
});

console.log(sendReport('team-a')); // 'Sent for team-a'
console.log(sendReport('team-b')); // Independent budget.
try {
  sendReport('team-a');
} catch (error) {
  console.log(error instanceof Error ? error.message : error);
  // 'Please try again later for team-a'
}</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · rateLimitify(fn, config)</p>
                <p>The wrapper preserves the source’s arguments and receiver requirement. With a synchronous counter it returns the source’s result directly. With an async counter it always returns <code>Promise&lt;Awaited&lt;ReturnType&lt;typeof fn&gt;&gt;&gt;</code>, even for a synchronous source. A configuration that can select either mode produces the corresponding union return type.</p>
                <details class="api-detail"><summary>Use an asynchronous counter with a synchronous source</summary>
                  <p>The public <code>RateLimitAsyncCounter</code> interface supports storage that returns promises. This small example uses a map; the calls are awaited in sequence.</p>
                  <docs-code filename="async-counter.ts" language="typescript"><pre><code>import { rateLimitify, RateLimitAsyncCounter } from 'utils-decorators';

const counts = new Map&lt;string, number&gt;();
const counter: RateLimitAsyncCounter = {
  getCount: async key =&gt; counts.get(key) ?? 0,
  inc: async key =&gt; { counts.set(key, (counts.get(key) ?? 0) + 1); },
  dec: async key =&gt; { counts.set(key, (counts.get(key) ?? 0) - 1); },
};

const double = rateLimitify((value: number): number =&gt; value * 2, {
  allowedCalls: 1,
  timeSpanMs: 1000,
  rateLimitAsyncCounter: counter,
});

const result: Promise&lt;number&gt; = double(21);
console.log(await result); // 42
try {
  await double(10); // Same default key; the call is rejected.
} catch (error) {
  console.log('Call budget exhausted');
}</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>An <code>exceedHandler</code> that returns normally allows the call through and consumes another count. Throw to block it. The handler receives the original arguments as <code>exceedHandler(...args)</code> in both counter modes; its return value is ignored. Existing handlers that ignore arguments remain supported.</docs-callout>
          </docs-tabs>
          <docs-section anchor="options" heading="Shared options">
            <docs-config-table><table><tbody>
              <tr><td><code>allowedCalls</code><span class="required">Required</span></td><td><code>number</code></td><td>The threshold for the current key. The handler runs when <code>getCount(key) &gt;= allowedCalls</code>, before incrementing. Use a positive integer; numeric values are not validated.</td></tr>
              <tr><td><code>timeSpanMs</code><span class="required">Required</span></td><td><code>number</code></td><td>Delay from each successful counter increment until its scheduled decrement. This delay is independent of the source’s completion.</td></tr>
              <tr><td><code>keyResolver</code><span class="optional">Optional</span></td><td><code>callback | method key</code></td><td>Receives the original arguments. Both a callback function and a named method are bound to the call’s receiver; arrow functions retain their lexical receiver. Defaults to the constant key <code>'__rateLimit__'</code>. For a function wrapper, a method key needs a compatible explicit source receiver.</td></tr>
              <tr><td><code>exceedHandler</code><span class="optional">Optional</span></td><td><code>(...args) =&gt; void</code></td><td>Defaults to throwing <code>Error('You have acceded the amount of allowed calls')</code>. Receives the original call arguments. No instance binding is provided. Use a synchronous throw to block admission; an async handler is not awaited.</td></tr>
              <tr><td><code>rateLimitCounter</code><span class="optional">Optional</span></td><td><code>RateLimitCounter</code></td><td>Synchronous counter storage. Defaults to an in-memory counter per instance and decorated method, or per function wrapper. An explicitly supplied counter is reused.</td></tr>
              <tr><td><code>rateLimitAsyncCounter</code><span class="optional">Optional</span></td><td><code>RateLimitAsyncCounter</code></td><td>Promise-based counter storage. Mutually exclusive with <code>rateLimitCounter</code>; providing both is rejected when creating the wrapper.</td></tr>
            </tbody></table></docs-config-table>
          </docs-section>
          <docs-section anchor="counters" heading="Counter contracts">
            <p>Implement all three methods. The exported interfaces differ only in their return types.</p>
            <docs-config-table><table><thead><tr><th scope="col">Method</th><th scope="col">RateLimitCounter</th><th scope="col">RateLimitAsyncCounter</th></tr></thead><tbody>
              <tr><td><code>getCount(key: string)</code></td><td><code>number</code></td><td><code>Promise&lt;number&gt;</code></td></tr>
              <tr><td><code>inc(key: string)</code></td><td><code>void</code></td><td><code>Promise&lt;void&gt;</code></td></tr>
              <tr><td><code>dec(key: string)</code></td><td><code>void</code></td><td><code>Promise&lt;void&gt;</code></td></tr>
            </tbody></table></docs-config-table>
            <p>The async mode awaits <code>getCount</code> and <code>inc</code> separately. Concurrent callers can read the same count before either increments, so this is not an atomic admission check. Scheduled async decrements are not awaited and their rejections are not forwarded to the original caller.</p>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Check key’s count</li><li><span>02</span>Increment and schedule release</li><li><span>03</span>Call source</li></ol>
            <ul class="behavior-list">
              <li>Every admitted call increments once and schedules its own decrement after <code>timeSpanMs</code>. Completion does not release a count early; even a source error keeps its count until the timer runs.</li>
              <li>With a throwing handler, exceeded calls do not increment, schedule a decrement, or invoke the source. No calls are queued for later.</li>
              <li>The synchronous counter path preserves synchronous results and throws, including a limit error even when the source would return a promise.</li>
              <li>In async counter mode, counter failures, handler throws, and source errors reject the returned promise. The key resolver still runs before that promise is created, so a resolver error throws synchronously in both modes.</li>
              <li>Timers can run later when the event loop is busy. A zero delay still releases asynchronously; the counter is not reset at fixed clock boundaries.</li>
              <li>Each call forwards its receiver and arguments to the source. The decorator isolates default counters per instance and method. A function wrapper shares one counter across its receivers; separate wrappers get independent default counters. Reusing a custom counter also shares its key space.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("rate-limit-page", RateLimitPage);
})();

(() => {
  const { DocsElement } = window.DocsComponents;

  class DelayPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="delay" heading="delay" category="Timing"
          source="src/delay/delay.ts" edit-path="site/pages/delay/delay-page.js"
          next-title="delegate" next-href="#delegate">
          <p class="lead">Give every call a later start.</p>
          <p class="intro">Schedule each invocation with a timer. Every call keeps its own arguments and receiver, and runs after the requested delay without blocking the caller.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">delay</span>(delayMs: number)</code></docs-signature>
              <div data-example>
                <docs-code filename="notifications.ts" language="typescript"><pre><code>import { delay } from 'utils-decorators';

class Notifications {
  @delay(200)
  show(message: string): void {
    console.log(message);
  }
}

const notifications = new Notifications();
notifications.show('Draft saved');
notifications.show('Upload complete');
// Both messages are logged after their respective 200 ms delays.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @delay(delayMs)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>delayMs</code><span class="required">Required</span></td><td><code>number</code></td><td>Milliseconds to wait before each invocation. Pass a number directly, not a configuration object.</td></tr>
                </tbody></table></docs-config-table>
                <p class="form-guidance">Apply to methods declared to return <code>void</code>. The delayed method retains the instance used for that call.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">delayfy</span>(fn, delayMs: number): (...args) =&gt; void</code></docs-signature>
              <div data-example>
                <docs-code filename="announce.ts" language="typescript"><pre><code>import { delayfy } from 'utils-decorators';

const announceLater = delayfy((message: string): void =&gt; {
  console.log(message);
}, 100);

const result: void = announceLater('Ready');
console.log(result); // undefined immediately; logs 'Ready' after the timer fires.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · delayfy(fn, delayMs)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>function</code></td><td>The source to schedule. Argument types and the source's receiver requirement are preserved; its return value is discarded.</td></tr>
                  <tr><td><code>delayMs</code><span class="required">Required</span></td><td><code>number</code></td><td>Milliseconds to wait for each call. Each invocation creates a separate timer.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Advanced: retaining a receiver</summary>
                  <p>Declare the source's <code>this</code> type and invoke the wrapper as a method or with <code>.call</code>. Each scheduled invocation uses its own receiver, even when multiple objects share the wrapper.</p>
                  <docs-code language="typescript"><pre><code>import { delayfy } from 'utils-decorators';

function report(this: { name: string }, message: string): void {
  console.log(this.name, message);
}

const reportLater = delayfy(report, 100);
const first = { name: 'First', reportLater };
const second = { name: 'Second', reportLater };

first.reportLater('ready');
second.reportLater('done');
// Later: 'First ready', then 'Second done'.</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>Every invocation is scheduled. Use <a href="#debounce">debounce</a> when a newer call should replace a pending one.</docs-callout>
          </docs-tabs>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Capture call</li><li><span>02</span>Start timer</li><li><span>03</span>Invoke source</li></ol>
            <ul class="behavior-list">
              <li>The wrapper returns <code>undefined</code> immediately. It exposes no timer handle, cancellation method, flush method, or promise to await.</li>
              <li>Calls do not reset earlier timers or wait for earlier work to finish. Asynchronous sources can overlap.</li>
              <li><code>delayfy</code> accepts synchronous and asynchronous sources, but ignores their return values. Handle rejected promises within the source because the wrapper does not return them.</li>
              <li>Source errors occur in the timer callback, after the wrapper has returned. Catching around the initial call does not catch a later synchronous throw; handle errors inside the source when needed.</li>
              <li>Even a zero delay schedules a timer. Actual timing and unusual delay values follow the host's <code>setTimeout</code> behavior, without additional validation.</li>
              <li>Arguments are retained by reference. Mutating an argument object or receiver before the timer fires can affect what the source observes.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("delay-page", DelayPage);
})();

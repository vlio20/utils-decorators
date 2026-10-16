(() => {
  const { DocsElement } = window.DocsComponents;

  class ThrottlePage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="throttle" heading="throttle" category="Rate control"
          source="src/throttle/throttle.ts" edit-path="site/pages/throttle/throttle-page.js"
          next-title="throttleAsync" next-href="#throttleAsync">
          <p class="lead">Run the first call and drop the burst.</p>
          <p class="intro">Invoke a function immediately, then ignore calls until its cooldown ends. There is no trailing invocation, so ignored arguments are never replayed.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">throttle</span>(delayMs: number)</code></docs-signature>
              <div data-example>
                <docs-code filename="progress-reporter.ts" language="typescript"><pre><code>import { throttle } from 'utils-decorators';

class ProgressReporter {
  @throttle(100)
  report(percent: number): void {
    console.log('Progress:', percent);
  }
}

const reporter = new ProgressReporter();
reporter.report(10); // Logs 10 immediately.
reporter.report(20); // Dropped.
reporter.report(30); // Dropped; no trailing log of 30.

await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 150));
reporter.report(40); // Logs 40 immediately.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @throttle(delayMs)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>delayMs</code><span class="required">Required</span></td><td><code>number</code></td><td>Timer delay before admitting another call. The timer is scheduled after the admitted method returns. There is no default or numeric validation.</td></tr>
                </tbody></table></docs-config-table>
                <p>The decorated method must declare a <code>void</code> return type. Value-returning and promise-returning methods cannot preserve their return contracts through this decorator.</p>
                <docs-callout>Each instance has its own cooldown for this method. Calling it on one instance does not suppress calls on another instance.</docs-callout>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">throttlify</span>(fn: (...args: A) =&gt; T, delayMs: number): (...args: A) =&gt; void</code></docs-signature>
              <div data-example>
                <docs-code filename="save-position.ts" language="typescript"><pre><code>import { throttlify } from 'utils-decorators';

const saved: number[] = [];
const savePosition = throttlify((position: number): number =&gt; {
  saved.push(position);
  return position;
}, 100);

const result: void = savePosition(10); // The source’s return value is discarded.
savePosition(20); // Dropped.
console.log(saved); // [10]
console.log(result); // undefined

await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 150));
savePosition(30);
console.log(saved); // [10, 30]</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · throttlify(fn, delayMs)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>(...args) =&gt; T</code></td><td>The source function. Its arguments and any explicit <code>this</code> requirement are preserved. The wrapper returns <code>void</code> whether a call runs or is dropped.</td></tr>
                  <tr><td><code>delayMs</code><span class="required">Required</span></td><td><code>number</code></td><td>Cooldown after an admitted source returns. Calls during the cooldown do not reset or extend it.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Keep cooldowns separate for each instance</summary>
                  <p>Each call to <code>throttlify</code> creates a separate cooldown. Use an instance field to give each reporter its own wrapper.</p>
                  <docs-code filename="independent-reporters.ts" language="typescript"><pre><code>import { throttlify } from 'utils-decorators';

class ProgressReporter {
  constructor(private readonly name: string) {}

  report = throttlify((percent: number): void =&gt; {
    console.log(this.name, percent);
  }, 100);
}

const left = new ProgressReporter('left');
const right = new ProgressReporter('right');
left.report(10); // Logs 'left', 10.
right.report(20); // Logs 'right', 20; independent cooldown.
left.report(30); // Dropped.</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>A final update during the cooldown is dropped too. If every last value must be delivered, this utility does not schedule that delivery for you.</docs-callout>
          </docs-tabs>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Close the gate</li><li><span>02</span>Invoke immediately</li><li><span>03</span>Reopen after delay</li></ol>
            <ul class="behavior-list">
              <li>The first call runs synchronously with its original receiver and arguments. Subsequent calls while the gate is closed are ignored without saving their arguments or return values.</li>
              <li>The timer reopens the gate; it does not invoke the source. The next incoming call starts a new cooldown. Calls do not need to share arguments to suppress each other.</li>
              <li>A synchronous source throw propagates to the caller. The gate was already closed and its reopening timer has not yet been scheduled, so that wrapper remains closed afterward.</li>
              <li>A function wrapper can accept an async source, but discards its promise and does not await it. Work can overlap when it lasts longer than the cooldown. Handle promise errors inside the source, or consider <a href="#throttleAsync">throttleAsync</a>.</li>
              <li>There is no cancel, flush, trailing option, or public reset method. A zero delay still uses an asynchronous timer, so immediate consecutive calls can be dropped.</li>
              <li>The decorator keeps a separate gate per instance and method. A function wrapper shares its gate across all receivers; separate calls to <code>throttlify</code> create independent gates.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("throttle-page", ThrottlePage);
})();

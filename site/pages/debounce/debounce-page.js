(() => {
  const { DocsElement } = window.DocsComponents;

  class DebouncePage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="debounce" heading="debounce" category="Timing"
          source="src/debounce/debounce.ts" edit-path="site/pages/debounce/debounce-page.js"
          next-title="delay" next-href="#delay">
          <p class="lead">Wait until the calls quiet down.</p>
          <p class="intro">Schedule a trailing call after a pause. Each new call resets the timer, so only the latest arguments reach the source after the configured delay.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">debounce</span>(delayMs: number)</code></docs-signature>
              <div data-example>
                <docs-code filename="search-box.ts" language="typescript"><pre><code>import { debounce } from 'utils-decorators';

class SearchBox {
  @debounce(250)
  search(query: string): void {
    console.log('Search for', query);
  }
}

const box = new SearchBox();
box.search('c');
box.search('ca');
box.search('cats'); // After 250 ms of quiet, logs 'Search for cats'.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @debounce(delayMs)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>delayMs</code><span class="required">Required</span></td><td><code>number</code></td><td>Milliseconds to wait after the latest call. This is a positional argument, not a configuration object.</td></tr>
                </tbody></table></docs-config-table>
                <p class="form-guidance">Apply to methods declared to return <code>void</code>. Each instance gets its own timer, and the delayed method receives that instance as <code>this</code>.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">debouncify</span>(fn, delayMs: number): (...args) =&gt; void</code></docs-signature>
              <div data-example>
                <docs-code filename="save-draft.ts" language="typescript"><pre><code>import { debouncify } from 'utils-decorators';

const saveDraft = debouncify((text: string): void =&gt; {
  console.log('Saved', text);
}, 500);

saveDraft('First draft');
saveDraft('Revised draft'); // Saves only 'Revised draft' after 500 ms of quiet.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · debouncify(fn, delayMs)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>function</code></td><td>The source function. Its argument types and receiver requirement are preserved, but its return value is discarded.</td></tr>
                  <tr><td><code>delayMs</code><span class="required">Required</span></td><td><code>number</code></td><td>Milliseconds to wait after the latest call. Each wrapper owns one timer.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Advanced: sharing a wrapper between receivers</summary>
                  <p>The latest call supplies both the arguments and <code>this</code>. Receivers sharing one wrapper also share its timer. Create separate wrappers when their pending calls must stay independent.</p>
                  <docs-code language="typescript"><pre><code>import { debouncify } from 'utils-decorators';

function report(this: { name: string }, text: string): void {
  console.log(this.name, text);
}

const reportLater = debouncify(report, 100);
const first = { name: 'First', reportLater };
const second = { name: 'Second', reportLater };

first.reportLater('old');
second.reportLater('latest'); // Only logs 'Second latest' after 100 ms.</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>Calls return <code>undefined</code> immediately. There is no promise to await, result to retrieve, or public cancel or flush method.</docs-callout>
          </docs-tabs>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Reset timer</li><li><span>02</span>Wait for quiet</li><li><span>03</span>Run latest call</li></ol>
            <ul class="behavior-list">
              <li>The source never runs on the leading call. Each call clears the pending timer and schedules a new one with its own arguments and receiver.</li>
              <li>Once the timer fires, later calls cannot cancel work already running. Debouncing does not serialize asynchronous work or abort an in-flight request.</li>
              <li><code>debouncify</code> accepts synchronous or asynchronous sources, but discards their results. Handle asynchronous errors inside the source; a rejected promise is not returned to the caller.</li>
              <li>A synchronous throw happens inside the timer callback and cannot be caught around the initial wrapper call. Catch errors within the delayed source when needed.</li>
              <li>Even a zero delay schedules a timer; it does not call the source synchronously. Timing and unusual delay values follow the host's <code>setTimeout</code> behavior, with no extra validation.</li>
              <li>The decorator keeps pending calls separate per instance. A function wrapper has one pending call across all receivers that use it.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("debounce-page", DebouncePage);
})();

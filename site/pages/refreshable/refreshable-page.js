(() => {
  const { DocsElement } = window.DocsComponents;

  class RefreshablePage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="refreshable" heading="refreshable" category="Caching"
          source="src/refreshable/refreshable.ts" edit-path="site/pages/refreshable/refreshable-page.js"
          next-title="retry" next-href="#retry">
          <p class="lead">Read a value that refreshes in the background.</p>
          <p class="intro">Populate a property from an asynchronous provider, then update it on an interval. Reads return the latest completed value immediately, beginning with <code>undefined</code>.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">refreshable</span>(config: RefreshableConfig&lt;T&gt;)</code></docs-signature>
              <div data-example>
                <docs-code filename="queue-monitor.ts" language="typescript"><pre><code>import { refreshable } from 'utils-decorators';

async function readQueueDepth(): Promise&lt;number&gt; {
  return 3; // Replace with a call to your queue service.
}

class QueueMonitor {
  @refreshable({ dataProvider: readQueueDepth, intervalMs: 1000 })
  declare depth: number | null | undefined;
}

const monitor = new QueueMonitor();
console.log(monitor.depth); // undefined; the first refresh is scheduled.
await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 20));
console.log(monitor.depth); // 3, after the sample provider has completed.

monitor.depth = null; // Stop future interval ticks.
console.log(monitor.depth); // 3; assigning null does not replace the value.</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @refreshable(config)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>dataProvider</code><span class="required">Required</span></td><td><code>(this: void) =&gt; Promise&lt;T&gt;</code></td><td>Called without arguments and with an undefined receiver. Use a closure for dependencies; it does not receive the property’s owning instance.</td></tr>
                  <tr><td><code>intervalMs</code><span class="required">Required</span></td><td><code>number</code></td><td>Delay between interval ticks. A separate zero-delay timeout also schedules an initial refresh. There is no default or numeric validation.</td></tr>
                </tbody></table></docs-config-table>
                <p>The property type must accept the provider’s value and the initial <code>undefined</code>. Include <code>null</code> when you want to use the stop assignment. The example uses <code>declare</code> so class field emission does not shadow the decorated accessor.</p>
              </div>
            </template>
            <docs-callout>There is one shared value and interval per decorated property. For an instance property, these live on the prototype: all instances read the same data, and assigning <code>null</code> on any instance stops their shared interval.</docs-callout>
          </docs-tabs>
          <docs-section anchor="lifecycle" heading="Refresh lifecycle">
            <ol class="flow"><li><span>01</span>Schedule provider</li><li><span>02</span>Await its result</li><li><span>03</span>Replace shared value</li></ol>
            <ul class="behavior-list">
              <li>Timers start when the decorator is applied, usually as the class is defined. They do not wait for construction or the first property read.</li>
              <li>The accessor starts at <code>undefined</code>. Each successful provider completion replaces the stored value. Reads do not invoke the provider or return a promise.</li>
              <li>Refreshes can overlap. The interval does not wait for the previous request to finish; whichever request completes last writes the value, even if it started earlier.</li>
              <li>Assigning <code>null</code> clears the interval without changing the stored value. It does not cancel the initial timeout or requests already running, so those can still update the property afterward.</li>
              <li>Other assignments, including <code>undefined</code>, are ignored by the setter. A provider result of <code>null</code> is simply stored when its result type allows it; it does not invoke the stop setter.</li>
              <li>Stopping does not restart automatically. There is no restart method, subscription API, change event, or completion promise.</li>
              <li>In Node.js, the interval is unreferenced when <code>unref()</code> is available, so that interval alone does not keep the process alive.</li>
            </ul>
          </docs-section>
          <docs-section anchor="errors" heading="Handle provider failures inside the provider">
            <p>The decorator does not catch provider errors. A rejected refresh leaves the last stored value unchanged and can produce an unhandled rejection; the interval continues scheduling ticks.</p>
            <details class="api-detail"><summary>Keep the last successful value after an error</summary>
              <p>Catch errors in the provider and return a deliberate fallback. This closure starts with zero and updates its fallback only after a successful read.</p>
              <docs-code filename="resilient-monitor.ts" language="typescript"><pre><code>import { refreshable } from 'utils-decorators';

async function readQueueDepth(): Promise&lt;number&gt; {
  return 3; // Replace with your service call, which may reject.
}

let lastDepth = 0;
const dataProvider = async (): Promise&lt;number&gt; =&gt; {
  try {
    lastDepth = await readQueueDepth();
  } catch (error) {
    console.error('Queue refresh failed', error);
  }
  return lastDepth;
};

class QueueMonitor {
  @refreshable({ dataProvider, intervalMs: 1000 })
  declare depth: number | null | undefined;
}

const monitor = new QueueMonitor();
await new Promise&lt;void&gt;(resolve =&gt; setTimeout(resolve, 20));
console.log(monitor.depth); // Latest successful depth, or the fallback.
monitor.depth = null;</code></pre></docs-code>
            </details>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("refreshable-page", RefreshablePage);
})();

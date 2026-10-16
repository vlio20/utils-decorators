(() => {
  const { DocsElement } = window.DocsComponents;

  class ExecTimePage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="execTime" heading="execTime" category="Diagnostics"
          source="src/exec-time/exec-time.ts" edit-path="site/pages/execTime/execTime-page.js"
          next-title="memoize" next-href="#memoize">
          <p class="lead">See how long successful calls take.</p>
          <p class="intro">Measure elapsed time and report the original arguments and result. Synchronous calls stay synchronous; asynchronous calls are measured through successful resolution.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">execTime</span>(reporter?: ReportFunction | methodKey)</code></docs-signature>
              <div data-example>
                <docs-code filename="user-service.ts" language="typescript"><pre><code>import { execTime, ExactTimeReportData } from 'utils-decorators';

class UserService {
  @execTime('reportLookup')
  async getName(id: number): Promise&lt;string&gt; {
    return 'User ' + id;
  }

  reportLookup({ args, result, execTime }: ExactTimeReportData&lt;string, [number]&gt;): void {
    console.log(args[0], result, execTime + ' ms');
  }
}

const name = await new UserService().getName(42); // 'User 42'</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @execTime(reporter?)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>reporter</code><span class="optional">Optional</span></td><td><code>callback | method key</code></td><td>A callback or compatible method key on the receiver. Omit it to log elapsed milliseconds with <code>console.info</code>. Pass the reporter directly, not inside a configuration object.</td></tr>
                </tbody></table></docs-config-table>
                <p class="form-guidance">Named reporters are bound to the instance. A callback receives no automatic instance binding. Annotate its payload with <code>ExactTimeReportData&lt;Result, Args&gt;</code> when you need concrete argument and result types.</p>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">execTimify</span>(fn, reporter?: ReportFunction | methodKey)</code></docs-signature>
              <div data-example>
                <docs-code filename="format-name.ts" language="typescript"><pre><code>import { execTimify } from 'utils-decorators';

const formatName = execTimify((first: string, last: string): string =&gt; {
  return first + ' ' + last;
}, ({ args, result, execTime }) =&gt; {
  console.log(args[0], result, execTime + ' ms');
});

const name: string = formatName('Ada', 'Lovelace'); // 'Ada Lovelace'</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · execTimify(fn, reporter?)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>fn</code><span class="required">Required</span></td><td><code>function</code></td><td>The source to measure. Its arguments and receiver requirement are preserved.</td></tr>
                  <tr><td><code>reporter</code><span class="optional">Optional</span></td><td><code>callback | method key</code></td><td>Receives the report payload, with argument and resolved-result types inferred from <code>fn</code>. Defaults to <code>console.info(data.execTime)</code>. Method keys require a compatible receiver.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Advanced: a named reporter with a receiver</summary>
                  <p>Declare the source's <code>this</code> type so the wrapper can accept the reporter's key. Call the wrapper with that receiver; both source and named reporter use it.</p>
                  <docs-code language="typescript"><pre><code>import { execTimify, ExactTimeReportData } from 'utils-decorators';

type Receiver = {
  prefix: string;
  report(data: ExactTimeReportData&lt;string, [number]&gt;): void;
};

function getName(this: Receiver, id: number): string {
  return this.prefix + id;
}

const measured = execTimify(getName, 'report');
const receiver: Receiver = {
  prefix: 'User ',
  report({ result, execTime }) { console.log(result, execTime); },
};

const name = measured.call(receiver, 42); // 'User 42'</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout>Omitting the reporter logs only elapsed milliseconds. Provide a reporter when you also need the call's arguments or successful result.</docs-callout>
          </docs-tabs>
          <docs-section anchor="report" heading="Report payload">
            <p>The reporter receives one <code>ExactTimeReportData&lt;Result, Args&gt;</code> object for each successful invocation.</p>
            <div class="payload-grid">
              <div><code>args</code><p>The original arguments in order, retaining references to argument objects.</p></div>
              <div><code>result</code><p>The source's return value, or its resolved value for a promise or thenable.</p></div>
              <div><code>execTime</code><p>Elapsed milliseconds computed with <code>Date.now()</code>, measured until the reporter is called. For async work this includes time spent waiting for resolution.</p></div>
            </div>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <ol class="flow"><li><span>01</span>Start clock</li><li><span>02</span>Run source</li><li><span>03</span>Report success</li></ol>
            <ul class="behavior-list">
              <li>A synchronous source returns its original value after reporting. A promise or thenable produces a native promise that resolves to the source's resolved value after reporting. The original promise's identity and extra properties are not preserved.</li>
              <li>A synchronous source throw propagates immediately; a rejected source promise propagates through the returned promise. Both skip reporting.</li>
              <li>A synchronous reporter throw replaces the successful return with an error. For asynchronous sources it rejects the returned promise instead.</li>
              <li>The reporter's return value is ignored. Async reporters are not awaited, and their rejected promises do not propagate through the wrapper. Handle errors within an async reporter.</li>
              <li>Named reporters are resolved and bound before the source runs. A missing or noncallable reporter therefore fails before invocation. Callback reporters run without an instance binding.</li>
              <li>The measurement uses wall-clock time, includes asynchronous waiting, and excludes the reporter's own execution time. It does not isolate CPU time.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("exec-time-page", ExecTimePage);
})();

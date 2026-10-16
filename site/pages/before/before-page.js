(() => {
  const { DocsElement } = window.DocsComponents;

  class BeforePage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="before" heading="before" category="Lifecycle"
          source="src/before/before.ts" edit-path="site/pages/before/before-page.js"
          next-title="cancelPrevious" next-href="#cancelPrevious">
          <p class="lead">A little preparation before every call.</p>
          <p class="intro">Run a hook before a method is invoked. Use it for setup, logging, or validation, and optionally wait for asynchronous preparation before calling the original method.</p>
          <docs-tabs>
            <template data-variant="decorator" data-label="Decorator">
              <docs-signature label="Decorator"><code><span class="token-function">before</span>(config: BeforeConfig)</code></docs-signature>
              <div data-example>
                <docs-code filename="user-service.ts" language="typescript"><pre><code>import { before } from 'utils-decorators';

class UserService {
  private ready = false;

  async prepare(): Promise&lt;void&gt; {
    this.ready = true;
  }

  @before({ func: 'prepare', wait: true })
  async getName(id: number): Promise&lt;string&gt; {
    return this.ready ? 'User ' + id : 'Not ready';
  }
}

const name = await new UserService().getName(42); // 'User 42'</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Decorator · @before(config)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>func</code><span class="required">Required</span></td><td><code>callback | method key</code></td><td>A callback, or a key naming a compatible method on the same instance. The hook receives no arguments. Named hooks are bound to that instance.</td></tr>
                  <tr><td><code>wait</code><span class="optional">Optional</span></td><td><code>boolean</code></td><td>Defaults to <code>false</code>. Set <code>true</code> to await the hook before invoking the method. With <code>wait: true</code>, the decorated method must declare a compatible promise return type.</td></tr>
                </tbody></table></docs-config-table>
              </div>
            </template>
            <template data-variant="function" data-label="Function">
              <docs-signature label="Function"><code><span class="token-function">beforify</span>(fn, config: BeforeConfig)</code></docs-signature>
              <div data-example>
                <docs-code filename="get-name.ts" language="typescript"><pre><code>import { beforify } from 'utils-decorators';

function getName(id: number): string {
  return 'User ' + id;
}

const getNameWithPreparation = beforify(getName, {
  wait: true,
  func: async () =&gt; {
    await Promise.resolve(); // Replace with your asynchronous setup.
    console.log('Ready');
  },
});

const name = await getNameWithPreparation(42); // 'User 42'</code></pre></docs-code>
              </div>
              <div data-configuration>
                <p class="form-caption">Function · beforify(fn, config)</p>
                <docs-config-table><table><tbody>
                  <tr><td><code>func</code><span class="required">Required</span></td><td><code>callback</code></td><td>For standalone functions, pass a callback with no arguments. A method name needs an explicit receiver; see the advanced case below.</td></tr>
                  <tr><td><code>wait</code><span class="optional">Optional</span></td><td><code>boolean</code></td><td>Defaults to <code>false</code>. Set <code>true</code> to await the hook before invoking the original function. The wrapper then always returns a promise, even for a synchronous source.</td></tr>
                </tbody></table></docs-config-table>
                <details class="api-detail"><summary>Synchronous calls with and without waiting</summary>
                  <p>Without waiting, the original result and synchronous throws are preserved. With <code>wait: true</code>, invocation of the source is deferred until after the hook is awaited, and the wrapper returns a promise.</p>
                  <docs-code language="typescript"><pre><code>import { beforify } from 'utils-decorators';

const greet = (name: string): string =&gt; 'Hello ' + name;
const log = () =&gt; console.log('Calling greet');

const immediate = beforify(greet, { func: log });
const waiting = beforify(greet, { func: log, wait: true });

const first: string = immediate('Ada');
const second: Promise&lt;string&gt; = waiting('Ada');
console.log(first, await second); // 'Hello Ada', 'Hello Ada'</code></pre></docs-code>
                </details>
                <details class="api-detail"><summary>Advanced: using a method name with a receiver</summary>
                  <p>Declare the original function’s <code>this</code> type, then call the wrapper with a receiver containing the named hook. <code>beforify</code> preserves the source function’s arguments and receiver requirement.</p>
                  <docs-code language="typescript"><pre><code>import { beforify } from 'utils-decorators';

type Receiver = { prepare(): void };
function getName(this: Receiver, id: number): string {
  return 'User ' + id;
}

const wrapped = beforify(getName, { func: 'prepare' });
const receiver: Receiver = {
  prepare: () =&gt; console.log('Preparing'),
};

const name = wrapped.call(receiver, 42); // 'User 42'</code></pre></docs-code>
                </details>
              </div>
            </template>
            <docs-callout><code>wait</code> waits for the <strong>hook</strong> before calling the source. This differs from <a href="#after">after</a>, which can wait for the source’s result.</docs-callout>
          </docs-tabs>
          <docs-section anchor="hook" heading="Hook contract">
            <p>The hook is called with <strong>no arguments</strong>. It receives neither the original arguments nor a response payload. Use a closure or a named instance method when preparation needs access to state.</p>
            <div class="payload-grid"><div><code>Arguments</code><p>Original call arguments are forwarded unchanged to the source, after the hook runs.</p></div><div><code>Return value</code><p>The hook’s result is ignored. With <code>wait: true</code>, its completion is awaited; it does not replace the source’s result.</p></div></div>
          </docs-section>
          <docs-section anchor="behavior" heading="How it works">
            <p>With <code>wait: true</code>, the original function starts only after the hook completes successfully.</p>
            <ol class="flow"><li><span>01</span>Call hook</li><li><span>02</span>Await hook</li><li><span>03</span>Call source</li></ol>
            <ul class="behavior-list">
              <li>Without <code>wait</code>, the hook is called first and the source is invoked immediately afterward. If the hook starts asynchronous work, the source does not wait for it.</li>
              <li>With <code>wait: true</code>, even a synchronous hook is awaited. <code>beforify</code> returns a promise of the source’s result; <code>@before</code> requires the method to declare a compatible promise return type.</li>
              <li>If the hook throws synchronously, the source is not called. Without waiting, the error is thrown to the caller; with waiting, the returned promise rejects. A rejected hook promise also prevents the source from running when <code>wait: true</code>.</li>
              <li>Without waiting, rejected async hooks do not propagate through the wrapper. Handle errors inside the hook or enable <code>wait: true</code> when its success is required.</li>
              <li>The original result or error propagates to the caller. With waiting, synchronous source errors reject the wrapper’s promise.</li>
              <li>Named hooks are bound to the call’s receiver. Callback functions receive no automatic instance binding; use a closure if needed. The original function retains the call’s receiver.</li>
            </ul>
          </docs-section>
        </docs-page>
      `;
    }
  }
  customElements.define("before-page", BeforePage);
})();

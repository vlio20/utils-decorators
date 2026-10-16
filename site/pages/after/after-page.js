(() => {
  const { DocsElement } = window.DocsComponents;

  class AfterPage extends DocsElement {
    render() {
      this.innerHTML = `
      <docs-page
        page-id="after"
        heading="after"
        category="Lifecycle"
        source="src/after/after.ts"
        edit-path="site/pages/after/after-page.js"
        next-title="before"
        next-href="#before"
      >
        <p class="lead">A follow-up for every function call.</p>
        <p class="intro">
          Run a callback after a method is invoked. Access its original
          arguments and return value, or wait for an asynchronous result before
          running your hook.
        </p>
        <docs-tabs>
          <template data-variant="decorator" data-label="Decorator">
            <docs-signature label="Decorator"
              ><code
                ><span class="token-function">after</span>(config:
                AfterConfig)</code
              ></docs-signature
            >
            <div data-example>
              <docs-code filename="user-service.ts" language="typescript">
                <pre><code>import { after, AfterParams } from 'utils-decorators';

class UserService {
  @after({ func: 'logResult', wait: true })
  async getName(id: number): Promise&lt;string&gt; {
    return \`User \${id}\`;
  }

  logResult({ args, response }: AfterParams&lt;string, [number]&gt;): void {
    console.log(args[0], response); // 42, 'User 42'
  }
}

await new UserService().getName(42);</code></pre>
              </docs-code>
            </div>
            <div data-configuration>
              <p class="form-caption">Decorator · @after(config)</p>
              <docs-config-table
                ><table>
                  <tbody>
                    <tr>
                      <td>
                        <code>func</code><span class="required">Required</span>
                      </td>
                      <td><code>callback | method key</code></td>
                      <td>
                        A callback, or a key naming a compatible method on the
                        same instance. The named method receives
                        <code>AfterParams</code> and is bound to that instance.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>wait</code><span class="optional">Optional</span>
                      </td>
                      <td><code>boolean</code></td>
                      <td>
                        Defaults to <code>false</code>. Set <code>true</code> to
                        wait for a promise and pass its resolved result to the
                        hook. Synchronous results stay synchronous.
                      </td>
                    </tr>
                  </tbody>
                </table></docs-config-table
              >
            </div>
          </template>
          <template data-variant="function" data-label="Function">
            <docs-signature label="Function"
              ><code
                ><span class="token-function">afterify</span>(fn, config:
                AfterConfig)</code
              ></docs-signature
            >
            <div data-example>
              <docs-code filename="get-name.ts" language="typescript">
                <pre><code>import { afterify } from 'utils-decorators';

async function getName(id: number): Promise&lt;string&gt; {
  return \`User \${id}\`;
}

const getNameWithLogging = afterify(getName, {
  wait: true,
  func: ({ args, response }) =&gt; {
    console.log(args[0], response); // 42, 'User 42'
  },
});

await getNameWithLogging(42);</code></pre>
              </docs-code>
            </div>
            <div data-configuration>
              <p class="form-caption">Function · afterify(fn, config)</p>
              <docs-config-table
                ><table>
                  <tbody>
                    <tr>
                      <td>
                        <code>func</code><span class="required">Required</span>
                      </td>
                      <td><code>callback</code></td>
                      <td>
                        For standalone functions, pass a callback receiving
                        <code>{ args, response }</code>. A method name needs a
                        receiver; see the advanced case below.
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <code>wait</code><span class="optional">Optional</span>
                      </td>
                      <td><code>boolean</code></td>
                      <td>
                        Defaults to <code>false</code>. Set <code>true</code> to
                        wait for a promise and pass its resolved result to the
                        hook. Synchronous results stay synchronous.
                      </td>
                    </tr>
                  </tbody>
                </table></docs-config-table
              >
              <p class="form-guidance">
                <strong>Typing.</strong> <code>afterify</code> infers the
                argument tuple, response type, and original function’s
                <code>this</code> requirement. With <code>wait: true</code>, the
                callback receives the resolved response type. No decorator
                compiler setting is required.
              </p>
              <details class="api-detail">
                <summary>Advanced: using a method name with a receiver</summary>
                <p>
                  A plain standalone function has no instance on which to find a
                  named hook. If the original function declares a compatible
                  <code>this</code> type, you can supply a method key and call
                  the wrapper with that receiver:
                </p>
                <docs-code language="typescript">
                  <pre><code>import { afterify, AfterParams } from 'utils-decorators';

type Receiver = {
  report(data: AfterParams&lt;number, [number]&gt;): void;
};

function double(this: Receiver, value: number): number {
  return value * 2;
}

const wrapped = afterify(double, { func: 'report' });
const receiver: Receiver = {
  report: ({ response }) =&gt; console.log(response),
};

const result = wrapped.call(receiver, 21); // logs 42; returns 42</code></pre>
                </docs-code>
              </details>
              <details class="api-detail">
                <summary>Synchronous functions with wait: true</summary>
                <p>
                  The hook runs before the wrapper returns.
                  <code>wait: true</code> only waits when the original result is
                  a promise or thenable.
                </p>
                <docs-code language="typescript">
                  <pre><code>import { afterify } from 'utils-decorators';

const double = afterify((value: number) =&gt; value * 2, {
  wait: true,
  func: ({ response }) =&gt; console.log(response),
});

const result: number = double(21); // logs 42; returns 42, not a promise</code></pre>
                </docs-code>
              </details>
            </div>
          </template>
          <docs-callout
            >Working with promises? Set <code>wait: true</code> to pass the
            resolved value to your callback.</docs-callout
          >
        </docs-tabs>
        <docs-section anchor="callback" heading="Callback payload">
          <p>
            Your hook receives one object,
            <code>AfterParams&lt;Result, Args&gt;</code>, with two properties.
          </p>
          <div class="payload-grid">
            <div>
              <code>args</code>
              <p>The arguments passed to the original method, in order.</p>
            </div>
            <div>
              <code>response</code>
              <p>
                The original return value. With <code>wait: true</code>, the
                resolved result.
              </p>
            </div>
          </div>
        </docs-section>
        <docs-section anchor="behavior" heading="How it works">
          <p>
            With <code>wait: true</code>, the hook runs after the original
            promise resolves.
          </p>
          <ol class="flow">
            <li><span>01</span>Call method</li>
            <li><span>02</span>Resolve result</li>
            <li><span>03</span>Run hook</li>
          </ol>
          <ul class="behavior-list">
            <li>
              Without <code>wait</code> , the hook runs immediately after the
              original call. For async methods, <code>response</code> is the
              promise itself.
            </li>
            <li>
              The wrapper preserves synchronous results and throws. With async
              methods, it returns a promise. The hook’s return value is ignored
              and async hooks are not awaited.
            </li>
            <li>
              With <code>wait: true</code> , a rejected original promise skips
              the hook and propagates the rejection.
            </li>
            <li>
              For synchronous results, the hook runs before the wrapper returns.
              With <code>wait: true</code> and a promise result, the returned
              promise settles after the hook has been called. An async hook’s
              completion is not included in that wait.
            </li>
            <li>
              If the original call throws synchronously, the hook is skipped and
              the error propagates. A synchronous hook throw also propagates;
              when the hook runs after promise resolution, its throw rejects the
              returned promise instead.
            </li>
            <li>
              Async hooks are not awaited, so their rejections do not propagate
              through the wrapper. Handle errors inside an async hook.
            </li>
            <li>
              Named hooks are bound to the call’s receiver. Callback functions
              are invoked without an instance binding; use a closure when they
              need access to instance state.
            </li>
          </ul>
        </docs-section>
      </docs-page>
      `;
    }
  }

  customElements.define("after-page", AfterPage);
})();

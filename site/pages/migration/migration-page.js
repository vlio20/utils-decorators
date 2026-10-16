(() => {
  const { DocsElement } = window.DocsComponents;

  class MigrationPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="migration" heading="Migration to 3.0.0" category="Get started"
          source="CHANGELOG.md" edit-path="site/pages/migration/migration-page.js"
          next-title="after" next-href="#after">
          <p class="lead">Upgrade from 2.x with explicit state and accurate types.</p>
          <p class="intro">Version 3.0.0 isolates decorator state per instance, loads refreshable properties on first read, and makes public types match runtime behavior. Review these breaking changes before upgrading.</p>
          <docs-section anchor="upgrade" heading="Upgrade requirements">
            <p>Use Node.js <code>^22.18.0 || &gt;=24.11.0</code>. TypeScript consumers should use TypeScript 5.4+ with <code>strict</code> enabled and <code>experimentalDecorators</code> for legacy decorators. See <a href="#install/typescript">TypeScript setup</a> for field compiler settings.</p>
            <docs-code filename="terminal" language="bash"><pre><code>npm install utils-decorators@3</code></pre></docs-code>
            <p>Recompile your application and check code that shares state across instances, waits for background refreshes, or consumes wrapper return values.</p>
          </docs-section>
          <docs-section anchor="instance-isolation" heading="Breaking: state is isolated per instance">
            <p>Previously, state held by a decorated prototype method could leak across instances. In 3.0.0, <code>@cancelPrevious</code>, <code>@debounce</code>, <code>@delegate</code>, <code>@memoize</code>, <code>@memoizeAsync</code>, <code>@throttle</code>, <code>@throttleAsync</code>, and <code>@rateLimit</code> keep their wrapper state separately for each receiver.</p>
            <ul class="behavior-list">
              <li>One instance no longer cancels or replaces another instance's pending calls.</li>
              <li>Default caches and in-flight deduplication are independent. The same arguments on two instances can now run the source twice and return different results.</li>
              <li>Throttle queues, concurrency limits, and default rate-limit counters apply per instance. A limit of two per instance no longer acts as a single limit of two across the class.</li>
            </ul>
            <docs-code filename="instance-cache.ts" language="typescript"><pre><code>import { memoize } from 'utils-decorators';

class Prices {
  constructor(private readonly multiplier: number) {}

  @memoize()
  quote(amount: number): number {
    return amount * this.multiplier;
  }
}

const retail = new Prices(2);
const wholesale = new Prices(3);
retail.quote(10); // 20
wholesale.quote(10); // 30; does not reuse retail's cached 20.</code></pre></docs-code>
            <p>If cross-instance sharing is intentional, pass the same custom <code>cache</code> to <code>@memoize</code> or <code>@memoizeAsync</code>, or the same <code>rateLimitCounter</code> / <code>rateLimitAsyncCounter</code> to <code>@rateLimit</code>. Custom objects and closures you supply remain shared; use receiver-aware keys when results depend on instance data.</p>
            <p>For a shared queue, cancellation scope, or in-flight deduplication, create one function wrapper and route calls through it. Wrappers retain one state per wrapper, even across receivers; create separate wrappers when independence is required. A shared custom cache alone does not share <code>@memoizeAsync</code>'s in-flight promise tracking.</p>
          </docs-section>
          <docs-section anchor="refreshable" heading="Breaking: refreshable loads on first read">
            <p><code>@refreshable</code> previously started work when the class was defined and shared its value and timer. Now class definition and construction start no work. Each instance's first property read returns <code>undefined</code>, schedules its initial asynchronous load, and starts its own interval.</p>
            <docs-code filename="refreshable-migration.ts" language="typescript"><pre><code>import { refreshable } from 'utils-decorators';

async function loadCount(): Promise&lt;number&gt; {
  return 42;
}

class Monitor {
  @refreshable({ dataProvider: loadCount, intervalMs: 1000 })
  declare count: number | undefined | null;
}

const first = new Monitor();
const second = new Monitor(); // Neither instance has started loading.
console.log(first.count); // undefined; starts only first's load and interval.
console.log(second.count); // undefined; starts second independently.
first.count = null; // Stops only first's interval.
second.count = null;</code></pre></docs-code>
            <p>Remove assumptions that a delay after class definition or construction preloads data. Read the property to start refreshing, and handle <code>undefined</code> until a result arrives. The getter returns a value, not a promise; use an explicit async initialization method if callers must await readiness.</p>
            <p>Include <code>undefined</code> in the property type and <code>null</code> if assigning it to stop. Use <code>declare</code> to avoid shadowing the accessor. Assigning <code>null</code> before the first read prevents startup; after startup it clears only that instance's interval, without canceling the scheduled initial load or in-flight work. Stopping does not restart automatically. The provider still receives no arguments and an undefined receiver.</p>
          </docs-section>
          <docs-section anchor="types" heading="Breaking: stricter public types">
            <p>Previously accepted declarations can now fail compilation when they misrepresent what callers receive. Prefer inference from source functions and configurations over explicit factory generics.</p>
            <ul class="behavior-list">
              <li>For configured decorators, replace declarations such as <code>@memoize&lt;Service, number&gt;({...})</code> with <code>@memoize({...})</code>. Callback parameters, named method keys, key resolvers, caches, and receiver requirements must match the decorated method.</li>
              <li>Declare <code>void</code> returns for <code>@debounce</code>, <code>@delay</code>, and <code>@throttle</code>, since callers receive no result. Use function wrappers if you need the wrapper's inferred signature around a value-returning source.</li>
              <li>Async decorators require compatible promise-returning methods. Methods whose results are normalized to native promises cannot require custom promise properties. Recovery values from <code>@onError</code> must fit the method's declared result.</li>
              <li>Narrow <code>unknown</code> errors and callback payloads before accessing members. Annotate decorator callbacks as needed; function wrapper callbacks infer automatically.</li>
              <li>Choose one rate-limit counter and either <code>retries</code> or <code>delaysArray</code> for retry configuration. Extend union configuration types using type intersections rather than interface inheritance.</li>
              <li>If you explicitly use <code>Method</code> or <code>AsyncMethod</code>, supply the argument tuple, for example <code>Method&lt;number, [number]&gt;</code>. The default is now <code>unknown[]</code>; ordinary wrapper calls infer the tuple.</li>
            </ul>
            <docs-code filename="callback-types.ts" language="typescript"><pre><code>import { after, AfterParams } from 'utils-decorators';

class Service {
  @after({
    func: ({ response, args }: AfterParams&lt;number, [number]&gt;) =&gt; {
      console.log(args[0], response.toFixed());
    },
  })
  double(value: number): number {
    return value * 2;
  }
}

function report(error: unknown): void {
  console.error(error instanceof Error ? error.message : String(error));
}</code></pre></docs-code>
          </docs-section>
          <docs-section anchor="hook-arguments" heading="Hook arguments">
            <p><code>before</code> / <code>beforify</code> hooks and <code>rateLimit</code> / <code>rateLimitify</code> exceed handlers now receive the original arguments directly: <code>func(...args)</code> and <code>exceedHandler(...args)</code>. Retry hooks receive <code>onRetry(error, retryIndex, args)</code>, adding the argument tuple after the existing parameters.</p>
            <p>Existing hooks that ignore the additional arguments remain supported. Update code that inspects callback argument counts or forwards every callback argument elsewhere. Hook parameter types must match the source; annotate decorator callbacks when needed. For explicit configuration types, use <code>BeforeConfig&lt;Receiver, Args&gt;</code>, <code>RetryInputConfig&lt;Receiver, Args&gt;</code>, <code>OnRetry&lt;Args&gt;</code>, or <code>RateLimitConfigs&lt;Receiver, Args&gt;</code>.</p>
            <p>Argument objects keep their identity. Mutating an object in a hook affects the object seen by the source and subsequent retry attempts.</p>
          </docs-section>
          <docs-section anchor="returns" heading="Breaking: wrapper return values">
            <p><code>afterify</code> and default <code>beforify</code> preserve synchronous results and synchronous throws. <code>execTimify</code> now returns the measured source result. Update callers that assumed an unconditional promise or discarded result.</p>
            <docs-code filename="wrapper-results.ts" language="typescript"><pre><code>import { afterify } from 'utils-decorators';

const double = afterify((value: number) =&gt; value * 2, {
  func: ({ response }) =&gt; console.log(response),
});

const result: number = double(21); // 42, synchronously.
// double(21).then(...); // No longer valid for a synchronous source.

// When a promise API is required, an async adapter also converts throws.
const doubleAsync = async (value: number): Promise&lt;number&gt; =&gt; double(value);</code></pre></docs-code>
            <p>Check timing and error handling as well as annotations. Catch synchronous throws around a direct call, or use an async adapter when callers rely on promise rejection handling. See <a href="#after">after</a>, <a href="#before">before</a>, and <a href="#execTime">execTime</a> for each wrapper's options.</p>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("migration-page", MigrationPage);
})();

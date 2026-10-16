(() => {
  const { DocsElement } = window.DocsComponents;

  class OverviewPage extends DocsElement {
    render() {
      this.innerHTML = `
        <docs-page page-id="overview" heading="utils-decorators" category="Overview"
          source="README.md" edit-path="site/pages/overview/overview-page.js"
          next-title="Installation" next-href="#install">
          <p class="lead">Small utilities. Less repetitive code.</p>
          <p class="intro">utils-decorators is a collection of decorators and function wrappers for JavaScript and TypeScript. Cache results, control how often work runs, retry failures, and add hooks around your functions without repeating that logic in every method.</p>
          <docs-section anchor="purpose" heading="Keep your methods focused">
            <p>A method should make its main task easy to understand. Caching, timers, queues, and retry loops can obscure that task when you implement them alongside the application logic. utils-decorators packages these common behaviors into small, reusable utilities.</p>
            <p>Use decorators on class methods or wrap individual functions. The package works in Node.js and browser applications, includes TypeScript declarations, and provides CommonJS and ES module builds. Bundlers that use the ES module build can tree-shake unused utilities.</p>
          </docs-section>
          <docs-section anchor="examples" heading="A little less boilerplate">
            <p><a href="#memoizeAsync">@memoizeAsync</a> caches asynchronous results by arguments and shares pending work for matching calls. Here, repeated requests for the same user reuse a result for 60 seconds.</p>
            <docs-code filename="user-service.ts" language="typescript"><pre><code>import { memoizeAsync } from 'utils-decorators';

class UserService {
  @memoizeAsync(60_000)
  async getUser(id: string) {
    const response = await fetch('/api/users/' + encodeURIComponent(id));
    if (!response.ok) throw new Error('Unable to load user');
    return response.json();
  }
}

const users = new UserService();
await users.getUser('42'); // Fetches the user.
await users.getUser('42'); // Reuses the cached result.</code></pre></docs-code>
            <p><a href="#debounce">@debounce</a> waits until calls stop for the specified delay, then runs the method with the latest arguments.</p>
            <docs-code filename="search-box.ts" language="typescript"><pre><code>import { debounce } from 'utils-decorators';

class SearchBox {
  @debounce(300)
  search(query: string): void {
    console.log('Searching for:', query);
  }
}

const searchBox = new SearchBox();
searchBox.search('utils');
searchBox.search('utils-decorators');
// After 300 ms without another call, logs only "utils-decorators".</code></pre></docs-code>
            <p>State created internally by a decorator is scoped to each instance and member. Each UserService has its own default cache, and each SearchBox has its own debounce timer.</p>
          </docs-section>
          <docs-section anchor="functions" heading="Use functions too">
            <p>Standalone wrappers provide the same behaviors without decorator syntax. They work with regular functions in JavaScript and TypeScript.</p>
            <docs-code filename="example.js" language="javascript"><pre><code>import { debouncify } from 'utils-decorators';

const search = debouncify((query) =&gt; {
  console.log('Searching for:', query);
}, 300);

search('utils');
search('utils-decorators');</code></pre></docs-code>
            <p>Each utility's reference page includes decorator and function examples, configuration options, and details about its behavior.</p>
          </docs-section>
          <docs-section anchor="utilities" heading="Find the right utility">
            <ul>
              <li><strong>Cache results:</strong> <a href="#memoize">memoize</a> for synchronous work and <a href="#memoizeAsync">memoizeAsync</a> for asynchronous work.</li>
              <li><strong>Control timing:</strong> <a href="#debounce">debounce</a> waits for a pause; <a href="#throttle">throttle</a> limits call frequency; <a href="#delay">delay</a> postpones execution.</li>
              <li><strong>Manage load:</strong> <a href="#throttleAsync">throttleAsync</a> limits concurrent work, <a href="#rateLimit">rateLimit</a> enforces a call budget, and <a href="#leakyBucket">leakyBucket</a> queues calls at a steady pace.</li>
              <li><strong>Handle asynchronous work:</strong> <a href="#retry">retry</a> retries failures, <a href="#timeout">timeout</a> bounds waiting time, <a href="#delegate">delegate</a> shares matching work, and <a href="#cancelPrevious">cancelPrevious</a> rejects superseded calls.</li>
              <li><strong>Add hooks:</strong> <a href="#before">before</a>, <a href="#after">after</a>, <a href="#onError">onError</a>, and <a href="#execTime">execTime</a> run callbacks around a method's execution.</li>
              <li><strong>Explore more:</strong> <a href="#refreshable">refreshable</a> updates values on an interval, <a href="#readonly">readonly</a> protects assignments, and <a href="#multiDispatch">multiDispatch</a> dispatches repeated calls.</li>
            </ul>
          </docs-section>
          <docs-section anchor="start" heading="Get started">
            <docs-code filename="terminal" language="bash"><pre><code>npm install utils-decorators</code></pre></docs-code>
            <p>Read the <a href="#install">installation guide</a> for runtime requirements and TypeScript setup. Decorator syntax requires TypeScript's legacy decorators with <code>experimentalDecorators</code> enabled; function wrappers need no decorator configuration.</p>
            <p>Upgrading from 2.x? Start with the <a href="#migration">3.0.0 migration guide</a>. For questions, ideas, or bug reports, visit <a href="https://github.com/vlio20/utils-decorators/issues">GitHub issues</a>.</p>
          </docs-section>
        </docs-page>
      `;
    }
  }

  customElements.define("overview-page", OverviewPage);
})();

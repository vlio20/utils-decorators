# utils-decorators

`utils-decorators` is a tree-shakable collection of utility functions and TypeScript decorators for common tasks such as caching results, controlling call frequency, retrying failures, and handling asynchronous work. Use each utility as a decorator or as a standalone function wrapper.

**[Read the documentation](https://vlio20.github.io/utils-decorators/)** for installation, TypeScript setup, all utilities, and the [3.0.0 migration guide](https://vlio20.github.io/utils-decorators/#migration).

## Install

```bash
npm install utils-decorators
```

The package requires Node.js `^22.18.0 || >=24.11.0`. For TypeScript decorators, enable `experimentalDecorators` and use strict type checking.

## Examples

### Cache asynchronous results with `@memoizeAsync`

Repeated calls with the same arguments reuse the cached promise result.

```ts
import { memoizeAsync } from 'utils-decorators';

class UserService {
  @memoizeAsync()
  async getUser(id: string) {
    const response = await fetch(`/api/users/${id}`);
    return response.json();
  }
}
```

### Debounce calls with `@debounce`

Run the method once after calls have stopped for the specified delay.

```ts
import { debounce } from 'utils-decorators';

class SearchBox {
  @debounce(300)
  search(query: string): void {
    console.log('Searching for:', query);
  }
}
```

## Feedback

Questions, ideas, and bug reports are welcome in the [GitHub issues](https://github.com/vlio20/utils-decorators/issues).

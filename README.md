
# ts-decorators  
[![Build Status](https://travis-ci.org/vlio20/ts-decorators.svg?branch=master)](https://travis-ci.org/vlio20/ts-decorators)  
[![Coverage Status](https://coveralls.io/repos/github/vlio20/ts-decorators/badge.svg?branch=master)](https://coveralls.io/repos/github/vlio20/ts-decorators/)  
  
### V1 2do  
  
- [x] memoize-async  
- [ ] memoize  
- [ ] delay  
- [ ] debounce  
- [ ] throttle  
- [ ] refreshable  
  
  
## @memoizeAsync  
Creates a function that memoizes the promise that being returned by the decorated method.  
If the promise would be rejected, the promise won't be memoized.   
Another great feature of this decorator is that it delegates requests, for example if the same method has been called more than one time before the promise was resolved, 
only one invocation of the decorated method will be invoked.  
  
Be default the key of the cached value will be the serialized (`JSON.stringify`) value of the provided arguments.   
You can supply your own key resolver.
Also, you can provide your own cache, it has to implement the `GetterSetter<D>` interface, by default the decorator is using  
a simple `Map<string, Promise<D>>`.    
You can see find details in the API below.   
  
**API**
```typescript
// API
export function memoizeAsync<D>(config: MemoizeAsyncConfig<D>): Memoizable<D>;  
export function memoizeAsync<D>(expirationTimeMs: number): Memoizable<D>;  

// Model
export type KeyResolver = (...args: any[]) => string;
export type AsyncMethod<D> = (...args: any[]) => Promise<D>;

export interface GetterSetter<D> {
  set: (key: string, value: Promise<D>) => void;
  get: (key: string) => Promise<D> | null;
  delete: (key: string) => void;
  has: (key: string) => boolean;
}

export interface MemoizeAsyncConfig<D> {
  cache?: GetterSetter<D>;
  keyResolver?: KeyResolver;
  expirationTimeMs: number;
}

export type Memoizable<D> = (target: any,
                             propertyName: string,
                             descriptor: TypedPropertyDescriptor<AsyncMethod<D>>) => TypedPropertyDescriptor<AsyncMethod<D>>;

```  

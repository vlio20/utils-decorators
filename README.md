# utils-decorators
[![Build Status](https://travis-ci.org/vlio20/utils-decorators.svg?branch=master)](https://travis-ci.org/vlio20/utils-decorators)      
[![Coverage Status](https://coveralls.io/repos/github/vlio20/utils-decorators/badge.svg?branch=master)](https://coveralls.io/repos/github/vlio20/utils-decorators/)   
[![Mutation testing badge](https://badge.stryker-mutator.io/github.com/vlio20/utils-decorators/master)](https://stryker-mutator.github.io)      
  
This library was highly inspired by lodash but uses decorators to implement its util methods.   
The lib can be used both in node and in web application, it is built to be **tree-shakable so you can use it even if you need a specific decorator**.  

```bash
npm i utils-decorators
```   

Please note that the decorators are **working perfectly with plain JavaScript** code as well as with TypeScript.

Usage example:
```typescript 
import {before} from 'utils-decorators';

class Test {
  @before<Test>({func: 'goo'})
  foo() {
    console.log('will run after');
  }
  
  goo() {
    console.log('will run before foo');
  }
}

const t = new Test();
```



## @after (method)  
Invocation of the decorated method will cause execution of the provided `func` method before the invocation of the decorated method.    
  
```typescript 
function after(config: AfterConfig): Afterable; 

interface AfterConfig {
  func: Function | string;
  wait?: boolean;
}
```  

- `func`: the function (`Function`) or the method name (`string`), see notes for more details, to be invoked after the decorated method.
- `wait`: should the invocation of the `func` method be delayed to the point when the decorated method will be resolved.  

  
## @before (method)  
Invocation of the decorated method will cause execution of the provided `func` method before the invocation of the decorated method.    
  
```typescript 
function before(config: BeforeConfig): Beforable; 

interface BeforeConfig {
  func: Function | string;
  wait?: boolean;
}
```  

- `func`: the function (`Function`) or the method name (`string`), see notes for more details, to be invoked before the decorated method.
- `wait`: should the invocation of the decorated method be delayed to the point when `func` will be resolved.  
    
    
## @cancelPrevious (method)  
Invocation of the decorated method will cause the a rejection of the previous invocation with an error of `CancelPromise` type.    
  
```typescript 
function cancelPrevious(): CancelPreviousable<T, D>; 
```    
  
  
## @debounce (method)  
Causes a delay in the invocation of the decorated method by given time (in ms), if during the delay another invocation will happen, the delay will be restarted.  
  
```typescript 
function debounce(delayMs: number): Debouncable; 
```  

  
## @delay (method)  
Causes a delay in the invocation of the decorated method by given time (in ms).  
  
```typescript 
function delay(delayMs: number): Delayable; 
```  
     
     
## @memoize (method)  
Memoizes the response that is being returned by the decorated method.      
    
Be default the key of the cached value will be the serialized (`JSON.stringify`) value of the provided arguments.       
You can supply your own key resolver.    
Also, you can provide your own cache, it has to implement the `GetterSetter<D>` interface, by default the decorator is using a simple `Map<string, Promise<D>>`.        
      
```typescript 
function memoize<D>(config: MemoizeConfig<D>): Memoizable<D>; 
function memoize<D>(expirationTimeMs: number): Memoizable<D>; 

interface MemoizeConfig<T, D> {
  cache?: Cache<D>;
  keyResolver?: KeyResolver | keyof T;
  expirationTimeMs?: number;
}
```   

- `cache`: A cache object the previous values would be stored, needs to implement the `Cahce<D> interface`.
- `keyResolver`: A custom resolver for the cache key.
- `expirationTimeMs`: A TTL (time to leave) the cache.  


## @memoizeAsync  (method)  
Memoizes the promise that being returned by the decorated method.      
If the promise would be rejected, the promise won't be memoized.       
Another great feature of this decorator is that it delegates requests, for example if the same method has been called more than one time after the promise was resolved,     
only one invocation of the decorated method will be invoked.      
      
Be default the key of the cached value will be the serialized (`JSON.stringify`) value of the provided arguments.       
You can supply your own key resolver.    
Also, you can provide your own cache, it has to implement the `GetterSetter<D>` interface, by default the decorator is using a simple `Map<string, Promise<D>>`.        
      
```typescript 
function memoizeAsync<D>(config: MemoizeAsyncConfig<D>): AsyncMemoizable<D>; 
function memoizeAsync<D>(expirationTimeMs: number): AsyncMemoizable<D>; 

type MemoizeAsyncConfig<T, D> = MemoizeConfig<T, D>
```  

See `MemoizeConfig<T, D>` above.


## @onError (method)  
This decorator will catch errors thrown from the decorated method and invoke the provided `func` function. 
If the decorated method returns a `Promise` the `wait` property should be set to true in order to handle the promise rejection correctly.

```typescript 
function onError(config: OnErrorConfig): OnErrorable; 

interface OnErrorConfig {
  func: (e: error, args: any[]) => any | string;
}
```  

- `func`: the function (`Function`) or the method name (`string`), see notes for more details, to be invoked on an error of the decorated method.
- `wait`: should the invocation of the decorated method be delayed to the point when `func` will be resolved/rejected.  


## @readonly (property)  
This decorator prevents setting new values to decorated property.  
  
```typescript 
function readonly<T>(target: T, key: keyof T): void; 
``` 

  
## @refreshable (property)  
This decorator provides an ability to access a property which value is being updated over and over in a given interval (in ms) by the returned value of the provided method. Note that the method can also return a promise which will be resolved after each interval.  
In order to cancel the refreshment of the data you need to set the decorated value to null (this is very important note to prevent memory leaks). Setting any other value will be ignored.  
Another important note is that the initial value of the decorated attribute must not be `null`. Any other value should be fine.
  
```typescript 
function refreshable<D>(dataProvider: Method<D> | Method<Promise<D>>, intervalMs: number): Refreshable; 

interface RefreshableConfig<D> {
  dataProvider: Method<D> | Method<Promise<D>>;
  intervalMs: number;
}
```  

- `dataProvider`: the function that will provide the data to the decorated attribute.
- `intervalMs`: the time interval (in milliseconds) in which the data will be refreshed .


## @throttle (method)  
Invocation of the decorated method will happen immediately, but if another invocation of this method will happen during the provided time (in ms) it will be ignored.   
  
```typescript 
function throttle(delayMs: number): Throttable; 
```  


## @execTime (method)  
Measures the time that takes for the decorated method to response. 
By default will log the result using `console.info()` but this can be changed by providing your own reporter function.    
  
```typescript 
function execTime<T>(arg?: ReportFunction | string): ExactTimeReportable<T>
```

- `ReportFunction`: the function that will be invoked after the execution of decorated method. Also can be provided as `string` this way it will invoke the method that is name as the provided string. If no value will be provided then the execution time will be logged with `console.info`.
```typescript
type ReportFunction = (data?: ExactTimeReportData) => any;

type ExactTimeReportData = {
  args: any[];
  result: any;
  execTime: number;
}
```  

## @retry (method)  
Retries execution of the decorated method. The method will be invoked extra x + 1 (where x is the retries values) in the worst case (when all invocation failed).     
You can provide you own delay time (or delay times array) between the invocations - see details below. Note that the default delay between retries is 1000ms.
  
```typescript 
function retry<T>(config: RetryInput): Retryable<T>
```

```typescript
type RetryInput = number | number[] | {
  retries: number;
  delay: number;
};
```  

## @timeout (method)  
Will throw an error (`TimeoutError`) if the decorated method returned promise won't be resolved withing the provided timeout (timeout is in milliseconds). 
  
```typescript 
function timeout<T>(ms: number): Timeoutable<T>
```

- `ms`: time in milliseconds for waiting for the promise to be resolved.

## @multiDispatch (method)  
Will invoke the decorated method the amount of provided time in parallel. This decorator is useful when you want to increase the chance of the decorated method to return a value.  
Note that the fastest resolved promise will resolve the decorated method and in case where all dispatched will fail the last error would be of the last rejected promise.  
  
```typescript 
function multiDispatch<T>(dispatchesAmount: number): MultiDispatchable<T>
```

- `dispatchesAmount`: the amount of invocations to generate simultaneously.

----

## @delegate (method)  
For a given input, if within the time period of the resolving of the promise of the first invocation the decorated method was invoked multiple times (with the same input) the response would be the promise that was generated by the first invocation.  
This way this decorator reduces the amount of calls to the implementation of the decorated method, for example accessing the database.  
  
```typescript 
function delegate<T>(keyResolver?: (...args: any[]) => string): MultiDispatchable<T>
```

- `keyResolver`: A custom resolver for caching the returned promise.

----

## Notes:  
**Class methods:** some decorators expect you to provide a function as one of their attributes or arguments, for example in the `@before`.  
Because of the way decorators currently work in JavaScript, there is no way to provide a class method from the same context. We will continue withe the `@before` example, the following code won't work:  

```typescript
class Worker {
  fetchTasks(): Promise<void> {
    ...
  }
  
  @before({
    func: this.fetchTasks.bind(this),
    wait: true
  })
  doWork(workId: number): Promise<void> {
    ...
  }
}
```

When the `@before` decorator code will be executed the instance of the class still won't exist, and this will cause `this` to be `undefined`.  
To overcome this issue, instead of providing a reference to the method you can provide the method name:

```typescript
class Worker {
  fetchTasks(): Promise<void> {
    ...
  }
  
  @before({
    func: 'fetchTasks',
    wait: true
  })
  doWork(workId: number): Promise<void> {
    ...
  }
}
```

This way, during runtime, we can trigger the provided method by it's name with the `this` (class) context.

# Feedback
I will be more than happy to hear your feedback, don't hesitate to ask any question or open an issue. PRs are always welcomed :)  
Also, I will be happy to hear about new ideas for new decorators, if you have such, please open an issue and describe the requirements and features of your decorator. 

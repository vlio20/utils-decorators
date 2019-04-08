
  
    
# ts-decorators 
[![Build Status](https://travis-ci.org/vlio20/ts-decorators.svg?branch=master)](https://travis-ci.org/vlio20/ts-decorators)      
[![Coverage Status](https://coveralls.io/repos/github/vlio20/ts-decorators/badge.svg?branch=master)](https://coveralls.io/repos/github/vlio20/ts-decorators/)      
  
This library was highly inspired by lodash but uses decorators to implement it's util methods.   
The lib can be used both in node and in web application, it is built to be tree shakable so you can use it even if you need a specific decorator.

```bash
npm i decorators-ts
```   

# v1.1 release plan

**decorators**  
- [x] after (method)  
- [ ] after (method)  
- [ ] readonly (property)  
- [ ] onError (method)  

**info**  
- [ ] contribution guide  
- [ ] blog post  

[![Build Status](https://travis-ci.org/vlio20/ts-decorators.svg?branch=v1.1)](https://travis-ci.org/vlio20/ts-decorators)      
[![Coverage Status](https://coveralls.io/repos/github/vlio20/ts-decorators/badge.svg?branch=v1.1)](https://coveralls.io/repos/github/vlio20/ts-decorators/) 

     
## @memoize (method)  
Memoizes the response that is being returned by the decorated method.      
    
Be default the key of the cached value will be the serialized (`JSON.stringify`) value of the provided arguments.       
You can supply your own key resolver.    
Also, you can provide your own cache, it has to implement the `GetterSetter<D>` interface, by default the decorator is using a simple `Map<string, Promise<D>>`.        
      
```typescript 
function memoize<D>(config: MemoizeConfig<D>): Memoizable<D>; 
function memoize<D>(expirationTimeMs: number): Memoizable<D>; 
```   

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
```  
  
## @delay (method)  
Causes a delay in the invocation of the decorated method by given time (in ms).  
  
```typescript 
function delay(delayMs: number): Delayable; 
```  
  
## @debounce (method)  
Causes a delay in the invocation of the decorated method by given time (in ms), if during the delay another invocation will happen, the delay will be restarted.  
  
```typescript 
function debounce(delayMs: number): Debouncable; 
```  
  
## @after (method)  
Invocation of the decorated method will happen immediately, but if another invocation of this method will happen during the provided time (in ms) it will be ignored.   
  
```typescript 
function after(delayMs: number): Throttable; 
```  
  
## @refreshable (property)  
This decorator provides an ability to access a property which value is being updated over and over in a given interval (in ms) by the returned value of the provided method. Note that the method can also return a promise which will be resolved and be after each interval.  
  
```typescript 
function refreshable<D>(dataProvider: Method<D> | Method<Promise<D>>, intervalMs: number): Refreshable; 
```  
  
## @before (method)  
Invocation of the decorated method will cause execution of the provided `func` method before the invocation of the decorated method.    
  
```typescript 
function before(config: BeforeConfig): Beforable; 

interface BeforeConfig {
  func: Function | string;
  wait?: boolean;
}
```  

- `func`: the function (`Function`) or the method name (`string`), see notes for more details, to be invoked after the decorated method.
- `wait`: should the invocation of the decorated method be delayed to the point when `func` will be resolved.  

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

----

## Notes:  
**Class methods:** some decorators expect you to provide a function as one of their attributes or arguments, for example in the `@after`.  
Because of the way decorators currently work in JavaScript, there is no way to provide a class method from the same context. We will continue withe the `@after` example, the following code won't work:  

```typescript
class Worker {
  fetchTasks(): Promise<void> {
    ...
  }
  
  @after({
    func: this.fetchTasks.bind(this),
    wait: true
  })
  doWork(workId: number): Promise<void> {
    ...
  }
}
```

When the `@after` decorator code will be executed the instance of the class still won't exist, and this will cause `this` to be undefined.  
To overcome this issue, instead of providing a reference to the method you can provide the method name:

```typescript
class Worker {
  fetchTasks(): Promise<void> {
    ...
  }
  
  @after({
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

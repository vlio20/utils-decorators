import {ObservableMethod} from '../common/model/common.model';
import {Observable} from 'rxjs';
import {
    publishReplay,
    refCount
} from 'rxjs/operators';
import {
    RxMemoizable,
    RxMemoizeConfig
} from './memoize-rx.model';
import {TaskExec} from '../common/tesk-exec/task-exec';

export function memoizeRx<T = any, D = any>(config: RxMemoizeConfig<T, D>): RxMemoizable<T, D>;
export function memoizeRx<T = any, D = any>(expirationTimeMs: number): RxMemoizable<T, D>;
export function memoizeRx<T = any, D = any>(input: RxMemoizeConfig<T, D> | number): RxMemoizable<T, D> {
    const defaultConfig: RxMemoizeConfig<any, D> = {
        cache: new Map<string, Observable<D>>(),
        expirationTimeMs: 60 * 1000,
    };
    const runner = new TaskExec();

    return function(
        target: T,
        propertyKey: keyof T,
        descriptor: TypedPropertyDescriptor<ObservableMethod<D>>
    ) {
        let resolvedConfig = {
            ...defaultConfig,
        } as RxMemoizeConfig<T, D>;

        if (typeof input === 'number') {
            resolvedConfig.expirationTimeMs = input;
        } else {
            resolvedConfig = {
                ...resolvedConfig,
                ...input,
            };
        }

        // the Observable function
        if (!descriptor.value) {
            throw new Error('@memoizeRx is applicable only on a methods.');
        }

        const originalMethod = descriptor.value;

        descriptor.value = function(...args: any[]): Observable<D> {
            const keyResolver = typeof resolvedConfig.keyResolver === 'string'
                ? this[resolvedConfig.keyResolver].bind(this)
                : resolvedConfig.keyResolver;

            let key;

            if (keyResolver) {
                key = keyResolver(...args);
            } else {
                key = JSON.stringify(args);
            }

            if (resolvedConfig.cache.has(key)) {
                return resolvedConfig.cache.get(key)
            }

            let returnedObservable = originalMethod.apply(this, args);
            if (!(returnedObservable instanceof Observable)) {
                throw new Error(
                    `method decorated with @memoizeRx must return Observable`
                );
            }

            const observable$ = returnedObservable.pipe(
                publishReplay(),
                refCount()
            );

            resolvedConfig.cache.set(key, observable$);
            runner.exec(() => {
                resolvedConfig.cache.delete(key);
            }, resolvedConfig.expirationTimeMs);

            return observable$;
        };

        return descriptor;
    };
}

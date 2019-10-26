// tslint:disable:no-any no-require-imports no-function-expression no-invalid-this

import { ProgressLocation, ProgressOptions, Uri, window } from 'vscode';
import '../extensions';
import { Resource } from '../types';
import { InMemoryInterpreterSpecificCache } from './cacheUtils';

type VSCodeType = typeof import('vscode');
type PromiseFunctionWithFirstArgOfResource = (...any: [Uri | undefined, ...any[]]) => Promise<any>;

export function clearCachedResourceSpecificInterpreterData(key: string, resource: Resource, vscode: VSCodeType = require('vscode')) {
    const cache = new InMemoryInterpreterSpecificCache(key, 0, [resource], vscode);
    cache.clear();
}
export function cacheResourceSpecificInterpreterData(key: string, expiryDurationMs: number, vscode: VSCodeType = require('vscode')) {
    return function (_target: Object, _propertyName: string, descriptor: TypedPropertyDescriptor<PromiseFunctionWithFirstArgOfResource>) {
        const originalMethod = descriptor.value!;
        descriptor.value = async function (...args: [Uri | undefined, ...any[]]) {
            const cache = new InMemoryInterpreterSpecificCache(key, expiryDurationMs, args, vscode);
            if (cache.hasData) {
                console.debug(`Cached data exists ${key}, ${args[0] ? args[0].fsPath : '<No Resource>'}`);
                return Promise.resolve(cache.data);
            }
            const promise = originalMethod.apply(this, args) as Promise<any>;
            promise.then(result => cache.data = result).catch(() => { });
            return promise;
        };
    };
}

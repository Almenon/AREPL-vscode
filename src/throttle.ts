/**
 * class for limiting the rate of function calls.
 * Thanks to Pat Migliaccio.
 * see https://medium.com/@pat_migliaccio/rate-limiting-throttling-consecutive-function-calls-with-queues-4c9de7106acc
 * @example let l = new limit(); let logMessageLimited = l.throttleAndQueue(msg => { console.log(msg); }, 500);
 */
export class Limit{
    public callQueue = []
    public lastCall
    public interval: NodeJS.Timer

    /**
     * Returns a version of your function that can be called at most every W milliseconds, where W is wait.
     * Calls to your func that happen more often than W get queued up to be called every W ms
     * @param fn
     * @param wait
     */
    throttleAndQueue(fn: Function, wait: number){
        let isCalled = false;
        const self = this;

        const caller = function(){
            if(self.callQueue.length && !isCalled){
                isCalled = true;
                self.callQueue.shift().call();
                setTimeout(function(){
                    isCalled = false;
                    caller();
                }, wait);
            }
        };

        return function(...args){
            self.callQueue.push(fn.bind(this, ...args));

            caller();
        };
    }

    /**
     * Returns a version of your function that can be called at most every W milliseconds, where W is wait.
     * for calls that happen more often than W the last call will be the one called
     * @param fn
     * @param wait
     */
    throttledUpdate(fn: Function, wait: number){
        const self = this;

        function caller(){
            // if no timer is set then we can accept a call
            if(!self.interval){
                self.lastCall.call()
                self.lastCall = null

                // check every W ms for updates
                self.interval = setInterval(() => {
                    if(self.lastCall){
                        self.lastCall.call()
                        self.lastCall = null
                    }
                    else{
                        // no update, we can stop checking
                        clearInterval(self.interval)
                        self.interval = null
                    }
                }, wait)
            }
        }

        return function(...args){
            self.lastCall = fn.bind(this, ...args);

            caller()
        }
    }
}

/**
 * limits your function to be called at most every W milliseconds, where W is wait.
 * Calls over W get dropped.
 * Thanks to Pat Migliaccio.
 * see https://medium.com/@pat_migliaccio/rate-limiting-throttling-consecutive-function-calls-with-queues-4c9de7106acc
 * @param fn
 * @param wait
 * @example let throttledFunc = throttle(myFunc,500);
 */
export function throttle(fn: Function, wait: number){
    let isCalled = false;

    return function(...args){
        if(!isCalled){
            fn(...args);
            isCalled = true;
            setTimeout(function(){
                isCalled = false;
            }, wait)
        }
    };
}

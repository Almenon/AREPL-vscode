import { clearInterval } from "timers";

export class buffer{
    buffer = ""
    interval: NodeJS.Timer

    constructor(private fn:Function, private scope:any, private wait:number, private seperator=""){}

    /**
     * calls func and clears buffer
     */
    flushBuffer(...args){
        this.fn.bind(this.scope)(this.buffer,...args)
        this.buffer = ""
    }

    clearBuffer(){
        this.buffer = ""
    }

    /**
     * Input is put into a buffer and the entire buffer is passed to the function every W milliseconds, where W is wait.
     */
    call(input:string, ...args){
        this.buffer = this.buffer + input + this.seperator
        if(!this.interval){
            this.flushBuffer()
            this.interval = setInterval(()=>{
                if(this.buffer){
                    this.flushBuffer(...args)
                }
                else{
                    clearInterval(this.interval)
                    this.interval = null
                }
            }, this.wait)
        }
    }

}
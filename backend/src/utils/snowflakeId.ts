export class Snowflake{
    private epoch = 1700000000000n;

    private workerId : bigint;
    private sequence = 0n;
    private lastTimeStamp = 0n;

    constructor(workerId : number){
        this.workerId = BigInt(workerId);
    }

    private now(){
        return BigInt(Date.now());
    }

    generate() : bigint {

        let timestamp = this.now(); // initialise working instance

        if(timestamp === this.lastTimeStamp){ // to identify multiple generations are being done at one instance
            this.sequence = (this.sequence + 1n ) % 4095n; // to increment the counter for number of links being generated per instance, once it reaches the limit (4096) -> it automatically resets to 0

            if(this.sequence === 0n){ // if sequence generation limit is reached, wait until the next instance (ms) is reached
                
                while(timestamp <= this.lastTimeStamp){
                    timestamp = this.now();
                }
            }
        }else{
            // if the clock moved to new instance (next millisecond) automatically convert the sequence back to 0
            this.sequence = 0n;
        }

        this.lastTimeStamp = timestamp; // if successfull generation is done, set last time stamp to current timestamp at which generation is being done

        // main id generation part
        const id = ((timestamp - this.epoch) << 22n) | (this.workerId << 12n) | this.sequence;

        return id;
    } 
}
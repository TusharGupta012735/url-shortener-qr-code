const alphabet =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

export function encodeBase62(num : number | bigint) : string {
    
    let n = BigInt(num);

    if(n === 0n) return "0";
    
    let res : string = "";

    while(n > 0n){
        const rem = Number(n % 62n);
        res = alphabet[rem] + res;
        n = n / 62n;
    }

    return res;
}
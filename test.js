// let unit = 120;
// let amt = 0;

// // 13---> 400, 8---> 200, 6---> 100, 4---> 99


// if(unit >= 400){
//     amt += (unit - 400) * 13;
//     unit = 400;
// }
// if(unit < 400 && unit > 200  ){
//     amt += (unit-200) * 8;
//     unit = 200

// }

// if(unit <= 200 && unit > 100){
//     amt += (unit - 100) * 6;
//     unit = 100
// }

// if(unit <= 100){
//     amt += unit * 4;
// }

// console.log(amt);



// let amt = 4823;

// if(amt >= 500){
//     let note500 = Math.floor(amt/500)
//     console.log('note500: ', note500);
//     amt = amt%500
// }

// if(amt >=200){
//     let note200 = Math.floor(amt/200);
//     console.log('note200: ', note200);
//     amt = amt%200
// }

// if(amt >= 100){
//     let note100 = Math.floor(amt/100);
//     console.log('note100: ', note100);
//     amt = amt%100
// }
// if(amt >= 50){
//     let note50 = Math.floor(amt/50);
//     console.log('note50: ', note50);
//     amt = amt%50
// }

// if(amt >= 20){
//     let note20 = Math.floor(amt/20);
//     console.log('note20: ', note20);
//     amt = amt%20
// }

// if(amt >= 10){
//     let note10 = Math.floor(amt/10);
//     console.log('note10: ', note10);
//     amt = amt % 10
// }

// console.log('amt: ', amt);


// let num = 0.2 + 0.1;
// switch (num) {
//     case 0.3:
//         console.log(':true',);
//         break;
//     case 0.5:
//         console.log(':baaaa ',);
//         break;
//     default: console.log(':namaste ',);
//         break;
// }


// let num = 10;
// let sum = 0;

// for (let i = 0; i <= num; i++) {
//     sum = sum + i;
// }
// console.log('sum: ', sum);


// let num = 65;
// let isPrime = true;

// for (let i = 2; i < num; i++) {
//     if(num%i === 0){
//         isPrime = false;
//         break; 
//     }
// }
// console.log(isPrime );

// function isPrime(n){
//     if(n<= 1) return false;
//     if(n === 2) return true;
//     if(n%2 === 0) return false;

//     for(let i=3; i <= Math.floor(Math.sqrt(n)); i+=2){
//         if(n%i === 0) return false;
//     }
//     return true;
// }

// console.log(isPrime(65))


// let num = 8;
// let rev = 0;

// while(num>0){
//     // let rem = num %10;
//     // rev = rev * 10 + rem;
//     // num = Math.floor(num/10)


// }
// console.log('rev: ', rev);

let num = 2;
let isPrime = true;
if (num < 1) isPrime = false;
if (num === 2) isPrime = true;
if(num % 2 == 0 && num != 0) isPrime = false;
for (let i = 3; i <= Math.floor(Math.sqrt(num)); i += 2) {
    if (num % i === 0) {
        isPrime = false;
        break;
    }
    }

console.log('isPrime: ', isPrime);


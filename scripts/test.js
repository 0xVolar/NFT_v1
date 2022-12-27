for (let index = 0; index < 10; ++index) {
    console.log("i = ", index)
    
}

console.log("--------------------------------------")

for (let index = 0; index < 10; index++) {

    console.log("i = ", index)
}

//The hint is that you have applied an incompatible version in the contract , You need to modify the version number of the relevant contract source code . Or try setting up a compiler for a single file ：```solidity: { compilers: [...], overrides: { "contracts/Foo.sol": { version: "0.5.5", settings: { } } } }``` however , I haven't used this method myself , Refer to the documentation ：https://hardhat.org/guides/compile-contracts.html
//hardhat Because of deep integration solidity, So we need support solidity 0.8 Version of , The current version doesn't seem to support . May refer to https://hardhat.org/reference/solidity-support.html
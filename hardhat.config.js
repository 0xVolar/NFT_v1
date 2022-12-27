require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      // {version: "0.6.0"},
      {version: "0.6.5"}
    ],
    // overrides: {
    //   "contracts/NFT.sol": {
    //     version: "0.6.0",
    //     settings: { }
    //   }
    // }
  },
};

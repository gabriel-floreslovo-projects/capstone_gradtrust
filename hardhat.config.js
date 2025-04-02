require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
const { API_URL, PRIVATE_KEY } = process.env

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  defaultNetwork: "sepolia",
  networks: {
    hardhat: {},
    sepolia: {
      url: API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    }
    // optimismSepolia: {
    //     url: "https://sepolia.optimism.io",
    //     accounts: [process.env.SEPOLIA_PRIVATE_KEY]
    // }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};

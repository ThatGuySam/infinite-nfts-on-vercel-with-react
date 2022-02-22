// require('esm')

require("@nomiclabs/hardhat-waffle")

require('dotenv').config()


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const networks = {
  hardhat: {
    // MetaMask Mandated Chain ID
    // You'll also need to enable Settings > Advanced > "Show test networks" in MetaMask
    // https://hardhat.org/metamask-issue.html#metamask-chainid-issue
    chainId: 1337
  }
}


// If we have MATIC_URL set, we'll use it to deploy the MATIC contract
if ( process.env.MATIC_URL ) {
  networks.matic = {
    url: process.env.MATIC_URL,
    accounts: [
      process.env.MATIC_PRIVATE_KEY
    ]
    // Hardhat will default to the mainnet if you don't specify a networkId
    // networkId: process.env.MATIC_NETWORK_ID,
    // Hardhat will default to the mainnet if you don't specify a chainId
    // chainId: process.env.MATIC_CHAIN_ID,
  }
}

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks,
  paths: {
    artifacts: './src/artifacts',
  }
};

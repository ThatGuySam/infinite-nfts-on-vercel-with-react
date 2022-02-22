# Web3 - Full Tutorial

The demo contains a basic web3 app and smart contract for minting NFTs.

- See it in action in the [Web3 NFT Tutorial](https://youtu.be/meTpMP0J5E8) on YouTube.
- Follow the full [Web3 Tutorial](https://fireship.io/lessons/web3-solidity-hardhat-react-tutorial) on Fireship.

## Usage

Prerequisites

- For MetaMask: Enable Settings > Advanced > "Show test networks"

```bash
git clone <this-repo>
npm install

# Copy the env example
cp .env.example .env

# terminal 1
npm run set-up-hardhat

# terminal 2
npm run deploy-local-network

# Copy the returned Contract Address into your VITE_CONTRACT_ADDRESS in the .env file you created earlier

# terminal 3 
npm run dev
```

Update the deployed contract address in `compoonents/Home.js` 


## Nonce too high

This means you need to reset MetaMask test account
https://medium.com/@thelasthash/solved-nonce-too-high-error-with-metamask-and-hardhat-adc66f092cd


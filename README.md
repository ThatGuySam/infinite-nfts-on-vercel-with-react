# Web3 Extended Tutorial - Multiverse Albums


You can test deploy with the `VITE_CONTRACT_ADDRESS` for Multiverse Albums: `0xFE723B06285a5039eE6354D05690fF2b7F693036`
<br>
<br>
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FThatGuySam%2Finfinite-nfts-on-vercel-with-react&env=VITE_CONTRACT_ADDRESS&envDescription=Enter%20the%20Contract%20API%20Address.&envLink=https://github.com/ThatGuySam/infinite-nfts-on-vercel-with-react/blob/main/.env.example#L19)


Based on [Fireship's Excellent NFT Tutorial](https://fireship.io/lessons/web3-solidity-hardhat-react-tutorial/)

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






## Nonce too high

This means you need to reset MetaMask test account
https://medium.com/@thelasthash/solved-nonce-too-high-error-with-metamask-and-hardhat-adc66f092cd


import WalletBalance from './WalletBalance';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers'

import MultiverseAlbums from '../artifacts/contracts/MultiverseAlbums.sol/MultiverseAlbums.json'
import { getMetaDataUrl, getImageUrl } from '../helpers/urls.js'


// https://vitejs.dev/guide/env-and-mode.html#env-files
const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS

// console.log('contractAddress', contractAddress)



let contract = null
let signer = null

async function setupContractInstance () {

  if ( contract !== null ) {
    return contract
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum)

  // Prompt user for account connections
  // https://stackoverflow.com/a/67836760/1397641
  await provider.send('eth_requestAccounts', [])

  // get the end user
  signer = provider.getSigner()
  
  // get the smart contract
  contract = new ethers.Contract(contractAddress, MultiverseAlbums.abi, signer)

  return {
    contract,
    signer
  }
}


function Home() {

  const [totalMinted, setTotalMinted] = useState(0);
  useEffect(() => {

    setupContractInstance()
      .then(() => {
        getCount()
      })

  }, [])

  const getCount = async () => {
    const count = await contract.count()//.catch(console.error)
    // console.log('Contract count', parseInt(count));
    setTotalMinted(parseInt(count));
  }

  // console.log('totalMinted', totalMinted)

  return (
    <div>
      <WalletBalance />

      <h1>Multiverse of Albums</h1>
      <div className="container">
        <div className="row">
          {Array(totalMinted + 1)
            .reverse()
            .fill(0)
            .map((_, i) => (
              <div key={i} className="col-sm">
                <NFTImage tokenId={i} getCount={getCount} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function NFTImage({ tokenId, getCount }) {
  const contentId = 'Qmdbpbpy7fA99UkgusTiLhMWzyd3aETeCFrz7NpYaNi6zY';
  const metadataURI = getMetaDataUrl( tokenId )
  const imageURI = getImageUrl( tokenId )
//   const imageURI = `img/${tokenId}.png`;

  const [isMinted, setIsMinted] = useState(false);
  useEffect(() => {

    setupContractInstance()
      .then(() => {
        getMintedStatus()
      })

  }, [isMinted]);

  const getMintedStatus = async () => {
    // console.log('metadataURI', tokenId, metadataURI)
    
    const result = await contract.isContentOwned(metadataURI).catch(console.error)
    // console.log('isContentOwned', result)
    setIsMinted(result);
  };

  const mintToken = async () => {
    const connection = contract.connect(signer);
    const addr = connection.address;
    const result = await contract.payToMint(addr, metadataURI, {
      value: ethers.utils.parseEther('0.005'),
    });

    await result.wait();
    getMintedStatus();
    getCount();
  };

  async function getURI() {
    const uri = await contract.tokenURI(tokenId);
    alert(uri);
  }
  return (
    <div className="card" style={{ width: '18rem' }}>
      <img className="card-img-top" src={imageURI}></img>
      <div className="card-body">
        <h5 className="card-title">ID #{tokenId}</h5>
        {!isMinted ? (
          <button className="btn btn-primary" onClick={mintToken}>
            Mint
          </button>
        ) : (
          <button className="btn btn-secondary" onClick={getURI}>
            Taken! Show URI
          </button>
        )}
      </div>
    </div>
  );
}

export default Home;

const { expect } = require("chai");
const { ethers } = require("hardhat");

// import { expect } from 'chai'
// import { ethers } from 'hardhat'

describe("MyNFT", function () {
  it("Should mint and transfer an NFT to someone", async function () {
    // const { getMetaDataUrl } = await import('../src/helpers/urls.js')

    const FiredGuys = await ethers.getContractFactory("FiredGuys");
    const firedguys = await FiredGuys.deploy();
    await firedguys.deployed()

    const recipient = '0x8626f6940e2eb28930efb4cef49b2d1f2c9c1199'
    const metadataURI = `nft-media/${ recipient }.json`//getMetaDataUrl( recipient )

    let balance = await firedguys.balanceOf(recipient);
    expect(balance).to.equal(0);

    const newlyMintedToken = await firedguys.payToMint(recipient, metadataURI, { value: ethers.utils.parseEther('0.005') });

    // wait until the transaction is mined
    await newlyMintedToken.wait();

    balance = await firedguys.balanceOf(recipient)
    expect(balance).to.equal(1);

    expect(await firedguys.isContentOwned(metadataURI)).to.equal(true);
    const newlyMintedToken2 = await firedguys.payToMint(recipient, 'foo', { value: ethers.utils.parseEther('0.005') });
  });
});

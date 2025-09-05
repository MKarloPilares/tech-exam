import { expect } from "chai";
import { ethers, ignition } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import TestNFTModule from "../ignition/modules/TestNFT";
import { TestNFT } from "../typechain-types";

describe("TestNFT", function () {
  async function deployTestNFTFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const { testNFT } = await ignition.deploy(TestNFTModule);
    
    const typedTestNFT = await ethers.getContractAt("TestNFT", testNFT.target);
    
    return { testNFT: typedTestNFT, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { testNFT } = await loadFixture(deployTestNFTFixture);
      
      expect(await testNFT.name()).to.equal("TestNFT");
      expect(await testNFT.symbol()).to.equal("TNFT");
    });

    it("Should set the right owner", async function () {
      const { testNFT, owner } = await loadFixture(deployTestNFTFixture);
      
      expect(await testNFT.owner()).to.equal(owner.address);
    });

    it("Should start with zero total supply", async function () {
      const { testNFT } = await loadFixture(deployTestNFTFixture);
      
      expect(await testNFT.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint NFT to specified address", async function () {
      const { testNFT, owner, addr1 } = await loadFixture(deployTestNFTFixture);
      
      await testNFT.mint(addr1.address);
      
      expect(await testNFT.balanceOf(addr1.address)).to.equal(1);
      expect(await testNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await testNFT.totalSupply()).to.equal(1);
    });

    it("Should increment token IDs correctly", async function () {
      const { testNFT, owner, addr1, addr2 } = await loadFixture(deployTestNFTFixture);
      
      await testNFT.mint(addr1.address);
      await testNFT.mint(addr2.address);
      
      expect(await testNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await testNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await testNFT.totalSupply()).to.equal(2);
    });

    it("Should only allow owner to mint", async function () {
      const { testNFT, addr1, addr2 } = await loadFixture(deployTestNFTFixture);
      
      await expect(
        testNFT.connect(addr1).mint(addr2.address)
      ).to.be.revertedWithCustomError(testNFT, "OwnableUnauthorizedAccount");
    });

    it("Should emit Transfer event on mint", async function () {
      const { testNFT, owner, addr1 } = await loadFixture(deployTestNFTFixture);
      
      await expect(testNFT.mint(addr1.address))
        .to.emit(testNFT, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, 0);
    });
  });

  describe("Total Supply", function () {
    it("Should track total supply correctly", async function () {
      const { testNFT, addr1, addr2 } = await loadFixture(deployTestNFTFixture);
      
      expect(await testNFT.totalSupply()).to.equal(0);
      
      await testNFT.mint(addr1.address);
      expect(await testNFT.totalSupply()).to.equal(1);
      
      await testNFT.mint(addr2.address);
      expect(await testNFT.totalSupply()).to.equal(2);
    });
  });
});
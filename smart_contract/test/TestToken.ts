import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import TestTokenModule from "../ignition/modules/TestToken";
import { TestToken } from "../typechain-types";

describe("TestToken", function () {
  async function deployTestTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const { testToken } = await hre.ignition.deploy(TestTokenModule);
    const typedTestToken = await ethers.getContractAt("TestToken", await testToken.getAddress()) as TestToken;  

    await typedTestToken.mint(owner.address, ethers.parseEther("1000"));

    return { testToken: typedTestToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { testToken } = await loadFixture(deployTestTokenFixture);
      
      expect(await testToken.name()).to.equal("TestToken");
      expect(await testToken.symbol()).to.equal("TTK");
    });

    it("Should have 18 decimals", async function () {
      const { testToken } = await loadFixture(deployTestTokenFixture);
      
      expect(await testToken.decimals()).to.equal(18);
    });

    it("Should start with zero total supply before minting", async function () {
      const [owner] = await ethers.getSigners();
      const { testToken } = await hre.ignition.deploy(TestTokenModule);
      const typedTestToken = await ethers.getContractAt("TestToken", await testToken.getAddress()) as TestToken;
      
      expect(await typedTestToken.totalSupply()).to.equal(0);
    });
  });

  describe("Minting", function () {
    it("Should mint tokens to specified address", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const { testToken } = await hre.ignition.deploy(TestTokenModule);
      const typedTestToken = await ethers.getContractAt("TestToken", await testToken.getAddress()) as TestToken;
      
      const mintAmount = ethers.parseEther("100");
      await typedTestToken.mint(addr1.address, mintAmount);
      
      expect(await typedTestToken.balanceOf(addr1.address)).to.equal(mintAmount);
      expect(await typedTestToken.totalSupply()).to.equal(mintAmount);
    });

    it("Should emit Transfer event when minting", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const { testToken } = await hre.ignition.deploy(TestTokenModule);
      const typedTestToken = await ethers.getContractAt("TestToken", await testToken.getAddress()) as TestToken;
      
      const mintAmount = ethers.parseEther("100");
      
      await expect(typedTestToken.mint(addr1.address, mintAmount))
        .to.emit(typedTestToken, "Transfer")
        .withArgs(ethers.ZeroAddress, addr1.address, mintAmount);
    });

    it("Should allow anyone to mint (no access control)", async function () {
      const [owner, addr1] = await ethers.getSigners();
      const { testToken } = await hre.ignition.deploy(TestTokenModule);
      const typedTestToken = await ethers.getContractAt("TestToken", await testToken.getAddress()) as TestToken;
      
      const mintAmount = ethers.parseEther("100");
      
      await expect(typedTestToken.connect(addr1).mint(addr1.address, mintAmount))
        .to.not.be.reverted;
      
      expect(await typedTestToken.balanceOf(addr1.address)).to.equal(mintAmount);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { testToken, owner, addr1 } = await loadFixture(deployTestTokenFixture);
      
      const transferAmount = ethers.parseEther("50");
      await expect(testToken.transfer(addr1.address, transferAmount))
        .to.changeTokenBalances(testToken, [owner, addr1], [-transferAmount, transferAmount]);
    });

    it("Should emit Transfer events", async function () {
      const { testToken, owner, addr1 } = await loadFixture(deployTestTokenFixture);
      
      const transferAmount = ethers.parseEther("50");
      await expect(testToken.transfer(addr1.address, transferAmount))
        .to.emit(testToken, "Transfer")
        .withArgs(owner.address, addr1.address, transferAmount);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { testToken, addr1, addr2 } = await loadFixture(deployTestTokenFixture);
      
      await expect(
        testToken.connect(addr1).transfer(addr2.address, ethers.parseEther("1"))
      ).to.be.revertedWithCustomError(testToken, "ERC20InsufficientBalance");
    });
  });

  describe("Allowances", function () {
    it("Should approve and allow transfers via transferFrom", async function () {
      const { testToken, owner, addr1, addr2 } = await loadFixture(deployTestTokenFixture);
      
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");
      
      await testToken.approve(addr1.address, approveAmount);
      await expect(
        testToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      ).to.changeTokenBalances(testToken, [owner, addr2], [-transferAmount, transferAmount]);
    });

    it("Should emit Approval events", async function () {
      const { testToken, owner, addr1 } = await loadFixture(deployTestTokenFixture);
      
      const approveAmount = ethers.parseEther("100");
      await expect(testToken.approve(addr1.address, approveAmount))
        .to.emit(testToken, "Approval")
        .withArgs(owner.address, addr1.address, approveAmount);
    });

    it("Should update allowances after transferFrom", async function () {
      const { testToken, owner, addr1, addr2 } = await loadFixture(deployTestTokenFixture);
      
      const approveAmount = ethers.parseEther("100");
      const transferAmount = ethers.parseEther("50");
      
      await testToken.approve(addr1.address, approveAmount);
      await testToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount);
      
      expect(await testToken.allowance(owner.address, addr1.address))
        .to.equal(approveAmount - transferAmount);
    });

    it("Should fail transferFrom if allowance is insufficient", async function () {
      const { testToken, owner, addr1, addr2 } = await loadFixture(deployTestTokenFixture);
      
      const approveAmount = ethers.parseEther("50");
      const transferAmount = ethers.parseEther("100");
      
      await testToken.approve(addr1.address, approveAmount);
      
      await expect(
        testToken.connect(addr1).transferFrom(owner.address, addr2.address, transferAmount)
      ).to.be.revertedWithCustomError(testToken, "ERC20InsufficientAllowance");
    });
  });
});
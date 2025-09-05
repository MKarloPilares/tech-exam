import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import TestTokenModule from "../ignition/modules/TestToken";
import { TestToken } from "../typechain-types";

describe("TestToken", function () {
  async function deployTestTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();
    
    const { testToken } = await hre.ignition.deploy(TestTokenModule, {
      parameters: {
        TestTokenModule: {
          InitialSupply: 1000000
        }
      }
    });

      const typedTestToken = await ethers.getContractAt("TestToken", await testToken.getAddress()) as TestToken;  

      return { testToken: typedTestToken, owner, addr1, addr2 };
  }

  describe("Deployment", function () {
    it("Should set the right name and symbol", async function () {
      const { testToken } = await loadFixture(deployTestTokenFixture);
      
      expect(await testToken.name()).to.equal("TestToken");
      expect(await testToken.symbol()).to.equal("TTK");
    });

    it("Should set the right total supply", async function () {
      const { testToken } = await loadFixture(deployTestTokenFixture);
      
      expect(await testToken.totalSupply()).to.equal(1000000);
    });

    it("Should assign the total supply to the deployer", async function () {
      const { testToken, owner } = await loadFixture(deployTestTokenFixture);
      
      const ownerBalance = await testToken.balanceOf(owner.address);
      expect(await testToken.totalSupply()).to.equal(ownerBalance);
    });

    it("Should have 18 decimals", async function () {
      const { testToken } = await loadFixture(deployTestTokenFixture);
      
      expect(await testToken.decimals()).to.equal(18);
    });
  });

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function () {
      const { testToken, owner, addr1 } = await loadFixture(deployTestTokenFixture);
      
      await expect(testToken.transfer(addr1.address, 50))
        .to.changeTokenBalances(testToken, [owner, addr1], [-50, 50]);
    });

    it("Should emit Transfer events", async function () {
      const { testToken, owner, addr1 } = await loadFixture(deployTestTokenFixture);
      
      await expect(testToken.transfer(addr1.address, 50))
        .to.emit(testToken, "Transfer")
        .withArgs(owner.address, addr1.address, 50);
    });

    it("Should fail if sender doesn't have enough tokens", async function () {
      const { testToken, addr1, addr2 } = await loadFixture(deployTestTokenFixture);
      
      await expect(
        testToken.connect(addr1).transfer(addr2.address, 1)
      ).to.be.revertedWithCustomError(testToken, "ERC20InsufficientBalance");
    });
  });

  describe("Allowances", function () {
    it("Should approve and allow transfers via transferFrom", async function () {
      const { testToken, owner, addr1, addr2 } = await loadFixture(deployTestTokenFixture);
      
      await testToken.approve(addr1.address, 100);
      await expect(
        testToken.connect(addr1).transferFrom(owner.address, addr2.address, 50)
      ).to.changeTokenBalances(testToken, [owner, addr2], [-50, 50]);
    });

    it("Should emit Approval events", async function () {
      const { testToken, owner, addr1 } = await loadFixture(deployTestTokenFixture);
      
      await expect(testToken.approve(addr1.address, 100))
        .to.emit(testToken, "Approval")
        .withArgs(owner.address, addr1.address, 100);
    });

    it("Should update allowances after transferFrom", async function () {
      const { testToken, owner, addr1, addr2 } = await loadFixture(deployTestTokenFixture);
      
      await testToken.approve(addr1.address, 100);
      await testToken.connect(addr1).transferFrom(owner.address, addr2.address, 50);
      
      expect(await testToken.allowance(owner.address, addr1.address)).to.equal(50);
    });

    it("Should fail transferFrom if allowance is insufficient", async function () {
      const { testToken, owner, addr1, addr2 } = await loadFixture(deployTestTokenFixture);
      
      await testToken.approve(addr1.address, 50);
      
      await expect(
        testToken.connect(addr1).transferFrom(owner.address, addr2.address, 100)
      ).to.be.revertedWithCustomError(testToken, "ERC20InsufficientAllowance");
    });
  })
});
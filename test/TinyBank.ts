import hre from "hardhat";
import { expect } from "chai";
import { DECIMALS, MINTING_AMOUNT } from "./constant";
import { IMyToken__factory, MyToken, TinyBank } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("TinyBank", () => {
  let signers: HardhatEthersSigner[];
  let myTokenC: MyToken;
  let tinyBankC: TinyBank;
  beforeEach(async () => {
    signers = await hre.ethers.getSigners();
    myTokenC = await hre.ethers.deployContract("MyToken", [
      "MyToken",
      "MT",
      DECIMALS,
      MINTING_AMOUNT,
    ]);
    tinyBankC = await hre.ethers.deployContract("TinyBank", [
      await myTokenC.getAddress(),
    ]);

    await myTokenC.setManager(tinyBankC.getAddress());
    await tinyBankC.registerManagers([
      signers[0].address,
      signers[1].address,
      signers[2].address,
    ]);
  });

  describe("Initialized state check", () => {
    it("should return totalStaked 0", async () => {
      expect(await tinyBankC.totalStaked()).equal(0);
    });
    it("should return staked 0 amount of signer0", async () => {
      const signer0 = signers[0];
      expect(await tinyBankC.staked(signer0.address)).equal(0);
    });
  });

  describe("Staking", async () => {
    it("should return staked amount", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);
      expect(await tinyBankC.staked(signer0.address)).equal(stakingAmount);
      expect(await myTokenC.balance0f(tinyBankC)).equal(
        await tinyBankC.totalStaked(),
      );
    });
  });
  describe("Withdraw", () => {
    it("should return 0 staked after withdrawing total token", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);
      await tinyBankC.withdraw(stakingAmount);
      expect(await tinyBankC.staked(signer0.address)).equal(0);
    });
  });

  describe("reward", () => {
    it("should reward 1MT every blocks", async () => {
      const signer0 = signers[0];
      const stakingAmount = hre.ethers.parseUnits("50", DECIMALS);
      await myTokenC.approve(await tinyBankC.getAddress(), stakingAmount);
      await tinyBankC.stake(stakingAmount);

      const BLOCKS = 5n;
      const transferAmount = hre.ethers.parseUnits("1", DECIMALS);
      for (var i = 0; i < BLOCKS; i++) {
        await myTokenC.transfer(transferAmount, signer0.address);
      }

      await tinyBankC.withdraw(stakingAmount);
      expect(await myTokenC.balance0f(signer0.address)).equal(
        hre.ethers.parseUnits((BLOCKS + MINTING_AMOUNT + 1n).toString()),
      );
    });

    it("Should revert when changing rewardPerBlock by hacker", async () => {
      const hacker = signers[3];
      const rewardToChange = hre.ethers.parseUnits("10000", DECIMALS);
      await expect(
        tinyBankC.connect(hacker).setRewardPerBlock(rewardToChange),
      ).to.be.revertedWith("You are not a manager");
    });
  });
  describe("Multi Manager", () => {
    it("should register three managers", async () => {
      for (let i = 0; i < 3; i++) {
        expect(await tinyBankC.isManager(signers[i].address)).to.equal(true);
        expect(await tinyBankC.managers(i)).to.equal(signers[i].address);
      }

      expect(await tinyBankC.isManager(signers[3].address)).to.equal(false);
    });

    it("should reject confirmation from a non-manager", async () => {
      const amount = hre.ethers.parseUnits("2", DECIMALS);

      await expect(
        tinyBankC.connect(signers[3]).confirmRewardPerBlock(amount),
      ).to.be.revertedWith("You are not a manager");
    });

    it("should revert when only two managers have confirmed", async () => {
      const amount = hre.ethers.parseUnits("2", DECIMALS);

      await tinyBankC.connect(signers[0]).confirmRewardPerBlock(amount);
      await tinyBankC.connect(signers[1]).confirmRewardPerBlock(amount);

      await expect(
        tinyBankC.connect(signers[0]).setRewardPerBlock(amount),
      ).to.be.revertedWith("Not all confirmed yet");
    });

    it("should change reward after all managers confirm", async () => {
      const amount = hre.ethers.parseUnits("2", DECIMALS);

      for (let i = 0; i < 3; i++) {
        await tinyBankC.connect(signers[i]).confirmRewardPerBlock(amount);
      }

      await tinyBankC.connect(signers[0]).setRewardPerBlock(amount);

      expect(await tinyBankC.rewardPerBlock()).to.equal(amount);
    });

    it("should not count repeated confirmations as multiple managers", async () => {
      const amount = hre.ethers.parseUnits("2", DECIMALS);

      for (let i = 0; i < 3; i++) {
        await tinyBankC.connect(signers[0]).confirmRewardPerBlock(amount);
      }

      await expect(
        tinyBankC.connect(signers[0]).setRewardPerBlock(amount),
      ).to.be.revertedWith("Not all confirmed yet");
    });

    it("should reject an amount different from the confirmed amount", async () => {
      const amount = hre.ethers.parseUnits("2", DECIMALS);
      const otherAmount = hre.ethers.parseUnits("10", DECIMALS);

      for (let i = 0; i < 3; i++) {
        await tinyBankC.connect(signers[i]).confirmRewardPerBlock(amount);
      }

      await expect(
        tinyBankC.connect(signers[0]).setRewardPerBlock(otherAmount),
      ).to.be.revertedWith("Not all confirmed yet");
    });

    it("should require new confirmations after a successful change", async () => {
      const amount = hre.ethers.parseUnits("2", DECIMALS);

      for (let i = 0; i < 3; i++) {
        await tinyBankC.connect(signers[i]).confirmRewardPerBlock(amount);
      }

      await tinyBankC.connect(signers[0]).setRewardPerBlock(amount);

      await expect(
        tinyBankC.connect(signers[0]).setRewardPerBlock(amount),
      ).to.be.revertedWith("Not all confirmed yet");
    });
  });
});

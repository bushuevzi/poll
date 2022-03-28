import { expect, assert } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Poll contract deploy", function(){
    let _owner: Signer;
    let _member1: Signer;
    let _contract: Contract;

    beforeEach(async function () {
        [_owner, _member1] = await ethers.getSigners();
        const Poll = await ethers.getContractFactory("Poll", _owner);
        _contract = await Poll.deploy();
        await _contract.deployed();
    })

    it("should have valid address", async () => {
        expect(_contract.address).to.be.properAddress;
    })

    it("should have 0 ether by default", async () => {
        const balance = await _contract.provider.getBalance(_contract.address);
        expect(balance).to.eq(0);
    })

    it("shoud allow delete contract for owner", async () => {
        const votingInOldPollTrx = _contract.connect(_owner).kill();
        assert.isOk(await votingInOldPollTrx);;
    })

    it("shoud reject delete contract for non owner", async () => {
        const votingInOldPollTrx = _contract.connect(_member1).kill();
        await expect(votingInOldPollTrx).to.be.revertedWith("Only the owner can kill this contract");
    })
})
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Poll contract deploy", function(){
    let owner: Signer;
    let poll: Contract;

    beforeEach(async function () {
        [owner] = await ethers.getSigners();
        const Poll = await ethers.getContractFactory("Poll", owner);
        poll = await Poll.deploy();
        await poll.deployed();
    })

    it("should have valid address", async () => {
        expect(poll.address).to.be.properAddress;
    })

    it("should have 0 ether by default", async () => {
        const balance = await poll.provider.getBalance(poll.address);
        expect(balance).to.eq(0);
    })
})
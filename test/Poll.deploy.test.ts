import { expect, assert } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Poll contract deploy", function(){
    let owner: Signer;
    let member1: Signer;
    let member2: Signer;
    let member3: Signer;
    let member4: Signer;
    let member5: Signer;
    let poll: Contract;

    beforeEach(async function () {
        [owner, member1, member2, member3, member4, member5] = await ethers.getSigners();
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

function getCurrentTime(): number {
    return Math.floor(new Date().getTime() / 1000) 
}
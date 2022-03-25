import { expect, assert } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Poll creation", function(){
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

    it("shoud be posible create new poll", async () => {
        const pollName = "First Poll";
        const startTime = getCurrentTime();        
        await poll.connect(owner).createPoll(pollName, startTime);

        const pollsNames = await poll.connect(owner).getPolls();
        await expect(pollsNames[0]).to.eq(pollName);
    })

    it("shoud have poll creation time greate then 0", async () => {
        const pollName = "First Poll";
        const startTime = getCurrentTime();
        await poll.connect(owner).createPoll(pollName, startTime);

        const createdPoll = await poll.connect(owner).getPoll(pollName);
        await expect(createdPoll.startTime).to.eq(startTime);
    })

    it("shoud have be able to store several contracts", async () => {
        assert.fail("Not implemented");
    })

    it("shoud have empty list of members on creation", async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject duplicate creation", async () => {
        assert.fail("Not implemented");
    })
})

function getCurrentTime(): number {
    return Math.floor(new Date().getTime() / 1000) 
}
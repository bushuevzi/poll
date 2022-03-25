import { expect, assert } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Poll voting process", function(){
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

    it("shoud be many members in poll", async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject wrong value of payment for voting", async () => {
        assert.fail("Not implemented");
    })

    it("shoud store votes from several members", async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject double voting", async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject voting in finishing poll", async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject voting in expired poll", async () => {
        assert.fail("Not implemented");
    })

    it("shoud allow finishing poll",async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject stop voting to non poll member", async () => {
        assert.fail("Not implemented");
    })

    it("shoud pay prize to correct member-winner", async () => {
        assert.fail("Not implemented");
    })

    it("shoud pay correct prize amount", async () => {
        assert.fail("Not implemented");
    })

    it("shoud calculate and store poll comission", async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject widthdraw comission to non owner", async () => {
        assert.fail("Not implemented");
    })

    it("shoud widthdraw comission to owner", async () => {
        assert.fail("Not implemented");
    })

})

function getCurrentTime(): number {
    return Math.floor(new Date().getTime() / 1000) 
}
import { expect, assert } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Poll widsdraw process", function(){
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

    it("shoud calculate and store poll comission", async () => {
        assert.fail("Not implemented");
    })

    it("shoud have correct comission value", async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject widthdraw comission to non owner", async () => {
        assert.fail("Not implemented");
    })

    it("shoud widthdraw comission to owner", async () => {
        assert.fail("Not implemented");
    })

    it("shoud reject duplicating widthdraw", async () => {
        assert.fail("Not implemented");
    })

    it("shoud widthdraw correct comission from contract balance", async () => {
        assert.fail("Not implemented");
    })
})
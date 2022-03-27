import { expect, assert } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Poll creation", function(){
    let _owner: Signer;
    let _poll: Contract;

    beforeEach(async function () {
        [_owner] = await ethers.getSigners();
        const Poll = await ethers.getContractFactory("Poll", _owner);
        _poll = await Poll.deploy();
        await _poll.deployed();
    })

    it("shoud be posible create new poll", async () => {
        const pollName = "First Poll";
        const startTime = getCurrentTime();        
        await _poll.connect(_owner).createPoll(pollName, startTime);

        const pollsNames = await _poll.connect(_owner).getPolls();
        await expect(pollsNames[0]).to.eq(pollName);
    })

    it("shoud have be able to store several polls", async () => {
        const firstPollName = "First Poll";
        const firstStartTime = getCurrentTime();
        await _poll.connect(_owner).createPoll(firstPollName, firstStartTime);

        const secondPollName = "Second Poll";
        const secondStartTime = getCurrentTime();
        await _poll.connect(_owner).createPoll(secondPollName, secondStartTime);

        const thirdPollName = "Third Poll";
        const thirdStartTime = getCurrentTime();
        await _poll.connect(_owner).createPoll(thirdPollName, thirdStartTime); 
        
        const pollsNames = await _poll.connect(_owner).getPolls();        
        await expect(pollsNames.length).to.eq(3)
    })

    it("shoud have poll creation time greate then 0", async () => {
        const pollName = "First Poll";
        const startTime = getCurrentTime();
        await _poll.connect(_owner).createPoll(pollName, startTime);

        const createdPoll = await _poll.connect(_owner).getPoll(pollName);
        await expect(createdPoll.startTime).to.eq(startTime);
    })  

    it("shoud have empty list of members on creation", async () => {
        const pollName = "First Poll";
        const startTime = getCurrentTime();
        await _poll.connect(_owner).createPoll(pollName, startTime);

        const createdPoll = await _poll.connect(_owner).getPoll(pollName);
        await assert.isEmpty(createdPoll.membersLUT);
    })

    it("shoud reject duplicate creation", async () => {
        const pollName = "First Poll";
        const startTime = getCurrentTime();
        await _poll.connect(_owner).createPoll(pollName, startTime);

        const duplicatePollTransaction = _poll.connect(_owner).createPoll(pollName, startTime);
        await expect(duplicatePollTransaction).to.be.revertedWith("Poll exists");
    })
})

function getCurrentTime(): number {
    return Math.floor(new Date().getTime() / 1000) 
}
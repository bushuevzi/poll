import { expect, assert } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";

describe("Poll creation", function(){
    let _owner: Signer;
    let _member1: Signer;
    let _member2: Signer;
    let _member3: Signer;
    let _contract: Contract;

    beforeEach(async function () {
        [_owner, _member1, _member2, _member3] = await ethers.getSigners();
        const Poll = await ethers.getContractFactory("Poll", _owner);
        _contract = await Poll.deploy();
        await _contract.deployed();
    })

    it("shoud be posible create new poll", async () => {
        const pollName = await registerPoll();

        const pollsNames = await _contract.connect(_owner).getPolls();
        await expect(pollsNames[0]).to.eq(pollName);
    })

    it("shoud have be able to store several polls", async () => {
        const firstPollName = "First Poll";
        const firstStartTime = getCurrentTime();
        await _contract.connect(_owner).createPoll(firstPollName, firstStartTime, [await _member1.getAddress(), await _member2.getAddress()]);

        const secondPollName = "Second Poll";
        const secondStartTime = getCurrentTime();
        await _contract.connect(_owner).createPoll(secondPollName, secondStartTime, [await _member2.getAddress(), await _member3.getAddress()]);

        const thirdPollName = "Third Poll";
        const thirdStartTime = getCurrentTime();
        await _contract.connect(_owner).createPoll(thirdPollName, thirdStartTime, [await _member1.getAddress(), await _member3.getAddress()]); 
        
        const pollsNames = await _contract.connect(_owner).getPolls();        
        expect(pollsNames.length).to.eq(3)
    })

    it("shoud have poll creation time greate then 0", async () => {
        const pollName = "First Poll";
        const startTime = getCurrentTime();
        await registerPoll(pollName, startTime);

        const createdPoll = await _contract.connect(_owner).getPoll(pollName);
        expect(createdPoll.startTime).to.eq(startTime);
    })  

    it("shoud have empty list of electors on creation", async () => {
        const pollName = await registerPoll();

        const createdPoll = await _contract.connect(_owner).getPoll(pollName);
        assert.isEmpty(createdPoll.electorsLUT);
    })

    it("shoud reject creation for non owner", async () => {
        const createPollTrx = _contract.connect(_member1).createPoll("New Poll", getCurrentTime(), [await _member1.getAddress()]);
        await expect(createPollTrx).to.be.revertedWith("You should be contract owner");
    })

    it("shoud reject creation if candidates list empty", async () => {
        const createPollTrx = _contract.connect(_owner).createPoll("New Poll", getCurrentTime(), []);
        await expect(createPollTrx).to.be.revertedWith("Candidates list empty");
    })

    it("shoud reject duplicate creation", async () => {
        await registerPoll();

        const duplicatePollTrx = registerPoll();
        await expect(duplicatePollTrx).to.be.revertedWith("Poll exists");
    })

    it("shoud be many candidates in poll", async () => {
        const pollName = await registerPoll();
        const firstPoll = await _contract.connect(_owner).getPoll(pollName);
        expect(firstPoll.candidatesLUT.length).to.eq(3);
    })

    async function registerPoll(pollName: string = "First Poll", startTime: number = 0, candidates:string[] = []) {
        startTime = startTime == 0 ? getCurrentTime() : startTime;
        candidates = candidates.length == 0 
                ? [await _member1.getAddress(), await _member2.getAddress(), await _member3.getAddress()] 
                : candidates;
        await _contract.connect(_owner).createPoll(pollName, startTime, candidates);

        return pollName;
    }
})



function getCurrentTime(): number {
    return Math.floor(new Date().getTime() / 1000) 
}
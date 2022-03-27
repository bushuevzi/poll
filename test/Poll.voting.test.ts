import { expect } from "chai";
import { Contract, Signer, BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("Poll voting process", function(){
    let _owner: Signer;
    let _member1: Signer;
    let _member2: Signer;
    let _pollContract: Contract;
    let _voteCost: BigNumber;
    let _pollName: string = "First Poll";

    beforeEach(async function () {
        await publishContract();
        const nowTimeStamp = getCurrentTime();
        await registerPoll(_pollName, nowTimeStamp);
        _voteCost = getEtherVal("0.01", 18);
    })

    it("shoud be many members in poll", async () => {
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });

        const firstPoll = await _pollContract.connect(_owner).getPoll(_pollName);
        await expect(firstPoll.membersLUT.length).to.eq(2);
    })

    it("shoud correct payment for voting", async () => {
        const votingTrx = _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });

        await expect(() => votingTrx).to.changeEtherBalances([_member1, _pollContract], [(-(10**16)).toString(), (10**16).toString()]);
    })

    it("shoud reject wrong value of payment for voting", async () => {
        const wrongCost = getEtherVal("0.002", 18)
        const voteTrx = _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: wrongCost });

        await expect(voteTrx).to.be.revertedWith("You need to send 0.01 Ether");
    })

    it("shoud correct sum of votes", async () => {
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });

        const member1Votes = await _pollContract.connect(_owner).getMemberVotes(_pollName, _member1.getAddress());
        const member2Votes = await _pollContract.connect(_owner).getMemberVotes(_pollName, _member2.getAddress());
        
        expect(member1Votes).to.eq(2);
        expect(member2Votes).to.eq(0);
    })

    it("shoud reject double voting", async () => {
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        const duplicateVotingTrx = _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });

        await expect(duplicateVotingTrx).to.be.revertedWith("You alrady voted");
    })

    it("shoud reject voting for not existed candidat", async () => {
        const votingForNotRegisteredCandidateTrx = _pollContract.connect(_member1).vote(_pollName, _member2.getAddress(), { value: _voteCost });

        await expect(votingForNotRegisteredCandidateTrx).to.be.revertedWith("Favorite candidate is not a poll member");
    })

    it("shoud reject voting in not existed poll", async () => {
        const votingInNotExsitingPollTrx = _pollContract.connect(_member1).vote("Wrong poll Name", _member2.getAddress(), { value: _voteCost });

        await expect(votingInNotExsitingPollTrx).to.be.revertedWith("Poll not found");
    })

    it("shoud reject voting in expired poll", async () => {
        const oldPollName = "Old poll";
        const oldStartDay = getCurrentTime() - 3*24*60*60;
        await registerPoll(oldPollName, oldStartDay);
        const votingInOldPoll = _pollContract.connect(_member2).vote(oldPollName, _member1.getAddress(), { value: _voteCost });

        await expect(votingInOldPoll).to.be.revertedWith("Poll is expired");
    })

    it("shoud show poll candidates from view-function", async () => {
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        
        const pollMembers = await _pollContract.connect(_member1).getPollMembers(_pollName);

        expect(pollMembers.length).to.eq(2);
        expect(pollMembers).to.include(await _member1.getAddress());
        expect(pollMembers).to.include(await _member2.getAddress());
    })

    function getEtherVal(input: string, decimals: number) {
        return ethers.utils.parseUnits(input, decimals);
    }
    
    async function registerPoll(pollName:string, startTime: number) {
        await _pollContract.connect(_owner).createPoll(pollName, startTime);
    }
    
    async function publishContract() {
        [_owner, _member1, _member2] = await ethers.getSigners();
        const Poll = await ethers.getContractFactory("Poll", _owner);
        _pollContract = await Poll.deploy();
        await _pollContract.deployed();
    }
    
    function getCurrentTime(): number {
        return Math.floor(new Date().getTime() / 1000) 
    }
})



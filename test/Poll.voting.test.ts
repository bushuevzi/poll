import { expect } from "chai";
import { Contract, Signer, BigNumber } from "ethers";
import { ethers } from "hardhat";

describe("Poll voting process", function(){
    let _owner: Signer;
    let _member1: Signer;
    let _member2: Signer;
    let _member3: Signer;
    let _member4: Signer;
    let _contract: Contract;
    let _voteCost: BigNumber;
    let _pollName: string = "First Poll";

    beforeEach(async function () {
        await publishContract();
        await registerPoll();
        _voteCost = getEtherVal("0.01", 18);
    })

    it("shoud correct payment for voting", async () => {
        const votingTrx = _contract.connect(_member1).vote(_pollName, await _member1.getAddress(), { value: _voteCost });

        await expect(() => votingTrx).to.changeEtherBalances([_member1, _contract], [(-(10**16)).toString(), (10**16).toString()]);
    })

    it("shoud reject wrong value of payment for voting", async () => {
        const wrongCost = getEtherVal("0.002", 18)
        const voteTrx = _contract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: wrongCost });

        await expect(voteTrx).to.be.revertedWith("You need to send 0.01 Ether");
    })

    it("shoud correct sum of votes", async () => {
        await _contract.connect(_member1).vote(_pollName, await _member1.getAddress(), { value: _voteCost });
        await _contract.connect(_member2).vote(_pollName, await _member1.getAddress(), { value: _voteCost });

        const member1Votes = await _contract.connect(_owner).getVotesForCandidate(_pollName, await _member1.getAddress());
        const member2Votes = await _contract.connect(_owner).getVotesForCandidate(_pollName, await _member2.getAddress());
        
        expect(member1Votes).to.eq(2);
        expect(member2Votes).to.eq(0);
    })

    it("shoud reject double voting", async () => {
        await _contract.connect(_member1).vote(_pollName, await _member1.getAddress(), { value: _voteCost });
        await _contract.connect(_member2).vote(_pollName, await _member1.getAddress(), { value: _voteCost });
        const duplicateVotingTrx = _contract.connect(_member2).vote(_pollName, await _member1.getAddress(), { value: _voteCost });

        await expect(duplicateVotingTrx).to.be.revertedWith("You alrady voted");
    })

    it("shoud reject voting for not existed candidat", async () => {
        const votingForNotRegisteredCandidateTrx = _contract.connect(_member1).vote(_pollName, await _member4.getAddress(), { value: _voteCost });

        await expect(votingForNotRegisteredCandidateTrx).to.be.revertedWith("Favorite candidate is not a poll member");
    })

    it("shoud reject voting in not existed poll", async () => {
        const votingInNotExsitingPollTrx = _contract.connect(_member1).vote("Wrong poll Name", await _member2.getAddress(), { value: _voteCost });

        await expect(votingInNotExsitingPollTrx).to.be.revertedWith("Poll not found");
    })

    it("shoud reject voting in expired poll", async () => {
        const oldPollName = "Old poll";
        const oldStartDay = getCurrentTime() - 3*24*60*60;
        await registerPoll(oldPollName, oldStartDay);

        const votingInOldPollTrx = _contract.connect(_member2).vote(oldPollName, await _member1.getAddress(), { value: _voteCost });
        await expect(votingInOldPollTrx).to.be.revertedWith("Poll is expired");
    })

    it("shoud show poll candidates from view-function", async () => {
        await _contract.connect(_member1).vote(_pollName, await _member1.getAddress(), { value: _voteCost });
        await _contract.connect(_member2).vote(_pollName, await _member1.getAddress(), { value: _voteCost });
        
        const pollCandidates = await _contract.connect(_member1).getPollCandidates(_pollName);

        expect(pollCandidates.length).to.eq(3);
        expect(pollCandidates).to.include(await _member1.getAddress());
        expect(pollCandidates).to.include(await _member2.getAddress());
    })

    it("shoud show poll electors from view-function", async () => {
        await _contract.connect(_member1).vote(_pollName, await _member1.getAddress(), { value: _voteCost });
        await _contract.connect(_member2).vote(_pollName, await _member1.getAddress(), { value: _voteCost });
        
        const pollElectors = await _contract.connect(_member1).getElectors(_pollName);

        expect(pollElectors.length).to.eq(2);
        expect(pollElectors).to.include(await _member1.getAddress());
        expect(pollElectors).to.include(await _member2.getAddress());
    })

    function getEtherVal(input: string, decimals: number) {
        return ethers.utils.parseUnits(input, decimals);
    }
    
    async function registerPoll(pollName: string = _pollName, startTime: number = 0, candidates:string[] = []) {
        startTime = startTime == 0 ? getCurrentTime() : startTime;
        candidates = candidates.length == 0 
                ? [await _member1.getAddress(), await _member2.getAddress(), await _member3.getAddress()] 
                : candidates;
        await _contract.connect(_owner).createPoll(pollName, startTime, candidates);

        return pollName;
    }
    
    async function publishContract() {
        [_owner, _member1, _member2, _member3, _member4] = await ethers.getSigners();
        const Poll = await ethers.getContractFactory("Poll", _owner);
        _contract = await Poll.deploy();
        await _contract.deployed();
    }
    
    function getCurrentTime(): number {
        return Math.floor(new Date().getTime() / 1000) 
    }
})



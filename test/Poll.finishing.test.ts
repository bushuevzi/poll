import { expect, assert } from "chai";
import { Contract, Signer, BigNumber } from "ethers";
import { ethers, network } from "hardhat";

describe("Poll finishing", function(){
    let _owner: Signer;
    let _member1: Signer;
    let _member2: Signer;
    let _member3: Signer;
    let _pollContract: Contract;
    let _voteCost: BigNumber = getEtherVal("0.01", 18);
    let _pollName: string = "First Poll";

    beforeEach(async () => {
        await publishContract();
    })

    afterEach(async () => {
        await _pollContract.kill({ from: _owner.getAddress() });
    });

    it("shoud allow finishing poll",async () => {
        await registerOldPoll(3);      
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await network.provider.send("evm_increaseTime", [3600])

        try{
            const finishingTrx = _pollContract.connect(_member1).finish(_pollName);
            assert.isOk(await finishingTrx);
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud reject for not exsiting poll", async () => {
        await registerOldPoll(5);
        const stopNotexistingPollTrx = _pollContract.connect(_member1).finish("Not Existing Poll");
        await expect(stopNotexistingPollTrx).to.be.revertedWith("Poll not found");
    })

    it("shoud reject untimely stop voting", async () => {
        await registerOldPoll(1)
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        const untimlyFinishingTrx = _pollContract.connect(_member1).finish(_pollName);
        await expect(untimlyFinishingTrx).to.be.revertedWith("Voting lasts less than 3 days");
    })

    it("shoud reject duplicating voting", async () => {
        await registerOldPoll(3);
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await network.provider.send("evm_increaseTime", [3600])
        try{
            await _pollContract.connect(_member1).finish(_pollName);
            const duplicateFinishingTrx = _pollContract.connect(_member1).finish(_pollName);
            await expect(duplicateFinishingTrx).to.be.revertedWith("Poll allrady finished");
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud pay prize to correct member-winner", async () => {
        await registerOldPoll(3);
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member3).vote(_pollName, _member2.getAddress(), { value: _voteCost });
        await network.provider.send("evm_increaseTime", [3600])
        try{
            await _pollContract.connect(_member3).finish(_pollName);
            const poll = await _pollContract.connect(_member3).getPoll(_pollName);
            expect(poll.winner).to.eq(await _member1.getAddress());
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud correct member-winner from view-function", async () => {
        await registerOldPoll(3);
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member3).vote(_pollName, _member2.getAddress(), { value: _voteCost });
        await network.provider.send("evm_increaseTime", [3600])
        try{
            await _pollContract.connect(_member3).finish(_pollName);
            const winner = await _pollContract.connect(_member3).getWinner(_pollName);
            expect(winner).to.eq(await _member1.getAddress());
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud have correct prize value", async () => {
        await registerOldPoll(3);
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member3).vote(_pollName, _member2.getAddress(), { value: _voteCost });
        await network.provider.send("evm_increaseTime", [3600])

        try{
            await _pollContract.connect(_member3).finish(_pollName);
            const poll = await _pollContract.connect(_member3).getPoll(_pollName);
            const expectPrize = (0.027*10**18).toString(); // 3 votes of 0.01 Ether - 10% commission = 0.027 Ether
            expect(poll.prize).to.eq(expectPrize);
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud pay correct prize amount from contract balance", async () => {
        await registerOldPoll(3);
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member3).vote(_pollName, _member2.getAddress(), { value: _voteCost });
        await network.provider.send("evm_increaseTime", [3600])

        try{
            const finishTrx = _pollContract.connect(_member3).finish(_pollName);
            const expectPrize = 0.027*10**18; // 3 votes of 0.01 Ether - 10% commission = 0.027 Ether
            await expect(() => finishTrx).to.changeEtherBalances([_pollContract, _member1], [(-expectPrize).toString(), expectPrize.toString()]);
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud pay prize to member with max votes", async () => {
        await registerOldPoll(3);
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member3).vote(_pollName, _member2.getAddress(), { value: _voteCost });
        await network.provider.send("evm_increaseTime", [3600])
        try{
            await _pollContract.connect(_member3).finish(_pollName);
            const member1Votes: number = parseInt(await _pollContract.connect(_member1).getVotesForCandidate(_pollName,await _member1.getAddress()));
            const member2Votes: number = parseInt(await _pollContract.connect(_member2).getVotesForCandidate(_pollName,await _member2.getAddress()));
            const member3Votes: number = parseInt(await _pollContract.connect(_member3).getVotesForCandidate(_pollName,await _member3.getAddress()));
            
            expect(member1Votes).to.greaterThan(member2Votes);
            expect(member2Votes).to.greaterThan(member3Votes);
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })
    
    function getEtherVal(input: string, decimals: number) {
        return ethers.utils.parseUnits(input, decimals);
    }
   
    async function publishContract() {
        [_owner, _member1, _member2, _member3] = await ethers.getSigners();
        const Poll = await ethers.getContractFactory("Poll", _owner);
        _pollContract = await Poll.deploy();
        await _pollContract.deployed();
    }

    async function registerOldPoll(daysAgo: number) {
        const timeWithout1Hour = (daysAgo-1)*24*60*60 + 23*60*60;
        const oldTimeStamp = getCurrentTime() - timeWithout1Hour;
        const candidates = [await _member1.getAddress(), await _member2.getAddress(), await _member3.getAddress()];
        await _pollContract.connect(_owner).createPoll(_pollName, oldTimeStamp, candidates);
    }
    
    function getCurrentTime(): number {
        return Math.floor(new Date().getTime() / 1000) 
    }
})

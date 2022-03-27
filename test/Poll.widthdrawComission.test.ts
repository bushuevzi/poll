import { expect, assert } from "chai";
import { Contract, Signer, BigNumber } from "ethers";
import { ethers, network } from "hardhat";

describe("Poll widsdraw process", function(){
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

    it("shoud calculate and store poll comission", async () => {
        await registerOldPoll(3);
        await voting();
        await network.provider.send("evm_increaseTime", [3600])

        try{
            await _pollContract.connect(_member3).finish(_pollName);
            const poll = await _pollContract.connect(_member3).getPoll(_pollName);
            const expectedComission = (0.003*10**18).toString(); // 10% commission of 3 votes by 0.01 Ether = 0.003 Ether
            expect(poll.comission).to.eq(expectedComission);
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud reject widthdraw comission to non owner", async () => {
        await registerOldPoll(3);
        await voting();
        await network.provider.send("evm_increaseTime", [3600])

        try{
            await _pollContract.connect(_member3).finish(_pollName);
            const withdrawComissionTrx = _pollContract.connect(_member1).withdrawComission(_pollName);
            await expect(withdrawComissionTrx).to.be.revertedWith("You should be contract owner");
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud widthdraw comission to owner", async () => {
        await registerOldPoll(3);
        await voting();
        await network.provider.send("evm_increaseTime", [3600])

        try{
            await _pollContract.connect(_member3).finish(_pollName);
            const withdrawComissionTrx = _pollContract.connect(_owner).withdrawComission(_pollName);
            assert.isOk(await withdrawComissionTrx);
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud reject duplicating widthdraw", async () => {
        await registerOldPoll(3);
        await voting();
        await network.provider.send("evm_increaseTime", [3600])

        try{
            await _pollContract.connect(_member3).finish(_pollName);
            await _pollContract.connect(_owner).withdrawComission(_pollName);
            const duplicateWithdrawComissionTrx = _pollContract.connect(_owner).withdrawComission(_pollName);
            await expect(duplicateWithdrawComissionTrx).to.be.revertedWith("Comission was already widthdraw");
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    it("shoud widthdraw correct comission from contract balance", async () => {
        await registerOldPoll(3);
        await voting();
        await network.provider.send("evm_increaseTime", [3600]);

        try{
            await _pollContract.connect(_member3).finish(_pollName);
            const expectedComission = (0.003*10**18).toString(); // 10% commission of 3 votes by 0.01 Ether = 0.003 Ether
            const duplicateWithdrawComissionTrx = _pollContract.connect(_owner).withdrawComission(_pollName);
            await expect(() => duplicateWithdrawComissionTrx).to.changeEtherBalances([_pollContract, _owner], [(-expectedComission).toString(), expectedComission.toString()]);
        }
        finally{
            await network.provider.send("evm_increaseTime", [-3600])
        }
    })

    function getEtherVal(input: string, decimals: number) {
        return ethers.utils.parseUnits(input, decimals);
    }

    async function registerOldPoll(daysAgo: number) {
        const timeWithout1Hour = (daysAgo-1)*24*60*60 + 23*60*60;
        const oldTimeStamp = getCurrentTime() - timeWithout1Hour;
        await registerPoll(_pollName, oldTimeStamp);
    }
    
    async function registerPoll(pollName:string, startTime: number) {
        await _pollContract.connect(_owner).createPoll(pollName, startTime);
    }
    
    async function publishContract() {
        [_owner, _member1, _member2, _member3] = await ethers.getSigners();
        const Poll = await ethers.getContractFactory("Poll", _owner);
        _pollContract = await Poll.deploy();
        await _pollContract.deployed();
    }
    
    function getCurrentTime(): number {
        return Math.floor(new Date().getTime() / 1000) 
    }

    async function voting() {
        await _pollContract.connect(_member1).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member2).vote(_pollName, _member1.getAddress(), { value: _voteCost });
        await _pollContract.connect(_member3).vote(_pollName, _member2.getAddress(), { value: _voteCost });
    }
})
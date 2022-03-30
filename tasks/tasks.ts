import { Wallet } from "ethers";
import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import * as deployment from "../artifacts/contracts/Poll.sol/Poll.json"

export default function tasks() {
    const abi = deployment.abi;

    task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
        const accounts = await hre.ethers.getSigners();
    
        for (const account of accounts) {
        console.log(account.address);
        }
    });

    task("balance", "Prints an account's balance")
    .addParam("account", "The account's address")
    .setAction(async (taskArgs, hre) => {
        const account = hre.ethers.utils.getAddress(taskArgs.account);
        const balance = await hre.ethers.provider.getBalance(account);
    
        console.log(hre.ethers.utils.formatUnits(balance, "ether"), "ETH");
        console.log(hre.ethers.utils.formatUnits(balance, "wei"), "WEI")
    });

    task("createPoll", "Add Poll to contract")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("start", "Date Time then Poll will be started")
    .addParam("candidates", "Candidate's addresses (delimeter - comma, without witespaces)")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const startDate = Date.parse(taskArgs.start) / 1000;
        const account = getAccount(taskArgs.key, hre);
        let candidatesList: string[] = taskArgs.candidates.split(',');
        
        await contract.connect(account).createPoll(taskArgs.name, startDate, candidatesList);
    });

    task("getPolls", "View all polls names in contract")
    .addParam("contract", "Poll contract address")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        
        console.log(await contract.connect(account).getPolls());
    });

    task("getPoll", "View polls info")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        
        console.log(await contract.connect(account).getPoll(taskArgs.name));
    });

    task("vote", "Vote for candidate")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("candidate", "Address of favorit candidate")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        const voteCost = hre.ethers.utils.parseUnits("0.01", 18);
        
        await contract.connect(account).vote(taskArgs.name, taskArgs.candidate, { value: voteCost, gasLimit: 2100000 });
    });

    task("increasetime", "Increase/decrease hardhat env time")
    .addParam("time", "time in second (positive - go to future, negative - back in time)")
    .setAction(async (taskArgs, hre) => {
        await hre.network.provider.send("evm_increaseTime", [Number(taskArgs.time)])
    });

    task("finish", "Finish poll")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        
        await contract.connect(account).finish(taskArgs.name, { gasLimit: 2100000 });
    });

    task("withdrawComission", "Withdraw Comission")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        
        await contract.connect(account).withdrawComission(taskArgs.name, { gasLimit: 2100000 });
    });

    task("getPollCandidates", "View poll's candidates")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        
        console.log(await contract.connect(account).getPollCandidates(taskArgs.name));
    });

    task("getElectors", "View poll's electorate")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        
        console.log(await contract.connect(account).getElectors(taskArgs.name));
    });

    task("getWinner", "View poll's winner")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        
        console.log(await contract.connect(account).getWinner(taskArgs.name));
    });

    task("getVotesForCandidate", "View number of votes for candidate")
    .addParam("contract", "Poll contract address")
    .addParam("name", "Poll name")
    .addParam("candidate", "Address of candidate")
    .addParam("key", "Your account's private key")
    .setAction(async (taskArgs, hre) => {
        const contract = await hre.ethers.getContractAt(abi, taskArgs.contract);
        const account = getAccount(taskArgs.key, hre);
        
        console.log((await contract.connect(account).getVotesForCandidate(taskArgs.name, taskArgs.candidate)).toNumber());
    });

    function getAccount(privateKey: string, hre: HardhatRuntimeEnvironment): Wallet {
        const wallet = new hre.ethers.Wallet(privateKey);
        const account = wallet.connect(hre.ethers.provider);
        return account;
    }
}

  

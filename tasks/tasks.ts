import { task } from "hardhat/config";

export default function tasks() {
    // This is a sample Hardhat task. To learn how to create your own go to
    // https://hardhat.org/guides/create-task.html
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
    });

    task("createPoll", "Add Poll to contract")
    .addParam("address", "Poll contract address")
    .addParam("name", "Name of new poll")
    // .addParam("startTime", "Date Time then Poll will be started")
    // .addParam("candidates", "Candidate's addresses")
    .setAction(async (taskArgs, hre) => {
        const Contract = await hre.ethers.getContractFactory('Poll');
        const contract = await Contract.attach(taskArgs.address);
        // const startDate = Date.parse(taskArgs.startTime);
        // console.log(startDate);
        // console.log(taskArgs.candidates)
        await contract.createPoll(taskArgs.name, getCurrentTime(), []);
    });

    function getCurrentTime(): number {
        return Math.floor(new Date().getTime() / 1000) 
    }
}

  

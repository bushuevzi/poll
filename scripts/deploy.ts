import { ethers } from "hardhat";

async function main() {
  const Poll = await ethers.getContractFactory("Poll");
  const poll = await Poll.deploy();

  await poll.deployed();

  console.log("Poll deployed to:", poll.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

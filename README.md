# Poll - Test project

[Tests coverage](https://htmlpreview.github.io/?https://github.com/bushuevzi/poll/blob/main/coverage/index.html)

1) npm install

2) Try running some of the following tasks:

**Common tasks**
```
npx hardhat  accounts              Prints the list of accounts
npx hardhat  balance               Prints an account's balance
```

**Contract tasks**
```
npx hardhat  createPoll            Add Poll to contract
npx hardhat  vote                  Vote for candidate
npx hardhat  increasetime          Increase/decrease hardhat env time
npx hardhat  finish                Finish poll
npx hardhat  withdrawComission     Withdraw Comission
npx hardhat  getElectors           View poll's electorate
npx hardhat  getPoll               View polls info
npx hardhat  getPollCandidates     View poll's candidates
npx hardhat  getPolls              View all polls names in contract
npx hardhat  getVotesForCandidate  View number of votes for candidate
npx hardhat  getWinner             View poll's winner
```

**hardhat**
```
npx hardhat  help                  Prints this message
npx hardhat  test                  Runs mocha tests
npx hardhat  coverage              Generates a code coverage report for tests
npx hardhat  compile               Compiles the entire project, building all artifacts
npx hardhat  run                   Runs a user-defined script after compiling the project
npx hardhat  run scripts/deploy.ts Deploy contract
npx hardhat  node                  Starts a JSON-RPC server on top of Hardhat Network
npx hardhat  verify                Verifies contract on Etherscan
```
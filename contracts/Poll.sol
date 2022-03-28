//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Poll {
    struct PollMeta{
        address[] candidatesLUT;
        address[] electorsLUT;
        address winner;
        uint prize;
        uint comission;
        uint startTime;
        bool isFinished;
        bool isComissionWidsdrawed;
    }

    struct PollFullInfo{
        PollMeta meta;
        // mappings for O(1) algorims
        mapping (address => bool) electors;
        mapping (address => bool) candidates;
        mapping (address => uint) votes;   
    }

    address public _owner;
    uint public _voteCost = 0.01 ether;
    uint public _comissionTax = 10;
    mapping (string => PollFullInfo) public _polls;
    string[] private _pollsLUT;

    constructor() {
        _owner = msg.sender;
    }

    function kill() external {
        require(msg.sender == _owner, "Only the owner can kill this contract");
        selfdestruct(payable(_owner));
    }

    function createPoll(string memory pollName, uint startTime, address[] memory candidates) public {
        PollFullInfo storage targetPoll = _polls[pollName];

        require(msg.sender == _owner, "You should be contract owner");
        require(targetPoll.meta.startTime == 0, "Poll exists");
        require(candidates.length > 0, "Candidates list empty");

        for(uint i = 0; i < candidates.length; i++){
            targetPoll.candidates[candidates[i]] = true;
        }
        targetPoll.meta.candidatesLUT = candidates;
        targetPoll.meta.startTime = startTime;
        _pollsLUT.push(pollName);
    }

    function vote(string memory pollName, address favoriteCandidate) public payable {
        PollFullInfo storage targetPoll = _polls[pollName];

        require(targetPoll.meta.startTime > 0, "Poll not found");
        require(targetPoll.electors[msg.sender] == false, "You alrady voted");
        require(block.timestamp < targetPoll.meta.startTime + 3 days, "Poll is expired");
        require(msg.value == _voteCost, "You need to send 0.01 Ether");
                
        require(targetPoll.candidates[favoriteCandidate] == true, "Favorite candidate is not a poll member");

        targetPoll.electors[msg.sender] = true;
        targetPoll.meta.electorsLUT.push(msg.sender);
        targetPoll.votes[favoriteCandidate] += 1; // vote
    }

    function finish(string memory pollName) public {
        PollFullInfo storage targetPoll = _polls[pollName];

        require(targetPoll.meta.startTime > 0, "Poll not found");
        require(targetPoll.meta.isFinished == false, "Poll allrady finished");
        require(block.timestamp >= targetPoll.meta.startTime + 3 days, "Voting lasts less than 3 days");

        uint _prize = getPrize(pollName);
        address payable _winner = payable(calcWinner(pollName));
        _winner.transfer(_prize);
        
        targetPoll.meta.comission = calcComission(pollName);
        targetPoll.meta.prize = _prize;
        targetPoll.meta.winner = _winner;
        targetPoll.meta.isFinished = true;
    }

    function withdrawComission(string memory pollName) public {
        PollFullInfo storage targetPoll = _polls[pollName];

        require(msg.sender == _owner, "You should be contract owner");
        require(targetPoll.meta.startTime > 0, "Poll not found");
        require(targetPoll.meta.isFinished == true, "Poll not finished");
        require(targetPoll.meta.comission > 0, "Comission is empty");
        require(targetPoll.meta.isComissionWidsdrawed == false, "Comission was already widthdraw");

        payable(_owner).transfer(targetPoll.meta.comission);
        targetPoll.meta.isComissionWidsdrawed = true;
    }

    function getPolls() public view returns(string[] memory) {
        return _pollsLUT;
    }

    function getPoll(string memory pollName) public view returns(PollMeta memory) {
        return _polls[pollName].meta;
    }

    function getPollCandidates(string memory pollName) public view returns(address[] memory) {
        return _polls[pollName].meta.candidatesLUT;
    }

    function getWinner(string memory pollName) public view returns(address) {
        return _polls[pollName].meta.winner;
    }

    function getVotesForCandidate(string memory pollName, address candidate) public view returns(uint) {
        return _polls[pollName].votes[candidate];
    }

    function getPrize(string memory pollName) private view returns (uint) {
        uint prizeWithComission = _polls[pollName].meta.electorsLUT.length * _voteCost;
        uint _comission = calcComission(pollName);
        return prizeWithComission - _comission;
    }

    function calcComission (string memory pollName) private view returns (uint) {
        uint _priseWithComission = _polls[pollName].meta.electorsLUT.length * _voteCost;
        return _priseWithComission / 100 * _comissionTax;
    }

    function calcWinner (string memory pollName) private view returns (address) {
        address _winner;
        uint _maxVotes = 0;
        PollFullInfo storage targetPoll = _polls[pollName];

        for(uint i = 0; i < targetPoll.meta.electorsLUT.length; i++){
            address _member = targetPoll.meta.electorsLUT[i];
            uint _memberVotes = targetPoll.votes[_member];

            if(_memberVotes >= _maxVotes) {
                _winner = _member;
                _maxVotes = _memberVotes;
            }
        }

        return _winner;
    }
}

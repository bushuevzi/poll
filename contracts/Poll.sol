//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract Poll {
    struct Poll{
        address[] membersLUT;
        mapping (address => bool) members;
        mapping (address => uint) votes;
        address winner;
        uint comission;
        uint startTime;
        bool isFinished;
    }

    address public owner;
    uint public voteCost = 0.01 ether;
    uint public comission = 10;
    string[] private pollsLUT;
    mapping (string => Poll) polls;

    constructor() {
        owner = msg.sender;
    }

    function createPoll(string memory pollName) public {
        require(msg.sender == owner, "You should be contract owner");
        require(polls[pollName].startTime == 0, "Poll exists");
        
        pollsLUT.push(pollName);
        polls[pollName].startTime = block.timestamp;
    }

    function withdrawComission(string memory pollName) public {
        require(msg.sender == owner, "You should be contract owner");
        require(polls[pollName].startTime > 0, "Poll not found");
        require(polls[pollName].isFinished == true, "Poll not finished");
        require(polls[pollName].comission == 0, "Comission is empty");

        owner.call{value: polls[pollName].comission}("");
    }

    function vote(string memory pollName, address favoriteCandidate) public payable {
        require(msg.value == voteCost, "You need to send 0.01 Ether");

        registerMemberInPoll(pollName, msg.sender);
        polls[pollName].votes[favoriteCandidate] += 1; // vote
    }

    function finishPoll(string memory pollName) public {
        require(polls[pollName].startTime  > 0, "Poll not found");
        require(polls[pollName].isFinished == false, "Poll allrady finished");
        require(polls[pollName].startTime  + 3 days < block.timestamp, "Voting lasts less than 3 days");
        require(polls[pollName].members[msg.sender] == true, "You not poll member");

        uint _prize = getPrize(pollName);
        address payable _winner = payable(getWinner(pollName));

        (bool result, bytes memory data) = _winner.call{value: _prize}("");

        if(result){
            polls[pollName].isFinished = true;
        }
    }

    function getPolls() public view returns(string[] memory) {
        return pollsLUT;
    }

    function getPollMembers(string memory pollName) public view returns(address[] memory) {
        return polls[pollName].membersLUT;
    }

    function getPollWinner(string memory pollName) public view returns(address) {
        return polls[pollName].winner;
    }

    function getMemberVotes(string memory pollName, address member) public view returns(uint) {
        return polls[pollName].votes[member];
    }

    function registerMemberInPoll(string memory pollName, address member) private {
        if(polls[pollName].members[member]) return;

        polls[pollName].members[member] = true;
        polls[pollName].membersLUT.push(member);
    }

    function getPrize (string memory pollName) private returns (uint) {
        uint _priseWithComission = polls[pollName].membersLUT.length * voteCost;
        uint _comission = calcComission(_priseWithComission);
        
        polls[pollName].comission = _comission;

        return _priseWithComission - _comission;
    }

    function calcComission (uint amount) private returns (uint) {
        return amount / 100 * comission;
    }

    function getWinner (string memory pollName) private returns (address) {
        address _winner;
        uint _maxVotes = 0;

        for(uint i = 0; i < polls[pollName].membersLUT.length; i++){
            address _member = polls[pollName].membersLUT[i];
            uint _memberVotes = polls[pollName].votes[_member];

            if(_memberVotes >= _maxVotes) {
                _winner = _member;
                _maxVotes = _memberVotes;
            }
        }

        return _winner;
    }
}

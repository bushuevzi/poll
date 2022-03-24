//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

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

    mapping (string => mapping (address => uint)) private pollsVotes;
    mapping (string => mapping (address => bool)) private pollsMembers;
    mapping (string => address[]) private pollsMembersLUT;
    mapping (string => address[]) private pollsWiners;
    mapping (string => uint) private pollsStartedTimes;
    mapping (string => bool) private finnishedPolls;
    mapping (string => uint) private pollsComissions;

    constructor() {
        owner = msg.sender;
    }

    function createPoll(string memory pollName) public {
        require(msg.sender == owner, "You should be contract owner");
        require(polls[pollName].startTime == 0, "Poll exists");
        
        pollsLUT.push(pollName);
        polls[pollName].startTime = block.timestamp;
        pollsStartedTimes[pollName] = block.timestamp;
    }

    function withdrawComission(string memory pollName) public {
        require(msg.sender == owner, "You should be contract owner");
        require(pollsStartedTimes[pollName] > 0, "Poll not found");
        require(finnishedPolls[pollName] == true, "Poll not finished");
        require(pollsComissions[pollName] == 0, "Comission is empty");

        owner.call{value: pollsComissions[pollName]}("");
    }

    function vote(string memory pollName, address likedCandidate) public payable {
        require(msg.value == voteCost, "You need to send 0.01 Ether");

        registerMemberInPoll(pollName, msg.sender);
        pollsVotes[pollName][likedCandidate] += 1; // vote
    }

    function finishPoll(string memory pollName) public {
        require(pollsStartedTimes[pollName] > 0, "Poll not found");
        require(finnishedPolls[pollName] == false, "Poll allrady finished");
        require(pollsStartedTimes[pollName] + 3 days < block.timestamp, "Voting lasts less than 3 days");
        require(pollsMembers[pollName][msg.sender] == true, "You not poll member");

        uint _prize = getPrize(pollName);
        address payable _winner = payable(getWinner(pollName));

        (bool result, bytes memory data) = _winner.call{value: _prize}("");

        if(result){
            finnishedPolls[pollName] = true;
        }
    }

    function getPolls() public view returns(string[] memory) {
        return polls;
    }

    function getPollMembers(string memory pollName) public view returns(address[] memory) {
        return pollsMembersLUT[pollName];
    }

    function getPollVotes(string memory pollName) public view returns(address[] memory) {
        return p[pollName];
    }

    function registerMemberInPoll(string memory pollName, address member) private {
        if(pollsMembers[pollName][member]) return;

        pollsMembers[pollName][member] = true;
        pollsMembersLUT[pollName].push(member);
    }

    function getPrize (string memory pollName) private returns (uint) {
        uint _priseWithComission = pollsMembersLUT[pollName].length * voteCost;
        uint _comission = calcComission(_priseWithComission);
        
        pollsComissions[pollName] = _comission;

        return _priseWithComission - _comission;
    }

    function calcComission (uint amount) private returns (uint) {
        return amount / 100 * comission;
    }

    function getWinner (string memory pollName) private returns (address) {
        address _winner;
        uint maxVotes = 0;

        for(uint i = 0; i < pollsMembersLUT[pollName].length; i++){
            address _member = pollsMembersLUT[pollName][i];
            if(pollsVotes[pollName][_member] >= maxVotes) {
                _winner = _member;
            }
        }

        return _winner;
    }
}

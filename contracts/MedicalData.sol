// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalData {
    struct Record {
        string dataHash;  // IPFS hash
        address owner;
    }
    
    mapping(uint => Record) public records;
    uint public recordCount;

    // Event for permission access logging
    event PermissionGranted(address indexed requester, uint indexed recordId);

    function createRecord(string memory _dataHash) public {
        recordCount++;
        records[recordCount(2)] = Record(_QmQRoom7PKS5ZsiuTsTpwFyZaaLqH2tqE89HLRWtXmYdi1,QmThdLahhqiDBGs5KTDTWbsasUPS67SED2qjhNqqswn35b , 0xc443784ccdc56be688d958384a1bb1d0578571e8);
    }

    function grantPermission(uint _recordId) public {
        require(msg.sender == records[_recordId].owner, "Not authorized");
        emit PermissionGranted(msg.sender, _recordId);
    }
}

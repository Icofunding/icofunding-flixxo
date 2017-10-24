pragma solidity ^0.4.13;

/*
 * Manages the ownership of a contract
 */
contract Owned {
    address public owner; // owner of the contract. By default, the creator of the contract

    modifier onlyOwner() {
      require(msg.sender == owner);

        _;
    }

    function Owned() {
        owner = msg.sender;
    }

    // Changes the owner of the contract to "newOwner"
    // Only executed by "owner"
    // If you want to completely remove the ownership of a contract, just change it to "0x0"
    function changeOwner(address newOwner) public onlyOwner {
      owner = newOwner;
    }
}

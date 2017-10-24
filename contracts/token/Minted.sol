pragma solidity ^0.4.13;

import './MintInterface.sol';
import '../util/Owned.sol';

/*
 * Manage the minters of a token
 */
contract Minted is MintInterface, Owned {
  uint public numMinters; // Number of minters of the token.
  bool public open; // If is possible to add new minters or not. True by default.
  mapping (address => bool) public minters; // if an address is a minter of the token or not

  // Log of the minters added
  event NewMinter(address who);

  modifier onlyMinters() {
    require(minters[msg.sender]);

    _;
  }

  modifier onlyIfOpen() {
    require(open);

    _;
  }

  function Minted() {
    open = true;
  }

  // Adds a new minter to the token
  // _minter: address of the new minter
  // Only executed by "Owner" (see "Owned" contract)
  // Only executed if the function "endMinting" has not been executed
  function addMinter(address _minter) public onlyOwner onlyIfOpen {
    if(!minters[_minter]) {
      minters[_minter] = true;
      numMinters++;

      NewMinter(_minter);
    }
  }

  // Removes a minter of the token
  // _minter: address of the minter to be removed
  // Only executed by "Owner" (see "Owned" contract)
  function removeMinter(address _minter) public onlyOwner {
    if(minters[_minter]) {
      minters[_minter] = false;
      numMinters--;
    }
  }

  // Blocks the possibility to add new minters
  // This function is irreversible
  // Only executed by "Owner" (see "Owned" contract)
  function endMinting() public onlyOwner {
    open = false;
  }
}

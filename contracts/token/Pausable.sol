pragma solidity ^0.4.13;

import '../util/Owned.sol';

/*
 * Allows an address to set a block from when a token won't be tradeable
 */
contract Pausable is Owned {
  // block from when the token won't be tradeable
  // Default to 0 = no restriction
  uint public endBlock;

  modifier validUntil() {
    require(block.number <= endBlock || endBlock == 0);

    _;
  }

  // Set a block from when a token won't be tradeable
  // There is no limit in the number of executions to avoid irreversible mistakes.
  // Only executed by "Owner" (see "Owned" contract)
  function setEndBlock(uint block) public onlyOwner {
    endBlock = block;
  }
}

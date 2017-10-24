pragma solidity ^0.4.13;

import '../token/ProjectToken.sol';

// For testing purposes. Ignore
contract TestApprovalReceiver {
  uint public tokensToReceive;
  bool public executed;

  function TestApprovalReceiver(uint tokens) {
    tokensToReceive = tokens;
  }

  function receiveApproval(address _from, uint256 _value, address _tokenContract) {
    if(!ProjectToken(_tokenContract).transferFrom(_from, this, tokensToReceive))
      revert();

    execute();
  }

  function execute() private {
    executed = true;
  }
}

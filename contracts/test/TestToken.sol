pragma solidity ^0.4.13;

import '../token/Token.sol';

// For testing purposes. Ignore
contract TestToken is Token {

  function TestToken(address recipient, uint amount) {
    balances[recipient] = amount;
    totalSupply = amount;
  }
}

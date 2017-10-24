pragma solidity ^0.4.13;

contract MintInterface {
  function mint(address recipient, uint amount) returns (bool success);
}

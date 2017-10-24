pragma solidity ^0.4.13;

// Interface
contract PriceModel {
  function getPrice(uint block) constant returns (uint);
}

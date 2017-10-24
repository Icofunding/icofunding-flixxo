pragma solidity ^0.4.13;

import './util/SafeMath.sol';
import './util/EtherReceiverInterface.sol';

/**
 * Escrow contract to manage the funds collected
 */
contract Escrow is SafeMath, EtherReceiverInterface {
  // Sample thresholds.
  uint[3] threshold = [0 ether, 20000 ether, 1000000 ether];
  // Different rates for each phase.
  uint[2] rate = [4, 1];

  // Adresses that will receive funds
  address public project;
  address public icofunding;

  // Block from when the funds will be released
  uint public lockUntil;

  // Wei
  uint public totalCollected; // total amount of wei collected

  modifier locked() {
    require(block.number >= lockUntil);

    _;
  }

  event e_Withdraw(uint block, uint fee, uint amount);

  function Escrow(uint _lockUntil, address _icofunding, address _project) {
    lockUntil = _lockUntil;
    icofunding = _icofunding;
    project = _project;
  }

  // Sends the funds collected to the addresses "icofunding" and "project"
  // The ether is distributed following the formula below
  // Only exeuted after "lockUntil"
  function withdraw() public locked {
    // Calculates the amount to send to each address
    uint fee = getFee(this.balance);
    uint amount = safeSub(this.balance, fee);

    // Sends the ether
    icofunding.transfer(fee);
    project.transfer(amount);

    e_Withdraw(block.number, fee, amount);
  }

  // Calculates the variable fees depending on the amount, thresholds and rates set.
  function getFee(uint value) public constant returns (uint) {
    uint fee;
    uint slice;
    uint aux;

    for(uint i = 0; i < 2; i++) {
      aux = value;
      if(value > threshold[i+1])
        aux = threshold[i+1];

      if(threshold[i] < aux) {
        slice = safeSub(aux, threshold[i]);

        fee = safeAdd(fee, safeDiv(safeMul(slice, rate[i]), 100));
      }
    }

    return fee;
  }

  function receiveEther() public payable {
    totalCollected += msg.value;
  }

  function() payable {
    totalCollected += msg.value;
  }
}

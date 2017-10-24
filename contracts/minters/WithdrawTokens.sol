pragma solidity ^0.4.13;

import '../token/MintInterface.sol';

/*
 *  Mint tokens of a linked token
 */
contract WithdrawTokens {
  address public tokenContract; // address of the token
  uint public vesting; // number of days in which the tokens are going to be blocked
  address public receiver; // receiver of the tokens
  uint public amount; // number of tokens (plus decimals) to be minted

  modifier afterDate() {
    require(now >= vesting);

    _;
  }

  modifier onlyReceiver() {
    require(msg.sender == receiver);

    _;
  }

  function WithdrawTokens(
    address _tokenContract,
    uint _vesting,
    address _receiver,
    uint _amount
  ) {
    tokenContract = _tokenContract;
    vesting = now + _vesting * 1 days;
    receiver = _receiver;
    amount = _amount;
  }

  // Creates "amount" tokens to "receiver" address
  // Only executed after "vesting" number of days
  // Only executed once
  // Only executed by "receiver"
  function withdraw() public afterDate onlyReceiver {
    require(amount > 0);
    uint tokens = amount;

    amount = 0;
    // mint tokens
    if (!MintInterface(tokenContract).mint(receiver, tokens))
      revert();
  }
}

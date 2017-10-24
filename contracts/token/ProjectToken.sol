pragma solidity ^0.4.13;

import './Token.sol';
import './Minted.sol';
import './Pausable.sol';

/*
 * Token contract
 */
contract ProjectToken is Token, Minted, Pausable {
  string public name; // name of the token
  string public symbol; // acronim of the token
  uint public decimals; // number of decimals of the token

  uint public transferableBlock; // block from which the token can de transfered

  modifier lockUpPeriod() {
    require(block.number >= transferableBlock);

    _;
  }

  function ProjectToken(
    string _name,
    string _symbol,
    uint _decimals,
    uint _transferableBlock
  ) {
    name = _name;
    symbol = _symbol;
    decimals = _decimals;
    transferableBlock = _transferableBlock;
  }

  // Creates "amount" tokens and send them to "recipient" address
  // Only executed by authorized minters (see "Minted" contract)
  function mint(address recipient, uint amount)
    public
    onlyMinters
    returns (bool success)
  {
    totalSupply = safeAdd(totalSupply, amount);
    balances[recipient] = safeAdd(balances[recipient], amount);

    Transfer(0x0, recipient, amount);

    return true;
  }

  // Aproves "_spender" to spend "_value" tokens and executes its "receiveApproval" function
  function approveAndCall(address _spender, uint256 _value)
    public
    returns (bool success)
  {
    if(super.approve(_spender, _value)){
      if(!_spender.call(bytes4(bytes32(sha3("receiveApproval(address,uint256,address)"))), msg.sender, _value, this))
        revert();

      return true;
    }
  }

  // Transfers "value" tokens to "to" address
  // Only executed adter "transferableBlock"
  // Only executed before "endBlock" (see "Expiration" contract)
  // Only executed if there are enough funds and don't overflow
  function transfer(address to, uint value)
    public
    lockUpPeriod
    validUntil
    returns (bool success)
  {
    if(super.transfer(to, value))
      return true;

    return false;
  }

  // Transfers "value" tokens to "to" address from "from"
  // Only executed adter "transferableBlock"
  // Only executed before "endBlock" (see "Expiration" contract)
  // Only executed if there are enough funds available and approved, and don't overflow
  function transferFrom(address from, address to, uint value)
    public
    lockUpPeriod
    validUntil
    returns (bool success)
  {
    if(super.transferFrom(from, to, value))
      return true;

    return false;
  }

  function refundTokens(address _token, address _refund, uint _value) onlyOwner {

    Token(_token).transfer(_refund, _value);
  }

}

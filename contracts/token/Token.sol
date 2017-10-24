pragma solidity ^0.4.13;

import './ERC20.sol';
import '../util/SafeMath.sol';

/*
 * Standard ERC20 token
 *
 * https://github.com/ethereum/EIPs/issues/20
 */
contract Token is ERC20, SafeMath {

  mapping(address => uint) balances;
  mapping (address => mapping (address => uint)) allowed;

  function transfer(address _to, uint _value) returns (bool success) {

    return doTransfer(msg.sender, _to, _value);
  }

  function transferFrom(address _from, address _to, uint _value) returns (bool success) {
    var _allowance = allowed[_from][msg.sender];

    allowed[_from][msg.sender] = safeSub(_allowance, _value);

    return doTransfer(_from, _to, _value);
  }

  /// @notice You must set the allowance to zero before changing to a non-zero value
  function approve(address _spender, uint _value) public returns (bool success) {
    require(allowed[msg.sender][_spender] == 0 || _value == 0);

    allowed[msg.sender][_spender] = _value;

    Approval(msg.sender, _spender, _value);

    return true;
  }

  function doTransfer(address _from, address _to, uint _value) private returns (bool success) {
    balances[_from] = safeSub(balances[_from], _value);
    balances[_to] = safeAdd(balances[_to], _value);

    Transfer(_from, _to, _value);

    return true;
  }

  function balanceOf(address _owner) public constant returns (uint balance) {
    return balances[_owner];
  }

  function allowance(address _owner, address _spender) public constant returns (uint remaining) {
    return allowed[_owner][_spender];
  }
}

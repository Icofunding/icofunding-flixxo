pragma solidity ^0.4.13;

import './util/SafeMath.sol';
import './token/MintInterface.sol';
import './priceModels/PriceModel.sol';
import './util/EtherReceiverInterface.sol';

/**
 * Crowdsale contract. Defines the minting process in exchange of ether
 */
contract CrowdsaleTokens is SafeMath {

  address public tokenContract; // address of the token
  address public priceModel; // address of the contract with the prices
  address public vaultAddress; // address that will receive the ether collected

  // blocks
  uint public crowdsaleStarts; // block in which the ICO starts
  uint public crowdsaleEnds; // block in which the ICO ends

  // wei
  uint public totalCollected; // amount of wei collected

  // tokens
  uint public tokensIssued; // number of tokens (plus decimals) issued so far
  uint public tokenCap; // maximum number of tokens to be issued

  modifier crowdsalePeriod() {
    require(block.number >= crowdsaleStarts && block.number < crowdsaleEnds);

    _;
  }

  function CrowdsaleTokens(
    address _tokenContract,
    address _priceModel,
    address _vaultAddress,
    uint _crowdsaleStarts,
    uint _crowdsaleEnds,
    uint _tokenCap
  ) {
    tokenContract = _tokenContract;
    priceModel = _priceModel;
    vaultAddress = _vaultAddress;
    crowdsaleStarts = _crowdsaleStarts;
    crowdsaleEnds = _crowdsaleEnds;
    tokenCap = _tokenCap;
  }

  // Same as buy()
  function() payable {
    buy();
  }

  // Allows anyone to buy tokens in exchange of ether.
  // Only executed after "crowdsaleStarts" and before "crowdsaleEnds"
  function buy() public payable crowdsalePeriod {
    // Calculate price
    uint price = calculatePrice(block.number);

    // Process purchase
    processPurchase(price);
  }

  // Manages the purchase of the tokens for a given price.
  // The maximum amount of tokens that can be purchased is given by the "remaining" function
  function processPurchase(uint price) private {
    // number of the tokens to be purchased  for the given price and ether sent
    uint numTokens = safeDiv(safeMul(msg.value, price), 1 ether);

    // token cap
    assert(numTokens <= remaining() && remaining() > 0);

    // update variables
    totalCollected = safeAdd(totalCollected, msg.value);
    tokensIssued = safeAdd(tokensIssued, numTokens);

    // send the ether to a trusted wallet
    EtherReceiverInterface(vaultAddress).receiveEther.value(msg.value)();

    // mint tokens
    if (!MintInterface(tokenContract).mint(msg.sender, numTokens))
      revert();
  }

  // Returns the number of tokens to be purchased by 1 ether at the given block
  function calculatePrice(uint block) public constant returns (uint) {
    return PriceModel(priceModel).getPrice(block);
  }

  // Returns the number of tokens available for sale
  function remaining() public constant returns (uint) {

    return safeSub(tokenCap, tokensIssued);
  }
}

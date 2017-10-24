const WithdrawTokens = artifacts.require("./WithdrawTokens.sol");
const ProjectToken = artifacts.require("./token/ProjectToken.sol");


contract('WithdrawTokens', function(accounts) {
  let owner;
  let receiver;
  let other;

  let lockUntil;

  let tokenName;
  let tokenSymbol;
  let tokenDecimals;
  let transferableBlock;


  before(() => {
    owner = accounts[0];
    receiver = accounts[1];
    other = accounts[2];

    lockUntil = 0;

    tokenName = "Test Token";
    tokenSymbol = "TST";
    tokenDecimals = "2";
    transferableBlock = web3.eth.blockNumber;
  });

  it("Deployment with initial values", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;
    let tokens = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokens.new(
        ProjectTokenInstance.address,
        lockUntil,
        receiver,
        tokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return WithdrawTokensInstance.tokenContract.call();
    }).then(function(address) {
      assert.equal(address, ProjectTokenInstance.address, "incorrect tokenContract address");
/*
      return WithdrawTokensInstance.vesting.call();
    }).then(function(value) {
      assert.equal(value.toNumber(), lockUntil, "incorrect vesting");
*/
      return WithdrawTokensInstance.amount.call();
    }).then(function(value) {
      assert.equal(value, tokens, "incorrect number of tokens");

      return WithdrawTokensInstance.receiver.call();
    }).then(function(value) {
      assert.equal(value, receiver, "incorrect receiver");
    });
  });

  it("Withdraw tokens", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let tokens = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokens.new(
        ProjectTokenInstance.address,
        lockUntil,
        receiver,
        tokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toNumber(), tokens, "incorrect number of tokens");

      return WithdrawTokensInstance.amount.call();
    }).then(function(value) {
      assert.equal(value, 0, "incorrect number of tokens");
    });
  });

  it("Withdraw tokens before the vesting date should fail", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let tokens = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokens.new(
        ProjectTokenInstance.address,
        lockUntil + 2,
        receiver,
        tokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value, 0, "incorrect number of tokens");

      return WithdrawTokensInstance.amount.call();
    }).then(function(value) {
      assert.equal(value, tokens, "incorrect number of tokens");
    });
  });

  it("Withdraw tokens from a non-receiver account should fail", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let tokens = 100;


    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokens.new(
        ProjectTokenInstance.address,
        lockUntil,
        receiver,
        tokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: other});
    }).then(function() {

      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.balanceOf.call(other);
    }).then(function(value) {
      assert.equal(value, 0, "incorrect number of tokens");

      return WithdrawTokensInstance.amount.call();
    }).then(function(value) {
      assert.equal(value, tokens, "incorrect number of tokens");
    });
  });

  it("Withdraw tokens twice should fail", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let tokens = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokens.new(
        ProjectTokenInstance.address,
        lockUntil,
        receiver,
        tokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toNumber(), tokens, "incorrect number of tokens");

      return WithdrawTokensInstance.amount.call();
    }).then(function(value) {
      assert.equal(value, 0, "incorrect number of tokens");
    });
  });
});

function handleException(error) {
  assert(error.toString().indexOf("invalid JUMP") != -1 || error.toString().indexOf("out of gas") != -1 || error.toString().indexOf("invalid opcode") != -1, error.toString());
}

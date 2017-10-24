const TestToken = artifacts.require("./test/TestToken.sol");

contract('TestToken', function(accounts) {
  const UINT256_OVERFLOW = '115792089237316195423570985008687907853269984665640564039457584007913129639936';
  let account0;
  let account1;
  let account2;

  before(() => {
    account0 = accounts[0];
    account1 = accounts[1];
    account2 = accounts[2];
  });

  it("Deployment without initial values shouldn't create tokens", function() {
    let TestTokenInstance;

    return TestToken.new().then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), 0, "totalSupply must be 0");

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account0 balance must be 0");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return TestTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");
    });
  });

  it("Deployment with initial values should create tokens to account0", function() {
    let TestTokenInstance;
    let totalAmount = 1000;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount, "incorrect account0 balance");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return TestTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");
    });
  });

  it("Transfers tokens from account0 to account1 with enough balance", function() {
    let TestTokenInstance;
    let totalAmount = 1000;
    let amountToSend = 100;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.transfer(account1, amountToSend, {from: account0});
    }).then(function() {

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount - amountToSend, "incorrect account0 balance");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToSend, "incorrect account1 balance");

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");
    });
  });

  it("Transfers all tokens from account0 to account1", function() {
    let TestTokenInstance;
    let totalAmount = 1000;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.transfer(account1, totalAmount, {from: account0});
    }).then(function() {

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account0 balance must be 0");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount, "incorrect account1 balance");

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");
    });
  });

  it("Transfer tokens from account0 to account1 with not enough balance should fail", function() {
    let TestTokenInstance;
    let totalAmount = 1000;
    let amountToSend = 1001;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.transfer(account1, amountToSend, {from: account0});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount, "incorrect account0 balance");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");
    });
  });

  it("Transfer a negative amount of tokens from account0 to account1 should fail", function() {
    let TestTokenInstance;
    let totalAmount = 1000;
    let amountToSend = -1;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.transfer(account1, amountToSend, {from: account0});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount, "incorrect account0 balance");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");
    });
  });

  it("Transfer tokens with uint overflow from account0 to account1 should fail", function() {
    let TestTokenInstance;
    let totalAmount = 1000;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.transfer(account1, UINT256_OVERFLOW, {from: account0});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount, "incorrect account0 balance");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");
    });
  });

  it("Approves account1 to transfer tokens from account0", function() {
    let TestTokenInstance;
    let totalAmount = 1000;
    let amountToAprove = 100;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.approve(account1, amountToAprove, {from: account0});
    }).then(function() {

      return TestTokenInstance.allowance.call(account0, account1);
    }).then(function(value) {
      assert.equal(value.valueOf(), amountToAprove, "incorrect amount allowed to transfer");
    });
  });

  it("Sends tokens from account0 to account2 as account1 after approval", function() {
    let TestTokenInstance;
    let totalAmount = 1000;
    let amountToAprove = 100;
    let amountToSend = 10;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.approve(account1, amountToAprove, {from: account0});
    }).then(function() {

      return TestTokenInstance.transferFrom(account0, account2, amountToSend, {from: account1});
    }).then(function() {

      return TestTokenInstance.allowance.call(account0, account1);
    }).then(function(value) {
      assert.equal(value.valueOf(), amountToAprove - amountToSend, "incorrect amount allowed to transfer");

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount - amountToSend, "incorrect account0 balance");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return TestTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToSend, "incorrect account2 balance");

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");
    });
  });

  it("Send tokens from account0 to account2 as account1 without enough aproved tokens should fail", function() {
    let TestTokenInstance;
    let totalAmount = 1000;
    let amountToAprove = 100;
    let amountToSend = 101;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.approve(account1, amountToAprove, {from: account0});
    }).then(function() {

      return TestTokenInstance.transferFrom(account0, account2, amountToSend, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error)

      return TestTokenInstance.allowance.call(account0, account1);
    }).then(function(value) {
      assert.equal(value.valueOf(), amountToAprove, "incorrect amount allowed to transfer");

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount, "incorrect account0 balance");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return TestTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");
    });
  });

  it("Send tokens from account0 to account2 as account1 without approval should fail", function() {
    let TestTokenInstance;
    let totalAmount = 1000;
    let amountToAprove = 100;
    let amountToSend = 101;

    return TestToken.new(account0, totalAmount).then(function(instance) {
      TestTokenInstance = instance;

      return TestTokenInstance.transferFrom(account0, account2, amountToSend, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error)

      return TestTokenInstance.allowance.call(account0, account1);
    }).then(function(value) {
      assert.equal(value.valueOf(), 0, "amount allowed to transfer must be 0");

      return TestTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), totalAmount, "incorrect account0 balance");

      return TestTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return TestTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");

      return TestTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), totalAmount, "incorrect total supply");
    });
  });
});

function handleException(error) {
  assert(error.toString().indexOf("invalid JUMP") != -1 || error.toString().indexOf("out of gas") != -1 || error.toString().indexOf("invalid opcode") != -1, error.toString());
}

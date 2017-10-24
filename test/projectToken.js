const ProjectToken = artifacts.require("./token/ProjectToken.sol");
const TestApprovalReceiver = artifacts.require("./test/TestApprovalReceiver.sol");

contract('ProjectToken', function(accounts) {
  const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
  const UINT256_OVERFLOW = '115792089237316195423570985008687907853269984665640564039457584007913129639936';
  let minter;
  let account1;
  let account2;
  let tokenName;
  let tokenSymbol;
  let tokenDecimals;
  let transferableBlock;

  before(() => {
    owner = accounts[0];
    account1 = accounts[1];
    account2 = accounts[2];
    minter = accounts[0];
    tokenName = "Test Token";
    tokenSymbol = "TST";
    tokenDecimals = "2";
    transferableBlock = web3.eth.blockNumber;
  });

  it("Deployment with initial values should create a token with no balances", function() {
    let ProjectTokenInstance;


    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock, {from: owner}).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), 0, "total supply must be 0");

      return ProjectTokenInstance.numMinters.call();
    }).then(function(num) {
      assert.equal(parseInt(num.valueOf()), 0, "numMinters must be 0");

      return ProjectTokenInstance.owner.call();
    }).then(function(account) {
      assert.equal(account, owner, "incorrect owner");

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return ProjectTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");

      return ProjectTokenInstance.name.call();
    }).then(function(name) {
      assert.equal(name, tokenName, "incorrect token name");

      return ProjectTokenInstance.symbol.call();
    }).then(function(symbol) {
      assert.equal(symbol, tokenSymbol, "incorrect token symbol");

      return ProjectTokenInstance.decimals.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), tokenDecimals, "incorrect token decimals");

      return ProjectTokenInstance.transferableBlock.call();
    }).then(function(block) {
      assert.equal(parseInt(block.valueOf()), transferableBlock, "incorrect transferable block");

      return ProjectTokenInstance.endBlock.call();
    }).then(function(block) {
      assert.equal(parseInt(block.valueOf()), 0, "endblock must be 0");

      return ProjectTokenInstance.open.call();
    }).then(function(value) {
      assert.isTrue(value, "The token must be open");
    });
  });

  it("Sets endBlock as owner", function() {
    let ProjectTokenInstance;
    let endBlock = web3.eth.blockNumber + 10;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.setEndBlock(endBlock, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.endBlock.call();
    }).then(function(num) {
      assert.equal(parseInt(num.valueOf()), endBlock, "incorrect endBlock");
    });
  });

  it("Sets endBlock as non-owner should fail", function() {
    let ProjectTokenInstance;
    let endBlock = web3.eth.blockNumber + 10;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.setEndBlock(endBlock, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.endBlock.call();
    }).then(function(num) {
      assert.equal(parseInt(num.valueOf()), 0, "endBlock should be 0");
    });
  });

  it("Adds minter as owner", function() {
    let ProjectTokenInstance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.numMinters.call();
    }).then(function(num) {
      assert.equal(parseInt(num.valueOf()), 1, "incorrect number of minters");

      return ProjectTokenInstance.minters.call(minter);
    }).then(function(account) {
      assert.isTrue(account, "minter should be a minter");
    });
  });

  it("Adds minter as non-owner should fail", function() {
    let ProjectTokenInstance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.numMinters.call();
    }).then(function(num) {
      assert.equal(parseInt(num.valueOf()), 0, "incorrect number of minters");

      return ProjectTokenInstance.minters.call(minter);
    }).then(function(account) {
      assert.isFalse(account, "minter should not be a minter");
    });
  });

  it("Remove minter as owner", function() {
    let ProjectTokenInstance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.removeMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.numMinters.call();
    }).then(function(num) {
      assert.equal(parseInt(num.valueOf()), 0, "incorrect number of minters");

      return ProjectTokenInstance.minters.call(minter);
    }).then(function(account) {
      assert.isFalse(account, "minter should not be a minter");
    });
  });

  it("Remove minter as non-owner should fail", function() {
    let ProjectTokenInstance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.removeMinter(minter, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.numMinters.call();
    }).then(function(num) {
      assert.equal(parseInt(num.valueOf()), 1, "incorrect number of minters");

      return ProjectTokenInstance.minters.call(minter);
    }).then(function(account) {
      assert.isTrue(account, "minter should be a minter");
    });
  });

  it("Mints tokens to account1 as minter", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(minter);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "minter balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });

  it("Mint tokens as non-minter should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.mint(account1, amountToMint, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), 0, "total supply must be 0");
    });
  });

  it("End minting as owner", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.endMinting({from: owner});
    }).then(function() {

      return ProjectTokenInstance.open.call();
    }).then(function(value) {
      assert.isFalse(value, "the token must be open");
    });
  });

  it("End minting as non-owner should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.endMinting({from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.open.call();
    }).then(function(value) {
      assert.isTrue(value, "the token must be closed");
    });
  });

  it("Add minter when the token is closed should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.endMinting({from: owner});
    }).then(function() {

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.numMinters.call();
    }).then(function(num) {
      assert.equal(parseInt(num.valueOf()), 0, "numMinters must be 0");

      return ProjectTokenInstance.minters.call(minter);
    }).then(function(value) {
      assert.isFalse(value, "minter balance must be 0");
    });
  });

  it("Mint tokens with uint overflow should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, UINT256_OVERFLOW, {from: minter});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account1 balance must be 0");

      return ProjectTokenInstance.balanceOf.call(minter);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "minter balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), 0, "total supply must be 0");
    });
  });

  it("Mint tokens until uint overflow should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, MAX_UINT256, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, 1, {from: minter});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(balance.toString(10), MAX_UINT256, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(minter);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "minter balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(supply.toString(10), MAX_UINT256, "incorrect total supply");
    });
  });

  it("Transfer tokens from account1 to account2 after lock up period", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;
    let amountToSend = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.transfer(account2, amountToSend, {from: account1});
    }).then(function() {

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint - amountToSend, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToSend, "incorrect account2 balance");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });

  it("Transfer tokens from account1 to account2 before lock up period should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;
    let amountToSend = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock + 100).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.transfer(account2, amountToSend, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });

  it("Transfer tokens from account1 to account2 after endBlock should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;
    let amountToSend = 100;
    let endBlock = web3.eth.blockNumber - 5;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.setEndBlock(endBlock, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.transfer(account2, amountToSend, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });

  it("Transfer tokens from account1 to account2 as account2 after lock up period", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;
    let amountToAprove = 100;
    let amountToSend = 10;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.approve(account2, amountToAprove, {from: account1});
    }).then(function() {

      return ProjectTokenInstance.transferFrom(account1, account2, amountToSend, {from: account2});
    }).then(function() {

      return ProjectTokenInstance.allowance.call(account1, account2);
    }).then(function(value) {
      assert.equal(value.valueOf(), amountToAprove - amountToSend, "incorrect amount allowed to transfer");

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint - amountToSend, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToSend, "incorrect account2 balance");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });

  it("Transfer tokens from account1 to account2 as account2 before lock up period should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;
    let amountToAprove = 100;
    let amountToSend = 10;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock + 100).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.approve(account2, amountToAprove, {from: account1});
    }).then(function() {

      return ProjectTokenInstance.transferFrom(account1, account2, amountToSend, {from: account2});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.allowance.call(account1, account2);
    }).then(function(value) {
      assert.equal(value.valueOf(), amountToAprove, "incorrect amount allowed to transfer");

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });

  it("Transfer tokens from account1 to account2 as account2 after endBlock should fail", function() {
    let ProjectTokenInstance;
    let TestObserverInstance;
    let amountToMint = 1000;
    let amountToAprove = 100;
    let amountToSend = 10;
    let endBlock = web3.eth.blockNumber - 5;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.approve(account2, amountToAprove, {from: account1});
    }).then(function() {

      return ProjectTokenInstance.setEndBlock(endBlock, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.transferFrom(account1, account2, amountToSend, {from: account2});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return ProjectTokenInstance.allowance.call(account1, account2);
    }).then(function(value) {
      assert.equal(value.valueOf(), amountToAprove, "incorrect amount allowed to transfer");

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(account2);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account2 balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });

  it("Executes a sample function and transfers tokens from account1 as a Contract with approveAndCall", function() {
    let ProjectTokenInstance;
    let TestApprovalReceiverInstance;
    let TestObserverInstance;
    let amountToMint = 1000;
    let amountToAprove = 100;
    let amountToSend = 10;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return TestApprovalReceiver.new(amountToSend);
    }).then(function(instance) {
      TestApprovalReceiverInstance = instance;

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.approveAndCall(TestApprovalReceiverInstance.address, amountToAprove, {from: account1});
    }).then(function() {

      return TestApprovalReceiverInstance.executed.call();
    }).then(function(executed) {
      assert.isTrue(executed, 'the function should be executed');

      return ProjectTokenInstance.allowance.call(account1, TestApprovalReceiverInstance.address);
    }).then(function(value) {
      assert.equal(value.valueOf(), amountToAprove - amountToSend, "incorrect amount allowed to transfer");

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint - amountToSend, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(TestApprovalReceiverInstance.address);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToSend, "incorrect contract balance");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });

  it("Executes a sample function and fails to transfers tokens from account1 as a Contract with approveAndCall should fail", function() {
    let ProjectTokenInstance;
    let TestApprovalReceiverInstance;
    let TestObserverInstance;
    let amountToMint = 1000;
    let amountToAprove = 100;
    let amountToSend = 101;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return TestApprovalReceiver.new(amountToSend);
    }).then(function(instance) {
      TestApprovalReceiverInstance = instance;

      return ProjectTokenInstance.addMinter(minter, {from: owner});
    }).then(function() {

      return ProjectTokenInstance.mint(account1, amountToMint, {from: minter});
    }).then(function() {

      return ProjectTokenInstance.approveAndCall(TestApprovalReceiverInstance.address, amountToAprove, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return TestApprovalReceiverInstance.executed.call();
    }).then(function(executed) {
      assert.isFalse(executed, 'the function should not be executed');

      return ProjectTokenInstance.allowance.call(account1, TestApprovalReceiverInstance.address);
    }).then(function(value) {
      assert.equal(value.valueOf(), 0, "amount allowed to transfer must be 0");

      return ProjectTokenInstance.balanceOf.call(account1);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), amountToMint, "incorrect account1 balance");

      return ProjectTokenInstance.balanceOf.call(TestApprovalReceiverInstance.address);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "contract balance must be 0");

      return ProjectTokenInstance.totalSupply.call();
    }).then(function(supply) {
      assert.equal(parseInt(supply.valueOf()), amountToMint, "incorrect total supply");
    });
  });
});

function handleException(error) {
  assert(error.toString().indexOf("invalid JUMP") != -1 || error.toString().indexOf("out of gas") != -1 || error.toString().indexOf("invalid opcode") != -1, error.toString());
}

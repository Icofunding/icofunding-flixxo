const Crowdsale = artifacts.require("./CrowdsaleTokens.sol");
const ProjectToken = artifacts.require("./token/ProjectToken.sol");
const TestPriceModel = artifacts.require("./test/TestPriceModel.sol");
const Escrow = artifacts.require("./Escrow.sol");


contract('CrowdsaleTokens', function(accounts) {
  const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
  const UINT256_OVERFLOW = '115792089237316195423570985008687907853269984665640564039457584007913129639936';
  let account0;
  let account1;
  let vault;

  let crowdsaleStarts;
  let crowdsaleEnds;
  let tokenCap;

  let hasPresale;
  let presaleAddress;

  let tokenName;
  let tokenSymbol;
  let tokenDecimals;
  let transferableBlock;

  before(() => {
    owner = accounts[0];
    account0 = accounts[1];
    account1 = accounts[2];
    vault = accounts[2];

    hasPresale = false;
    presaleAddress = "0x0";

    tokenCap = 100000000; // check bigNumber

    tokenName = "Test Token";
    tokenSymbol = "TST";
    tokenDecimals = "2";
    transferableBlock = web3.eth.blockNumber;
  });

  it("Deployment with initial values", function() {
    let CrowdsaleInstance;
    let TestProjectTokenInstance;
    let TestPriceModelInstance;


    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock, {from: owner}).then(function(instance) {
      ProjectTokenInstance = instance;

      return TestPriceModel.new();
    }).then(function(instance) {
      TestPriceModelInstance = instance;

      return Escrow.new();
    }).then(function(instance) {
      EscrowInstance = instance;

      crowdsaleStarts = web3.eth.blockNumber;
      crowdsaleEnds = web3.eth.blockNumber + 10;

      return Crowdsale.new(
        ProjectTokenInstance.address,
        TestPriceModelInstance.address,
        EscrowInstance.address,
        crowdsaleStarts,
        crowdsaleEnds,
        tokenCap
      );
    }).then(function(instance) {
      CrowdsaleInstance = instance;

      return CrowdsaleInstance.tokenContract.call();
    }).then(function(token) {
      assert.equal(token, ProjectTokenInstance.address, "incorrect token address");

      return CrowdsaleInstance.crowdsaleStarts.call();
    }).then(function(date) {
      assert.equal(parseInt(date.valueOf()), crowdsaleStarts, "incorrect crowdsale start date");

      return CrowdsaleInstance.crowdsaleEnds.call();
      }).then(function(date) {
      assert.equal(parseInt(date.valueOf()), crowdsaleEnds, "incorrect crowdsale end date");

      return CrowdsaleInstance.tokenCap.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), tokenCap, "incorrect token cap value");

      return CrowdsaleInstance.remaining.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), tokenCap, "incorrect remaining value");

      return CrowdsaleInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), 0, "ether raised must be 0");

      return CrowdsaleInstance.tokensIssued.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), 0, "tokens issued must be 0");

      return CrowdsaleInstance.priceModel.call();
    }).then(function(address) {
      assert.equal(address, TestPriceModelInstance.address, "incorrect price model address");

      return CrowdsaleInstance.vaultAddress.call();
    }).then(function(address) {
      assert.equal(address, EscrowInstance.address, "incorrect vault address");
    });
  });

  it("Buy tokens during the crowdsale period", function() {
    let CrowdsaleInstance;
    let ProjectTokenInstance;
    let TestPriceModelInstance;
    let numTokenstoBuy = 2;
    let txValue = web3.toWei(numTokenstoBuy, "Ether"); // 1 token per ether as testPriceModel price

    let vaultBalance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock, {from: owner}).then(function(instance) {
      ProjectTokenInstance = instance;

      return TestPriceModel.new();
    }).then(function(instance) {
      TestPriceModelInstance = instance;

      return Escrow.new();
    }).then(function(instance) {
      EscrowInstance = instance;

      vaultBalance = web3.eth.getBalance(EscrowInstance.address).toNumber();

      crowdsaleStarts = web3.eth.blockNumber;
      crowdsaleEnds = web3.eth.blockNumber + 10;

      return Crowdsale.new(
        ProjectTokenInstance.address,
        TestPriceModelInstance.address,
        EscrowInstance.address,
        crowdsaleStarts,
        crowdsaleEnds,
        tokenCap
      );
    }).then(function(instance) {
      CrowdsaleInstance = instance;

      return ProjectTokenInstance.addMinter(CrowdsaleInstance.address, {from: owner});
    }).then(function() {

      return CrowdsaleInstance.buy({from: account0, value: txValue});
    }).then(function() {

      return CrowdsaleInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), txValue, "incorrect ether raised value");

      return CrowdsaleInstance.tokensIssued.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), numTokenstoBuy, "incorrect tokens issued value");

      return CrowdsaleInstance.remaining.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), tokenCap - numTokenstoBuy, "incorrect remaining value");

      return CrowdsaleInstance.tokenContract.call();
    }).then(function(address) {
      ProjectTokenInstance = ProjectToken.at(address);

      return ProjectTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), numTokenstoBuy, "incorrect account0 token balance");
      assert.equal(web3.eth.getBalance(EscrowInstance.address).toNumber(), parseInt(vaultBalance) + parseInt(txValue), "incorrect Vault ether balance");
    });
  });

  it("Buy tokens during the crowdsale period using the fallback function", function() {
    let CrowdsaleInstance;
    let ProjectTokenInstance;
    let TestPriceModelInstance;
    let numTokenstoBuy = 2;
    let txValue = web3.toWei(numTokenstoBuy, "Ether"); // 1 token per ether as testPriceModel price

    let vaultBalance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock, {from: owner}).then(function(instance) {
      ProjectTokenInstance = instance;

      return TestPriceModel.new();
    }).then(function(instance) {
      TestPriceModelInstance = instance;

      return Escrow.new();
    }).then(function(instance) {
      EscrowInstance = instance;

      vaultBalance = web3.eth.getBalance(EscrowInstance.address).toNumber();

      crowdsaleStarts = web3.eth.blockNumber;
      crowdsaleEnds = web3.eth.blockNumber + 10;

      return Crowdsale.new(
        ProjectTokenInstance.address,
        TestPriceModelInstance.address,
        EscrowInstance.address,
        crowdsaleStarts,
        crowdsaleEnds,
        tokenCap
      );
    }).then(function(instance) {
      CrowdsaleInstance = instance;

      return ProjectTokenInstance.addMinter(CrowdsaleInstance.address, {from: owner});
    }).then(function() {

      return web3.eth.sendTransaction({from: account0, to: CrowdsaleInstance.address, value: txValue, gas: 200000});
    }).then(function() {

      return CrowdsaleInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), txValue, "incorrect ether raised value");

      return CrowdsaleInstance.tokensIssued.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), numTokenstoBuy, "incorrect tokens issued value");

      return CrowdsaleInstance.remaining.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), tokenCap - numTokenstoBuy, "incorrect remaining value");

      return CrowdsaleInstance.tokenContract.call();
    }).then(function(address) {
      ProjectTokenInstance = ProjectToken.at(address);

      return ProjectTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), numTokenstoBuy, "incorrect account0 token balance");
      assert.equal(web3.eth.getBalance(EscrowInstance.address).toNumber(), parseInt(vaultBalance) + parseInt(txValue), "incorrect Vault ether balance");
    });
  });

  it("Buy tokens before the crowdsale period should fail", function() {
    let CrowdsaleInstance;
    let ProjectTokenInstance;
    let TestPriceModelInstance;
    let numTokenstoBuy = 2;
    let txValue = web3.toWei(numTokenstoBuy, "Ether"); // 1 token per ether as testPriceModel price

    let vaultBalance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock, {from: owner}).then(function(instance) {
      ProjectTokenInstance = instance;

      return TestPriceModel.new();
    }).then(function(instance) {
      TestPriceModelInstance = instance;

      return Escrow.new();
    }).then(function(instance) {
      EscrowInstance = instance;

      vaultBalance = web3.eth.getBalance(EscrowInstance.address).toNumber();

      crowdsaleStarts = web3.eth.blockNumber + 10;
      crowdsaleEnds = web3.eth.blockNumber + 20;

      return Crowdsale.new(
        ProjectTokenInstance.address,
        TestPriceModelInstance.address,
        EscrowInstance.address,
        crowdsaleStarts,
        crowdsaleEnds,
        tokenCap
      );
    }).then(function(instance) {
      CrowdsaleInstance = instance;

      return ProjectTokenInstance.addMinter(CrowdsaleInstance.address, {from: owner});
    }).then(function() {

      return CrowdsaleInstance.buy({from: account0, value: txValue});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return CrowdsaleInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), 0, "ether raised must be 0");

      return CrowdsaleInstance.remaining.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), tokenCap, "incorrect remaining value");

      return CrowdsaleInstance.tokenContract.call();
    }).then(function(address) {
      ProjectTokenInstance = ProjectToken.at(address);

      return ProjectTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account0 token balance must be 0");
      assert.equal(web3.eth.getBalance(EscrowInstance.address).toNumber(), parseInt(vaultBalance), "incorrect Vault ether balance");
    });
  });

  it("Buy tokens after the crowdsale period should fail", function() {
    let CrowdsaleInstance;
    let ProjectTokenInstance;
    let TestPriceModelInstance;
    let numTokenstoBuy = 2;
    let txValue = web3.toWei(numTokenstoBuy, "Ether"); // 1 token per ether as testPriceModel price

    let vaultBalance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock, {from: owner}).then(function(instance) {
      ProjectTokenInstance = instance;

      return TestPriceModel.new();
    }).then(function(instance) {
      TestPriceModelInstance = instance;

      return Escrow.new();
    }).then(function(instance) {
      EscrowInstance = instance;

      vaultBalance = web3.eth.getBalance(EscrowInstance.address).toNumber();

      crowdsaleStarts = web3.eth.blockNumber - 10;
      crowdsaleEnds = web3.eth.blockNumber - 1;

      return Crowdsale.new(
        ProjectTokenInstance.address,
        TestPriceModelInstance.address,
        EscrowInstance.address,
        crowdsaleStarts,
        crowdsaleEnds,
        tokenCap
      );
    }).then(function(instance) {
      CrowdsaleInstance = instance;

      return ProjectTokenInstance.addMinter(CrowdsaleInstance.address, {from: owner});
    }).then(function() {

      return CrowdsaleInstance.buy({from: account0, value: txValue});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return CrowdsaleInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), 0, "ether raised must be 0");

      return CrowdsaleInstance.remaining.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), tokenCap, "incorrect remaining value");

      return CrowdsaleInstance.tokenContract.call();
    }).then(function(address) {
      ProjectTokenInstance = ProjectToken.at(address);

      return ProjectTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account0 token balance must be 0");
      assert.equal(web3.eth.getBalance(EscrowInstance.address).toNumber(), parseInt(vaultBalance), "incorrect Vault ether balance");
    });
  });

  it("Buy tokens with more ether than remaining should fail", function() {
    let CrowdsaleInstance;
    let ProjectTokenInstance;
    let TestPriceModelInstance;
    let numTokenstoBuy = 10;
    let txValue = web3.toWei(numTokenstoBuy, "Ether"); // 1 token per ether as testPriceModel price
    tokenCap = 9;

    let vaultBalance;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock, {from: owner}).then(function(instance) {
      ProjectTokenInstance = instance;

      return TestPriceModel.new();
    }).then(function(instance) {
      TestPriceModelInstance = instance;

      return Escrow.new();
    }).then(function(instance) {
      EscrowInstance = instance;

      vaultBalance = web3.eth.getBalance(EscrowInstance.address).toNumber();

      crowdsaleStarts = web3.eth.blockNumber - 1;
      crowdsaleEnds = web3.eth.blockNumber + 20;

      return Crowdsale.new(
        ProjectTokenInstance.address,
        TestPriceModelInstance.address,
        EscrowInstance.address,
        crowdsaleStarts,
        crowdsaleEnds,
        tokenCap
      );
    }).then(function(instance) {
      CrowdsaleInstance = instance;

      return ProjectTokenInstance.addMinter(CrowdsaleInstance.address, {from: owner});
    }).then(function() {

      return CrowdsaleInstance.buy({from: account0, value: txValue});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return CrowdsaleInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), 0, "ether raised must be 0");

      return CrowdsaleInstance.remaining.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), tokenCap, "incorrect remaining value");

      return CrowdsaleInstance.tokenContract.call();
    }).then(function(address) {
      ProjectTokenInstance = ProjectToken.at(address);

      return ProjectTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), 0, "account0 token balance must be 0");
      assert.equal(web3.eth.getBalance(EscrowInstance.address).toNumber(), parseInt(vaultBalance), "incorrect Vault ether balance");
    });
  });

  it("Buy tokens after the ether cap is reached should fail", function() {
    let CrowdsaleInstance;
    let ProjectTokenInstance;
    let TestPriceModelInstance;
    let numTokenstoBuy = tokenCap;
    let txValue = web3.toWei(numTokenstoBuy, "Ether"); // 1 token per ether as testPriceModel price

    let vaultBalance = web3.eth.getBalance(vault).toNumber();

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock, {from: owner}).then(function(instance) {
      ProjectTokenInstance = instance;

      return TestPriceModel.new();
    }).then(function(instance) {
      TestPriceModelInstance = instance;

      return Escrow.new();
    }).then(function(instance) {
      EscrowInstance = instance;

      vaultBalance = web3.eth.getBalance(EscrowInstance.address).toNumber();

      crowdsaleStarts = web3.eth.blockNumber - 1;
      crowdsaleEnds = web3.eth.blockNumber + 20;

      return Crowdsale.new(
        ProjectTokenInstance.address,
        TestPriceModelInstance.address,
        EscrowInstance.address,
        crowdsaleStarts,
        crowdsaleEnds,
        tokenCap
      );
    }).then(function(instance) {
      CrowdsaleInstance = instance;

      return ProjectTokenInstance.addMinter(CrowdsaleInstance.address, {from: owner});
    }).then(function() {

      return CrowdsaleInstance.buy({from: account0, value: txValue});
    }).then(function() {

      return CrowdsaleInstance.remaining.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), 0, "remaining value must be 0");

      return CrowdsaleInstance.buy({from: account0, value: 1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return CrowdsaleInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), txValue, "incorrect ether raised value");

      return CrowdsaleInstance.remaining.call();
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), 0, "remaining value must be 0");

      return CrowdsaleInstance.tokenContract.call();
    }).then(function(address) {
      ProjectTokenInstance = ProjectToken.at(address);

      return ProjectTokenInstance.balanceOf.call(account0);
    }).then(function(balance) {
      assert.equal(parseInt(balance.valueOf()), numTokenstoBuy, "incorrect account0 token balance");
      assert.equal(web3.eth.getBalance(EscrowInstance.address).toNumber(), parseInt(vaultBalance) + parseInt(txValue), "incorrect Vault ether balance");
    });
  });
});

function handleException(error) {
  assert(error.toString().indexOf("invalid JUMP") != -1 || error.toString().indexOf("out of gas") != -1 || error.toString().indexOf("invalid opcode") != -1, error.toString());
}

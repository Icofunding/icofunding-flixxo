const WithdrawTokensInput = artifacts.require("./WithdrawTokensInput.sol");
const ProjectToken = artifacts.require("./token/ProjectToken.sol");


contract('WithdrawTokensInput', function(accounts) {
  let owner;
  let receiver;
  let multisig;
  let other

  let tokenName;
  let tokenSymbol;
  let tokenDecimals;
  let transferableBlock;

  const ONE_DAY = 24*3600;


  before(() => {
    owner = accounts[0];
    receiver = accounts[1];
    multisig = accounts[2];
    other = accounts[3];

    lockUntil = Math.floor(Date.now() / 1000);

    tokenName = "Test Token";
    tokenSymbol = "TST";
    tokenDecimals = 18;
    transferableBlock = web3.eth.blockNumber;
  });

  it("Deployment with initial values", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return WithdrawTokensInstance.tokenContract.call();
    }).then(function(address) {
      assert.equal(address, ProjectTokenInstance.address, "incorrect tokenContract address");

      return WithdrawTokensInstance.multisig.call();
    }).then(function(value) {
      assert.equal(value, multisig, "incorrect multisig");

      return WithdrawTokensInstance.receiver.call();
    }).then(function(value) {
      assert.equal(value, receiver, "incorrect receiver");

      return WithdrawTokensInstance.numTokensLimit.call();
    }).then(function(value) {
      assert.equal(value, numTokens, "incorrect numTokensLimit");

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value, 0, "incorrect numTokensIssued");

      return WithdrawTokensInstance.open.call();
    }).then(function(value) {
      assert.isFalse(value, "must be closed");
    });
  });

  it("submit input", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return WithdrawTokensInstance.submitInput({from: multisig});
    }).then(function() {

      return WithdrawTokensInstance.open.call();
    }).then(function(value) {
      assert.isTrue(value, "must be open");

      return WithdrawTokensInstance.startDate.call();
    }).then(function(value) {
      assert.isAbove(value, 0, "incorrect startDate");
    });
  });

  it("submit input twice should fail", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return WithdrawTokensInstance.submitInput({from: multisig});
    }).then(function() {

      return WithdrawTokensInstance.submitInput({from: multisig});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);
    });
  });

  it("submit input from a non-multisig account should fail", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 100;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return WithdrawTokensInstance.submitInput({from: other});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return WithdrawTokensInstance.open.call();
    }).then(function(value) {
      assert.isFalse(value, "must be closed");

      return WithdrawTokensInstance.startDate.call();
    }).then(function(value) {
      assert.equal(value, 0, "incorrect startDate");
    });
  });

  it("check limit function", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 500000000000000000000000000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return WithdrawTokensInstance.limit.call(0);
    }).then(function(value) {
      assert.equal(value, 0, "incorrect limit value");

      return WithdrawTokensInstance.limit.call(10);
    }).then(function(value) {
      assert.equal(value.toString(10), "2734863000000000000000000", "incorrect limit value");

      return WithdrawTokensInstance.limit.call(25);
    }).then(function(value) {
      assert.equal(value.toString(10), "6823095000000000000000000", "incorrect limit value");

      return WithdrawTokensInstance.limit.call(1500);
    }).then(function(value) {
      assert.equal(value.toString(10), "326416951000000000000000000", "incorrect limit value");

      return WithdrawTokensInstance.limit.call(3650);
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens - 1000000000000000000, "incorrect limit value");

      return WithdrawTokensInstance.limit.call(3651);
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect limit value");

      return WithdrawTokensInstance.limit.call(10000);
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect limit value");
    });
  });

  it("Withdraw tokens after 0 days", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 500000000000000000000000000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.submitInput({from: multisig});
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), "0", "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), "0", "incorrect number of tokens");
    });
  });

  it("Withdraw tokens after 1500 days", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 500000000000000000000000000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.submitInput({from: multisig});
    }).then(function() {

      return increaseTime(ONE_DAY*1500);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), "326416951000000000000000000", "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), "326416951000000000000000000", "incorrect number of tokens");
    });
  });

  it("Withdraw tokens after 3650 days", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 500000000000000000000000000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.submitInput({from: multisig});
    }).then(function() {

      return increaseTime(ONE_DAY*3650);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens - 1000000000000000000, "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens - 1000000000000000000, "incorrect number of tokens");
    });
  });

  it("Withdraw tokens after 10000 days", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = 500000000000000000000000000;

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.submitInput({from: multisig});
    }).then(function() {

      return increaseTime(ONE_DAY*10000);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect number of tokens");
    });
  });

  it("Withdraw tokens after 0, 10, 25, 1500, 4000 and 5000 days", function() {
    let WithdrawTokensInstance;
    let ProjectTokenInstance;

    let numTokens = "500000000000000000000000000";

    return ProjectToken.new(tokenName, tokenSymbol, tokenDecimals, transferableBlock).then(function(instance) {
      ProjectTokenInstance = instance;

      return WithdrawTokensInput.new(
        ProjectTokenInstance.address,
        multisig,
        receiver,
        numTokens
      );
    }).then(function(instance) {
      WithdrawTokensInstance = instance;

      return ProjectTokenInstance.addMinter(WithdrawTokensInstance.address, {from: owner});
    }).then(function() {

      return WithdrawTokensInstance.submitInput({from: multisig});
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), 0, "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), 0, "incorrect number of tokens");

      return increaseTime(ONE_DAY*10);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), "2734863000000000000000000", "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), "2734863000000000000000000", "incorrect number of tokens");

      return increaseTime(ONE_DAY*15);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), "6823095000000000000000000", "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), "6823095000000000000000000", "incorrect number of tokens");

      return increaseTime(ONE_DAY*1475);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), "326416951000000000000000000", "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), "326416951000000000000000000", "incorrect number of tokens");

      return increaseTime(ONE_DAY*2500);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect number of tokens");

      return increaseTime(ONE_DAY*1000);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect number of tokens");

      return increaseTime(ONE_DAY*1000000);
    }).then(function() {

      return WithdrawTokensInstance.withdraw({from: receiver});
    }).then(function() {

      return WithdrawTokensInstance.numTokensIssued.call();
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect value");

      return ProjectTokenInstance.balanceOf.call(receiver);
    }).then(function(value) {
      assert.equal(value.toString(10), numTokens, "incorrect number of tokens");

    });
  });
});

function handleException(error) {
  assert(error.toString().indexOf("invalid JUMP") != -1 || error.toString().indexOf("out of gas") != -1 || error.toString().indexOf("invalid opcode") != -1, error.toString());
}

function increaseTime(seconds) {
    return new Promise(function(accept, reject) {
      web3.currentProvider.sendAsync({
        jsonrpc: "2.0",
        method: "evm_increaseTime",
        params: [seconds],
        id: new Date().getTime()
      }, function(err) {
        if (err) return reject(err);
        accept();
      })
    });
}

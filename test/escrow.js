const Escrow = artifacts.require("./Escrow.sol");
const MultiSig = artifacts.require("./MultiSigWallet.sol");

contract('Escrow', function(accounts) {
  let icofunding;
  let project;
  let account1;

  let lockUntil;


  before(() => {
    icofunding = accounts[0];
    project = accounts[1];
    account1 = accounts[2];

    lockUntil = web3.eth.blockNumber;
  });

  it("Deployment with initial values", function() {
    let EscrowInstance;

    return Escrow.new(lockUntil, icofunding, project).then(function(instance) {
      EscrowInstance = instance;

      return EscrowInstance.lockUntil.call();
    }).then(function(block) {
      assert.equal(block.toNumber(), lockUntil, "incorrect lockUntil");

      return EscrowInstance.icofunding.call();
    }).then(function(address) {
      assert.equal(address, icofunding, "incorrect icofunding address");

      return EscrowInstance.project.call();
    }).then(function(address) {
      assert.equal(address, project, "incorrect project address");

      return EscrowInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(value, 0, "totalCollected must be 0");
    });
  });

  it("Send Ether", function() {
    let EscrowInstance;
    let txValue = web3.toWei("1", "Ether");

    return Escrow.new(lockUntil, icofunding, project).then(function(instance) {
      EscrowInstance = instance;

      return web3.eth.sendTransaction({from: account1, to: EscrowInstance.address, value: txValue});
    }).then(function() {
      let balance = web3.eth.getBalance(EscrowInstance.address).toString(10);

      assert.equal(balance, txValue, "incorrect balance");

      return EscrowInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(value, txValue, "incorrect totalCollected");
    });
  });

  it("Send Ether multiple times", function() {
    let EscrowInstance;
    let txValue = web3.toWei("10", "Ether");
    let txValue2 = web3.toWei("4", "Ether");

    return Escrow.new(lockUntil, icofunding, project).then(function(instance) {
      EscrowInstance = instance;

      return web3.eth.sendTransaction({from: account1, to: EscrowInstance.address, value: txValue});
    }).then(function() {

      return web3.eth.sendTransaction({from: account1, to: EscrowInstance.address, value: txValue2});
    }).then(function() {
      let balance = web3.eth.getBalance(EscrowInstance.address).toString(10);

      assert.equal(balance, parseInt(txValue) + parseInt(txValue2), "incorrect balance");

      return EscrowInstance.totalCollected.call();
    }).then(function(value) {
      assert.equal(value, parseInt(txValue) + parseInt(txValue2), "incorrect totalCollected");
    });
  });

  it("Withdraw after locked block", function() {
    let EscrowInstance;
    let txValue = web3.toWei("10", "Ether");
    let fee;
    let amount;

    return Escrow.new(lockUntil, icofunding, project).then(function(instance) {
      EscrowInstance = instance;

      return web3.eth.sendTransaction({from: account1, to: EscrowInstance.address, value: txValue});
    }).then(function() {

      return EscrowInstance.getFee.call(txValue);
    }).then(function(value) {
      fee = value.toNumber();
      amount = txValue - fee;

      return EscrowInstance.withdraw();
    }).then(function(tx) {
      let event = tx.logs[0];

      assert.equal(event.event, 'e_Withdraw', "incorrect event name");
      assert.equal(event.args.fee.valueOf(), fee, "incorrect fee");
      assert.equal(event.args.amount.valueOf(), amount, "incorrect amount");

      let balance = web3.eth.getBalance(EscrowInstance.address).toString(10);

      assert.equal(balance, 0, "incorrect balance");
    });
  });

  it("Withdraw after locked block to a multiSig", function() {
    let EscrowInstance;
    let MultisigInstance;
    let txValue = web3.toWei("10", "Ether");
    let fee;
    let amount;

    return MultiSig.new([accounts[0], accounts[1], accounts[2]], 2).then(function(instance) {
      MultisigInstance = instance;

      return Escrow.new(lockUntil, icofunding, MultisigInstance.address);
    }).then(function(instance) {
      EscrowInstance = instance;

      return web3.eth.sendTransaction({from: account1, to: EscrowInstance.address, value: txValue});
    }).then(function() {

      return EscrowInstance.getFee.call(txValue);
    }).then(function(value) {
      fee = value.toNumber();
      amount = txValue - fee;

      return EscrowInstance.withdraw();
    }).then(function(tx) {
      let event = tx.logs[0];

      assert.equal(event.event, 'e_Withdraw', "incorrect event name");
      assert.equal(event.args.fee.valueOf(), fee, "incorrect fee");
      assert.equal(event.args.amount.valueOf(), amount, "incorrect amount");

      let balance = web3.eth.getBalance(EscrowInstance.address).toString(10);

      assert.equal(balance, 0, "incorrect balance");
    });
  });

  it("Withdraw before locked block should fail", function() {
    let EscrowInstance;
    let txValue = web3.toWei("10", "Ether");
    lockUntil = web3.eth.blockNumber + 10;

    return Escrow.new(lockUntil, icofunding, project).then(function(instance) {
      EscrowInstance = instance;

      return web3.eth.sendTransaction({from: account1, to: EscrowInstance.address, value: txValue});
    }).then(function() {

      return EscrowInstance.withdraw();
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      let balance = web3.eth.getBalance(EscrowInstance.address).toString(10);

      assert.equal(balance, txValue, "incorrect balance");
    });
  });

  it("Test fee", function() {
    let EscrowInstance;
    let amount;

    return Escrow.new(lockUntil, icofunding, project).then(function(instance) {
      EscrowInstance = instance;

      amount = web3.toWei("7000", "Ether");

      return EscrowInstance.getFee.call(amount);
    }).then(function(value) {
      assert.approximately(value.toNumber(), parseInt(web3.toWei("280", "Ether")), 5,  "incorrect fee");

      amount = web3.toWei("20000", "Ether");

      return EscrowInstance.getFee.call(amount);
    }).then(function(value) {
      assert.approximately(value.toNumber(), parseInt(web3.toWei("800", "Ether")), 5,  "incorrect fee");

      amount = web3.toWei("30000", "Ether");

      return EscrowInstance.getFee.call(amount);
    }).then(function(value) {
      assert.approximately(value.toNumber(), parseInt(web3.toWei("900", "Ether")), 5,  "incorrect fee");

      amount = web3.toWei("50000", "Ether");

      return EscrowInstance.getFee.call(amount);
    }).then(function(value) {
      assert.approximately(value.toNumber(), parseInt(web3.toWei("1100", "Ether")), 5,  "incorrect fee");

      amount = web3.toWei("100000", "Ether");

      return EscrowInstance.getFee.call(amount);
    }).then(function(value) {
      assert.approximately(value.toNumber(), parseInt(web3.toWei("1600", "Ether")), 5,  "incorrect fee");
    });
  });

});

function handleException(error) {
  assert(error.toString().indexOf("invalid JUMP") != -1 || error.toString().indexOf("out of gas") != -1 || error.toString().indexOf("invalid opcode") != -1, error.toString());
}

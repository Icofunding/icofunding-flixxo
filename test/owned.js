const Owned = artifacts.require("./util/Owned.sol");

contract('Owned', function(accounts) {
  let account1;
  let account2;

  before(() => {
    owner = accounts[0];
    account1 = accounts[1];
  });

  it("Deployment", function() {
    let OwnedInstance;

    return Owned.new({from: owner}).then(function(instance) {
      OwnedInstance = instance;

      return OwnedInstance.owner.call();
    }).then(function(account) {
      assert.equal(account, owner, "incorrect owner");
    });
  });

  it("Change owner as owner", function() {
    let OwnedInstance;

    return Owned.new({from: owner}).then(function(instance) {
      OwnedInstance = instance;

      return OwnedInstance.changeOwner(account1);
    }).then(function() {

      return OwnedInstance.owner.call();
    }).then(function(account) {
      assert.equal(account, account1, "incorrect owner");
    });
  });

  it("Change owner as non-owner should fail", function() {
    let OwnedInstance;

    return Owned.new({from: owner}).then(function(instance) {
      OwnedInstance = instance;

      return OwnedInstance.changeOwner(account1, {from: account1});
    }).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);

      return OwnedInstance.owner.call();
    }).then(function(account) {
      assert.equal(account, owner, "incorrect owner");
    });
  });
});

function handleException(error) {
  assert(error.toString().indexOf("invalid JUMP") != -1 || error.toString().indexOf("out of gas") != -1 || error.toString().indexOf("invalid opcode") != -1, error.toString());
}

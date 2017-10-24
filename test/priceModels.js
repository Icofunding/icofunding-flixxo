const Phased = artifacts.require("./priceModels/Phased.sol");

contract('Phased', function(accounts) {
  const MAX_UINT256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935';
  const UINT256_OVERFLOW = '115792089237316195423570985008687907853269984665640564039457584007913129639936';
  let account0;

  before(() => {
    account0 = accounts[0];
  });

  it("Deployment with phased price", function() {
    let PhasedInstance;
    let prices = [10, 20, 30, 40];
    let dates = [100, 110, 120, 130];
    let date = 90;

    return Phased.new(prices, dates).then(function(instance) {
      PhasedInstance = instance;

      return PhasedInstance.getPrice.call(date);
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), prices[0], "should return price of phase 1");
      date = 105;

      return PhasedInstance.getPrice.call(date);
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), prices[0], "should return price of phase 1");
      date = 115;

      return PhasedInstance.getPrice.call(date);
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), prices[1], "should return price of phase 2");
      date = 125;

      return PhasedInstance.getPrice.call(date);
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), prices[2], "should return price of phase 3");
      date = 135;

      return PhasedInstance.getPrice.call(date);
    }).then(function(value) {
      assert.equal(parseInt(value.valueOf()), prices[3], "should return price of phase 4");
    });
  });

  it("Deployment with different price and date lengths should fail", function() {
    let PhasedInstance;
    let prices = [10, 20, 30];
    let dates = [100, 110, 120, 130];

    return Phased.new(prices, dates).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);
    });
  });

  it("Deployment with more than 10 phases should fail", function() {
    let PhasedInstance;
    let prices = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110];
    let dates = [100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210];

    return Phased.new(prices, dates).then(function() {
      assert(false, "Was supposed to throw but didn't.");
    }).catch(function(error) {
      handleException(error);
    });
  });
});

function handleException(error) {
  assert(error.toString().indexOf("invalid JUMP") != -1 || error.toString().indexOf("out of gas") != -1 || error.toString().indexOf("invalid opcode") != -1, error.toString());
}

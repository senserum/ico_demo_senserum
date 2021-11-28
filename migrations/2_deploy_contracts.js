const RpsToken = artifacts.require("RpsToken");
const RpsTokenSale = artifacts.require("RpsTokenSale");

module.exports = function (deployer) {
  deployer.deploy(RpsToken,1000009).then(function() {
    var tokenPrice = 1000000000000000; //tokenPrice es 0.001 Ether, está expresado en WEI acá

    return deployer.deploy(RpsTokenSale, RpsToken.address, tokenPrice);
  })

  
};

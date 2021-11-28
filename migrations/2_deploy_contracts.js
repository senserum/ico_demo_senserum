const RpsToken = artifacts.require("RpsToken");

module.exports = function (deployer) {
  deployer.deploy(RpsToken,1000009);
};

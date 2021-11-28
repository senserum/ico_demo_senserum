pragma solidity ^0.6.0;

import "./RpsToken.sol";

contract RpsTokenSale {
    address admin;
    RpsToken public tokenContract;
    uint256 public tokenPrice;


    constructor (RpsToken _tokenContract, uint256 _tokenPrice) public {
        //agrego un admin que va a regentear el token sale
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;

    }
}
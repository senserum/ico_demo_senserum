pragma solidity ^0.6.0;

import "./RpsToken.sol";

contract RpsTokenSale {
    address admin;
    RpsToken public tokenContract;
    uint256 public tokenPrice;
    uint256 public tokensSold;

    event Sell(address _buyer, uint256 _amount);
   

    constructor (RpsToken _tokenContract, uint256 _tokenPrice) public {
        //agrego un admin que va a regentear el token sale
        admin = msg.sender;
        tokenContract = _tokenContract;
        tokenPrice = _tokenPrice;

    }

    //implemento una funcion para multiplicar de manera segura, copiada de una librería

    function multiply(uint x, uint y) internal pure returns(uint z){
        require(y==0 || (z = x * y) / y == x);
    }

    function buyTokens(uint256 _numberOfTokens) public payable {
        //require que haya suficientes tokens en el contrato
        require(tokenContract.balanceOf(address(this)) >= _numberOfTokens );
        
        //require que el valor sea igual al tokenPrice
        require(msg.value == multiply(_numberOfTokens, tokenPrice));
        
        //require que la transferencia sea exitosa
        require(tokenContract.transfer(msg.sender, _numberOfTokens));
        //Almacena las ventas en tokenSold
        tokensSold += _numberOfTokens;
        //emite evento VentadeToken
        emit Sell(msg.sender, _numberOfTokens);
    }

    function endSale() public {
        //requerir que solo el admin la pueda terminar
        require(msg.sender == admin);
        //transferir el excedente de tokens al admin
        require(tokenContract.transfer(admin, tokenContract.balanceOf(address(this))));
    
        //destruir contrato tokenSale al final
        selfdestruct(payable(admin));
        
        
    }
}
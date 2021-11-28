const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

const RpsTokenSale = artifacts.require('./RpsTokenSale.sol');

contract('RpsTokenSale', (accounts) => {
    //instancio cada vez el tokensale antes de las pruebas
    var tokenPrice = 1000000000000000; //in WEI

    beforeEach( async ()=>{
        tokenventa = await RpsTokenSale.deployed();

    });

    describe('Deployment del Contrato', () => {
        it('inicializa el contrato con los valores correctos', async ()=>{
            let addressSale = await tokenventa.address;
            let tokenrpscontract = await tokenventa.tokenContract();
            let tokenprecio = await tokenventa.tokenPrice();
            //console.log("tokenrpscontract=" & tokenrpscontract);
            
            assert.notEqual(tokenrpscontract, 0x0, 'Debería existir el addres del token contract RPS');
            assert.notEqual(addressSale, 0x0, 'La direccion no puede ser 0x0');
            assert.equal(tokenprecio, tokenPrice, 'El precio del token es incorrecto');
            
        })

    });


})
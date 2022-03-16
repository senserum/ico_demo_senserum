const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

const RpsTokenSale = artifacts.require('./RpsTokenSale.sol');
const RpsToken = artifacts.require('./RpsToken.sol');

contract('RpsTokenSale', (accounts) => {
    //instancio cada vez el tokensale antes de las pruebas
    var tokenPrice = 1000000000000000; //in WEI
    var admin = accounts[0];
    var buyer = accounts[1];
    
    var tokensAvailable = 750000;
    var numberOfTokens;

    beforeEach( async ()=>{
        tokenventa = await RpsTokenSale.deployed();
        tokenrps = await RpsToken.deployed();
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

        it('facilita la compra de tokens', async ()=>{
            numberOfTokens = 10;
            return tokenventa.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice })
            .then(function(receipt){
                assert.equal(receipt.logs.length, 1, 'Debería dispararse un único evento');
                assert.equal(receipt.logs[0].event, 'Sell', 'El evento debería llamarse Sell');
                assert.equal(receipt.logs[0].args._buyer, buyer, 'el comprador debería ser el que estoy usando en el test');
                assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'amount debería ser igual a numberOfTokens');
               
                return tokenventa.tokensSold();
            }).then(function(amount){
                assert.equal(amount.toNumber(), numberOfTokens, 'el monto de tokens esta mal');

                //intento comprar tokens a un precio diferente del declarado en ethers

                return tokenventa.buyTokens(numberOfTokens,{ from: buyer, value: 1 }  )
            }).then(assert.fail).catch(function(error){
                console.log(error.message);
                assert(error.message.indexOf('revert') >= 0, 'msg.value debe ser igual al nro de tokens en wei');
                
            })
        })

        it('interactuo con el contrato principal del token', async ()=>{
            numberOfTokens = 10;

            await tokenrps.transfer( tokenventa.address, tokensAvailable, {from: admin});
             return tokenventa.buyTokens(800000, { from: buyer, value: numberOfTokens * tokenPrice })
             //este tipo de controles va  de la mano con el require, sino hay require no hay mensaje revert
            .then(assert.fail).catch(function(error){
                console.log(error.message);
                assert(error.message.indexOf('revert') >=0, 'el numero de tokens comprados no debe superar al disponible');
            
                //ahora armo un caso que funque bien y me transfiera fondos al buyer    
            return tokenventa.buyTokens(numberOfTokens, { from: buyer, value: numberOfTokens * tokenPrice });
            
            }).then(function(receipt){
                assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'amount debería ser igual a numberOfTokens');
                return tokenrps.balanceOf(tokenventa.address);                
            }).then(function(balance){
                assert.equal(balance.toNumber(), tokensAvailable - numberOfTokens,'el balance está mal' );
            })
        })
        
        it('termina la venta de tokens', async ()=>{
            //intento terminar la venta con otra cuenta que no sea admin

            let balanceCta1 = await tokenrps.balanceOf(tokenventa.address);
            //en mi tokenventa.adress me queda el sobrante de las pruebas anteriores de los otros bloques de test
            expect(balanceCta1.toNumber()).to.equal(749990); 

            return tokenventa.endSale({ from: buyer})
            .then(assert.fail).catch(function(error){
                assert(error.message.indexOf('revert')>=0,'debería revertir la ejecución de la función');
            
                return tokenventa.endSale({from: admin});
            }).then(function(receipt){
                return tokenrps.balanceOf(tokenventa.address);
            }).then(function(balance){
                assert.equal(balance.toNumber(), 0, 'el balance debería ser 0 porque se transfiere el excedente al admin');
                //chequeo que el contrato se haya obliterado una vez que corro el selfDestruct, chequeando que el admin tenga todo el saldo restante
                //el saldo restante es 999999 porque los 10 token que faltan se los queda buyer.
                
                return tokenrps.balanceOf(admin)
                 .then(function(balancefinal){
                    assert.equal(balancefinal.toNumber(), 999999, 'el balance final del admin debería ser 750000');
                }) 
                    
            })
           
        })


    });


})
//para que tome el chai hay que instalar npm install --save-dev chai ,
//You need to install it locally (on your node_modules directory), so that require can find it.
//Para testear los eventos me instalo npm install truffle-assertions
const { expect, assert } = require('chai');
const truffleAssert = require('truffle-assertions');

const RpsToken = artifacts.require('./RpsToken.sol');

contract('RpsToken', (accounts)=>{

    beforeEach(async () =>{

        token = await RpsToken.deployed();
        
    });

    describe('Deployment', () => {
        it('setea el totalSupply en el momento del deploy', async () => {
            let totalsupply = await token.totalSupply();
            console.log("totalsupply=" & totalsupply);
            assert.equal(totalsupply.toNumber(), 1000009,'totalsupply deberia ser 1000009' );

        });
        it('Inicializa el contrato con los valores correctos', async ()=>{
            let tokenname = await token.name();
            let tokensym = await token.symbol();
            assert.equal(tokenname,'RPS Token', 'el Token deberia tener el nombre correcto');
            assert.equal(tokensym,'RPS','El symbol del token deberia ser RPS');
            assert.equal(await token.standard(),'RPS Token v1.0 nic0strip','El standard del token está mal');
          });
        it('Asigna el totalSupply a la cuenta de admiin ', async () => {
        //Funciona con return o con await indistintamente
            //return token.balanceOf(owner.address)
            await token.balanceOf(accounts[0])
            .then(function(adminbalance){
            assert.equal(adminbalance.toNumber(),1000009, 'Comparo el balance del admin contra el totalSupply inicial y no me da');
            })
    
        });
        it('Verifico que el totalSupply sea igual al balanceOf del creador del contrato usando EXPECT', async () =>{
            let luki = await token.balanceOf(accounts[0]);
            expect(luki.toNumber()).to.equal(1000009);
        });
        it('should set the right owner, en este caso el vato que mandó el deploy', async () => {
            expect(await token.owner()).to.equal(accounts[0]);
         });
               

    });

    describe('Interaccion de funciones', () => {
        it('Chequea que funcione el require de transfer', async () =>{
            return token.transfer(accounts[1],99999999)
            .then(assert.fail).catch(function(error){
                console.log(error.message);
               // assert.equal(error.message,'holahola', 'el mensaje de error debe contener revert' );
                //este test juega con el REQUIRE definido en el metodo transfer, cuando éste existe, el error me 
                //devuelve la palabra revert , si saco el require en el contract pasa de largo ya que trata de transferir igual
                assert(error.message.indexOf('revert') >= 0,'el mensaje deberia contener la palabra: revert');
                });
        });
        it('transfiere 500 varos de una cuenta a otra', async () =>{
            await token.transfer(accounts[1],500, { from:accounts[0] }); 
            let balanceCta1 = await token.balanceOf(accounts[1]);
            //en truffle es necesario poner los .toNumber() porque sino me retorna un bigint y no me hace la comparacion
            expect(balanceCta1.toNumber()).to.equal(500); 
            let balanceCta0 = await token.balanceOf(accounts[0]);
            assert.equal(balanceCta0.toNumber(),999509,'En la cuenta del owner deberia quedar lo inicial menos 500 varos');

        });
        
        it('chequea que se dispare correctamente el evento de transfer, y verifica los args', async ()=>{
            let resultev = await token.transfer(accounts[1],500);
            truffleAssert.eventEmitted(resultev,'Transfer',(ev) =>{
                return ev._from == accounts[0] && ev._to == accounts[1] && ev._value ==500;
            },'Los args del evento no están bien');
            //coso para mostrar los argumentos usados en el evento(es la info del receipt un poco formateada cuac)
            //truffleAssert.prettyPrintEmittedEvents(resultev);

        });

        it('apruebo para que la cuenta _spender pueda gastar un num fijo de tokens', async ()=>{
            //usando call no disparamos una tx, entonces usamos la función y podemos chequear el valor de retorno
            return token.approve.call(accounts[1], 100)
            .then(function(success) {
                assert.equal(success, true, 'error, deberia devolver true gato');
             //ahora llamamos la function approve sin usar call, de ésta manera dispara una tx 
                return token.approve(accounts[1],100, { from: accounts[0]})
            }).then(function(receipt){
              assert.equal(receipt.logs.length, 1, 'deberia disparar UN ÚNICO evento');
              assert.equal(receipt.logs[0].event, 'Approve', 'el evento disparado deberia llamarse Approve');
              assert.equal(receipt.logs[0].args._owner, accounts[0], 'Debería loguear la cuenta que está autorizando los tokens');
              assert.equal(receipt.logs[0].args._spender, accounts[1], 'Debería loguear la cuenta que está siendo autorizada');              
              assert.equal(receipt.logs[0].args.value, 100, 'la cantidad de tokens aprobada');                            
              return token.allowance(accounts[0], accounts[1]);
            }).then(function(allowance) {
               assert.equal(allowance, 100, 'debería tener 100 tokens delegados en allowance');    
            })

        });
        it('maneja las transferencias de tokens delegadas entre cuentas ', async() =>{
            fromAccount = accounts[2];
            toAccount = accounts[3];
            spendingAccount = accounts[4];
            //transfer some tokens from fromAccount
            return token.transfer(fromAccount, 500, { from: accounts[0] })
            .then(function(receipt){
                return token.approve(spendingAccount, 10, { from: fromAccount});
            })
            .then(function(receipt){
                // intento transferir mas tokens que los que tiene el sender en su balance
                return token.transferFrom(fromAccount, toAccount, 999999, { from: spendingAccount} )
                .then(assert.fail).catch(function(error){
                console.log(error.message);
                assert(error.message.indexOf('revert') >= 0,'No puede transferir mas de lo que está en balanceOf' );
                //intento transferir mas de la cantidad aprobada
                return token.transferFrom(fromAccount, toAccount, 20, {from: spendingAccount})
                 })
                .then(assert.fail).catch(function(error){
                assert(error.message.indexOf('revert') >= 0,'No puede transferir mas de lo que está aprobado' )
                //acá uso call porque  de esta manera no se genera tx y puedo verificar el valor de retorno de la función
                return token.transferFrom.call(fromAccount, toAccount, 10, { from: spendingAccount} );
                }).then(function(success){
                    assert.equal(success,true,'transferFrom deberia devolver true');
                //Ahora no uso call así puedo revisar el contenido del receipt de la tx
                    return token.transferFrom(fromAccount, toAccount, 10, { from: spendingAccount} );
                }).then(function(receipt){
                    assert.equal(receipt.logs.length, 1, 'deberia disparar UN ÚNICO evento');
                    assert.equal(receipt.logs[0].event, 'Transfer', 'el evento disparado deberia llamarse Transfer');
                    assert.equal(receipt.logs[0].args._from , fromAccount, 'Debería loguear la cuenta que está autorizando los tokens');
                    assert.equal(receipt.logs[0].args._to, toAccount, 'Debería loguear la cuenta que está siendo autorizada');              
                    assert.equal(receipt.logs[0].args._value, 10, 'la cantidad de tokens transferida');                            
                    return token.balanceOf(fromAccount);
                }).then(function(balance){
                    //deberia tener 490 ya que al comienzo del test inicio la cuenta fromAccount con 500 varos
                    assert.equal(balance.toNumber(), 490, 'reduce el balance de la cuenta que envia la guita');
                    return token.balanceOf(toAccount);
                }).then(function(balance){
                    assert.equal(balance.toNumber(), 10, 'el balance de toAccount deberia ser 10');
                    return token.allowance(fromAccount, spendingAccount);
                }).then(function(allowance){
                    assert.equal(allowance.toNumber(), 0, 'deduce el monto del allowance autorizado')
                })
            
            });
        });

            
    });


})



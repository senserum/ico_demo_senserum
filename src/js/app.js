App = {
    web3Provider: null,
    contracts: {},
    account: '0x0',
    loading: false,
    tokenPrice: 1000000000000000,
    tokenSold: 0,
    tokensAvailable: 750000,

    init: function(){
        console.log("app.js initialized...");
        return App.initWeb3();
    },
    
    initWeb3: async function() {
       
        if (window.ethereum) {
            App.web3Provider = window.ethereum;
        
            try {
            // Request account access
            //await window.ethereum.enable();
            //await ethereum.sendAsync('eth_requestAccounts');
            await window.ethereum.request({
                method: 'eth_requestAccounts',
            });
            } catch (error) {
            // User denied account access...
            console.error("User denied account access")
            }
        }
        
        // Legacy dapp browsers...
        else if (window.web3) {
            App.web3Provider = window.web3.currentProvider;
        }
        // If no injected web3 instance is detected, fall back to Ganache
        else {
            App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        }
        web3 = new Web3(App.web3Provider);
        
        return App.initContracts();
    },


    initContracts: async () => {
        //init tokensale contract
        const rpsTokenSale = await $.getJSON('RpsTokenSale.json');

            App.contracts.RpsTokenSale = TruffleContract(rpsTokenSale);
            App.contracts.RpsTokenSale.setProvider(App.web3Provider);
            App.contracts.RpsTokenSale = await App.contracts.RpsTokenSale.deployed();
            const addr1 = await App.contracts.RpsTokenSale.address;
            console.log("RpsTokenSale addres=", addr1);
        
        //init tokenrps contract
        const rpsToken = await $.getJSON('RpsToken.json');

            App.contracts.RpsToken = TruffleContract(rpsToken);
            App.contracts.RpsToken.setProvider(App.web3Provider);
            App.contracts.RpsToken = await App.contracts.RpsToken.deployed();
            const addr2 = await App.contracts.RpsToken.address;
            console.log("RpsToken addres=", addr2);

            App.listenForEvents();
            return App.render();
        },

        //listen for events emitted from the contract
        listenForEvents: async () => {
            await App.contracts.RpsTokenSale.Sell({         
            }, {fromblock:0, toblock: 'latest'})
            .watch(function(error,event) {
                console.log("event triggered",event);
                App.render();
            })
        },

        render: async () => {
            if (App.loading){
                return;
            }
            App.loading = true;

            var loader = $('#loader');
            var content = $('#content');

            loader.show();
            content.hide();
            //load account data
            web3.eth.getCoinbase(function(err, account){
                if(err === null) {
                    console.log("entro a youraccount");
                    App.account = account;
                    $('#accountaddress').html("Your Account:" + account);
                }
            })

            //Traigo info del tokenSale
            const tokenprice = await App.contracts.RpsTokenSale.tokenPrice();
            const tokensold = await App.contracts.RpsTokenSale.tokensSold();
            //const tokensav = await App.contracts.RpsTokenSale.
            
                //console.log(tokenprice);
                App.tokenPrice = tokenprice;
                // convert from wei to ether
                $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());

                //App.tokensSold = tokensold;
                App.tokensSold = tokensold.toNumber();
                $('.tokens-sold').html(App.tokensSold);
                $('.tokens-available').html(App.tokensAvailable);

                //var progressPercent = (Math.ceil(3 / App.tokensAvailable)) * 100;
                var progressPercent = (App.tokensSold / App.tokensAvailable) * 100;
                console.log("porcentaje ventas token=",progressPercent);
                $('#progress').css('width', progressPercent + '%');

            //Traigo info del Token

            const userbalance = await App.contracts.RpsToken.balanceOf(App.account);
            console.log("balance de la cuenta=", userbalance);

            $('.rps-balance').html(userbalance.toNumber());
            

                App.loading = false;
                loader.hide();
                content.show();
            
        },

        buyTokens: async ()=>{
            $('#content').hide();
            $('#loader').show();
            var numberOfTokens = $('#numberOfToken').val();


            console.log("numberOfToken=", numberOfToken);
            console.log("App.tokenPrice=", App.tokenPrice);
            console.log("cuentita=", numberOfTokens * App.tokenPrice);

            await App.contracts.RpsTokenSale.buyTokens(numberOfTokens, { from : App.account, value: numberOfTokens * App.tokenPrice, gas: 500000 })
            .then(function(result){
                console.log("tokens bought...");
                $('form').trigger('reset');
                //Wait for Sell event to trigger
               /*  $('#loader').hide();
                $('#content').show(); */

            })

        }
}
          

$(function() {
    $(window).load(function(){
        App.init();
    })
});
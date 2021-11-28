pragma solidity ^0.6.0;

contract RpsToken {

    //name
    //symbol

    uint256 public totalSupply;
    string public name;
    string public symbol;
    string public standard;
    address public owner;
    mapping(address => uint) balances;
    mapping(address => uint256) public balanceOf;
    //allowance, aqui se almacena lo autorizado en Approve
    mapping(address => mapping(address => uint256)) public allowance;
    string public mensaje;

    event Transfer(
        address indexed _from,
        address indexed _to,
        uint256 _value
    );
 
    event Approve(
        address indexed _owner,
        address indexed _spender,
        uint256 value
    );

    constructor (uint256 _initialSupply) public {
         totalSupply = _initialSupply;
         name = "RPS Token";
         symbol = "RPS";
         standard = "RPS Token v1.0 nic0strip";
         // allocate the initialSupply
         balanceOf[msg.sender] = totalSupply;
         owner = msg.sender;
         balances[msg.sender] = totalSupply;
    }

    //function transfer
    function transfer(address _to, uint256 _value) public returns (bool success) {
        //excepción si la cuenta no tiene suficiente
        require(balanceOf[msg.sender]>= _value);
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;

        
        //transfer Event
        emit Transfer(msg.sender, _to, _value);
        //retorno boolean
        return true;
    }

    //approve
    function approve(address _spender, uint256 _value) public returns (bool success){
        //allowance
        allowance[msg.sender][_spender] = _value;
        //approve event
        emit Approve(msg.sender, _spender, _value);
        return true;
    }

    // TransferFrom
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success) {
        require( _value <= balanceOf[_from] );
        require(_value <= allowance[_from][msg.sender]);
        
        //cambio el balance de las cuentas
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;

        //actualizo el allowance
        allowance[_from][msg.sender] -= _value;

        //emito el evento Transfer
        emit Transfer(_from, _to, _value);
        
        //returno el true
        return true;

    }

    

// para prueba de nico en la consola de hardhat
    function decirHola(string memory chino) public {
        
       mensaje = string(abi.encodePacked("hola bo ", chino));

    }

}
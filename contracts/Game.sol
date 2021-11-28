pragma solidity ^0.6.0;

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Round {

    //variables definition
    uint8 constant rock = 0;
    uint8 constant paper = 1;
    uint8 constant scissors = 2;

    // armo un mapping para alojar lo que eligió cada jugador. Mapping for choices storage.
    mapping(address => uint8) public choices;


    function jugar(uint8 opcion) external {
        //verify valid move
        require(opcion == rock || opcion == paper || opcion == scissors);
        //verify player still hasnt played
        require(choices[msg.sender] == 0);
        choices[msg.sender] = opcion;
    
    }

    function evaluar(address alice, address bob) external view returns (address){
       //evaluate draw
       if (choices[alice] == choices[bob]) {
           return address(0);
       }

       //the game

       if (choices[alice] == rock && choices[bob] == paper) {
           return bob;
       } else if (choices[bob] == rock && choices[alice] == paper) {
           return alice;
       } else if (choices[alice] == paper && choices[bob] == scissors) {
           return bob;
       } else if (choices[bob] == paper && choices[alice] == scissors) {
           return alice;
       } else if (choices[alice] == scissors && choices[bob] == rock) {
           return bob;
       } else if (choices[bob] == scissors && choices[alice] == rock) {
           return alice;
       }

    }




}
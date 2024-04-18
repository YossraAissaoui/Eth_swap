pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap{
	  string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

  event TokenPurchased(
  address account,
  address token,
  uint amount,
  uint rate
  );

  event TokenSold(
  address account,
  address token,
  uint amount,
  uint rate 
  );

 constructor(Token _token) public{
	token = _token;
}

function buyTokens() public payable {
  //calculate the number of tokens to buy
  //Amout of ethereum * redemption rate
  //redemption rate = number of tokens they receive for 1 ether
  uint tokenAmount = msg.value * rate;

  //require ethswap has enough tokens, (this) refers to the contract's address
  require(token.balanceOf(address(this)) >= tokenAmount);
  //transfer tokens to the user
  token.transfer(msg.sender, tokenAmount);
  
  //emit token
  emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
}


function sellTokens(uint _amount) public{

  //users can't sell more than what they have
  require(token.balanceOf(msg.sender) >= _amount);

  //calculate the amount of ether to redeem
  uint etherAmount = _amount / rate;
  //require that EthSwap has enough Ether
  require(address(this).balance >= etherAmount);
  //perform sell
  token.transferFrom(msg.sender,address(this), _amount);
  msg.sender.transfer(etherAmount);

  //emit an event
  emit TokenSold(msg.sender, address(token), _amount, rate);
}

}

// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// Uniswap V3 Documentation
// --> https://docs.uniswap.org/contracts/v3/guides/swaps/single-swaps

contract Swapper {
    // save uinswap address 
    address public immutable SWAP_ROUTER;

    address public owner; 

    constructor(address _SWAP_ROUTER ) {
        SWAP_ROUTER = _SWAP_ROUTER;
        // will be the deployer of the contract. runs only once first time it is uploaded
        owner = msg.sender;
    }
    // Code goes here...

    function swap(address[] memory _path, uint24 _fee, uint256 _amountIn) public {
        // simple require 
        // needs permission for this account to transfer the funds to this contract 
        require(IERC20(_path[0]).transferFrom(msg.sender, address(this), _amountIn), 'Transfer failed');
        // then when it holds the token it will approve the swap for the other tokens thru uniswap address. uniswap address is given permission to take the tokens from this account
        require(IERC20(_path[0]).approve(SWAP_ROUTER, _amountIn), 'Approval Failed');


        // build swap params
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter.ExactInputSingleParams({
            tokenIn : _path[0], 
            tokenOut: _path[1],
            fee: _fee, 
            recipient: address(this),  
            deadline: block.timestamp, 
            amountIn: _amountIn, 
            amountOutMinimum: 0, 
            sqrtPriceLimitX96: 0
        });


        // swap 
        uint256 amountOut = ISwapRouter(SWAP_ROUTER).exactInputSingle(params);

        // send crypto back to our wallet
        // from the erc20 contract of the token we want to buy it sends to our account
        IERC20(_path[1]).transfer(msg.sender, amountOut);

    }

    // withdraws regular eth for gas consuption purposes. 
    function withdrawETH() public {
        require(msg.sender == owner);
        (bool success, ) = owner.call{value: address(this).balance}('');
        require(success);
    }

    // withdraws the tokens to the msg.sender using the address of the ERC20 token to withdraw from. 
    function withdrawTokens(address _token) public {
        require(msg.sender == owner);
        require(
            IERC20(_token).transfer(
                owner, 
                IERC20(_token).balanceOf(address(this))
            )
        );
    }

}

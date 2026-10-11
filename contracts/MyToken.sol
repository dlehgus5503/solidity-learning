// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals;

    uint256 public totalSupply;
    mapping(address => uint256) public balance0f;

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimal,
        uint256 _amount
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimal;
        _mint(_amount * 10 ** uint256(decimals), msg.sender);
    }

    function _mint(uint256 amount, address owner) internal {
        //totalSupply = totalSupply + amount;
        //balance0f[owner] = balance0f[owner] + amount;
        totalSupply += amount;
        balance0f[owner] += amount;
    }

    function transfer(uint256 amount, address to) external {
        require(balance0f[msg.sender] >= amount, "insufficient balance");

        balance0f[msg.sender] -= amount;
        balance0f[to] += amount;
    }
}

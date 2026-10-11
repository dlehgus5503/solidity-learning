pragma solidity ^0.8.28;

contract MyToken {
    string public name;
    string public symbol;
    uint8 public decimals;

    uint256 public totalSupply;
    mapping(address => uint256) public balance0f;

    constructor(string memory _name, string memory _symbol, uint8 _decimal) {
        name = _name;
        symbol = _symbol;
        decimals = _decimal;
    }
    //function totalSupply() external view returns (uint256) {
    //    return totalSupply;
    //}

    //function balance0f(address owner) external view returns (uint256) {
    //    return balance0f[owner];
    //}

    //function name() external view returns (string memory) {
    //    return name;
    //}
}

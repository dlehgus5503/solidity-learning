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
        _mint(1 * 10 ** uint256(decimals), msg.sender);
    }

    function _mint(uint256 amount, address owner) internal {
        //totalSupply = totalSupply + amount;
        //balance0f[owner] = balance0f[owner] + amount;
        totalSupply += amount;
        balance0f[owner] += amount;
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

//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


import "hardhat/console.sol";


contract WatchList {
    mapping (address => address[]) public watchlists;

    function addToWatchList(address[] memory contractAddresses) external {
        watchlists[msg.sender] = contractAddresses;
    }

    function removeFromWatchList(address contractAddress) external {
        address[] storage userWatchlist = watchlists[msg.sender];
        uint index = findIndex(userWatchlist, contractAddress);
        require(index < userWatchlist.length, "Address not found in watchlist");

        // move the last element to the index to delete and then resize the array
        userWatchlist[index] = userWatchlist[userWatchlist.length - 1];
        userWatchlist.pop();
    }

    function getUserWatchList() external view returns (address[] memory) {
        return watchlists[msg.sender];
    }

    function findIndex(address[] memory arr, address addr) internal pure returns (uint) {
        for (uint i = 0; i < arr.length; i++) {
            if (arr[i] == addr) {
                return i;
            }
        }
        revert("Address not found in watchlist");
    }
}
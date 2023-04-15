// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


contract WatchList {
    mapping(address => address[]) public watchlists;

    function addToWatchList(address contractAddress) external {
        require(!isWatched(contractAddress), "Contract is already being watched");
        watchlists[msg.sender].push(contractAddress);
    }

    function isWatched(address contractAddress) internal view returns (bool) {
        address[] storage userWatchlist = watchlists[msg.sender];
        for (uint256 i = 0; i < userWatchlist.length; i++) {
            if (userWatchlist[i] == contractAddress) {
                return true;
            }
        }
        return false;
    }

    function removeFromWatchList(address contractAddress) external {
        address[] storage userWatchlist = watchlists[msg.sender];
        uint256 index = findIndex(userWatchlist, contractAddress);
        require(index < userWatchlist.length, "Address not found in watchlist");

        // move the last element to the index to delete and then resize the array
        userWatchlist[index] = userWatchlist[userWatchlist.length - 1];
        userWatchlist.pop();
    }

    function getUserWatchList(address userAddress) external view returns (address[] memory) {
        return watchlists[userAddress];
    }

    function findIndex(address[] memory arr, address addr) internal pure returns (uint256) {
        for (uint256 i = 0; i < arr.length; i++) {
            if (arr[i] == addr) {
                return i;
            }
        }
        revert("Address not found in watchlist");
    }
}

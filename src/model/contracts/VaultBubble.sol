// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./AccessControlledStorage.sol";
import "./AccessControlBits.sol";

/**
 * Simple Access Control Contract controlling a file vault bubble. 
 *
 *   - Both the user's wallet account and their local application key have full read/write access 
 *     to the bubble.
 *   - Content IDs 1-256 are available as directories. All other contents are files.
 *   - The bubble can be terminated to delete the bubble and it's contents.
 */
contract VaultBubble is AccessControlledStorage {

  address owner = msg.sender;
  address appKey;
  bool terminated = false;

  constructor(address _appKey) {
    appKey = _appKey;
  }

  function getAccessPermissions( address user, uint256 contentId ) external view override returns (uint256) {
    uint256 directoryBit = contentId < 257 ? DIRECTORY_BIT : 0;
    if (terminated) return BUBBLE_TERMINATED_BIT;
    else if (user == owner || user == appKey) return directoryBit | READ_BIT | WRITE_BIT | APPEND_BIT;
    else return NO_PERMISSIONS;
  }

  function terminate() external {
    require (msg.sender == owner, "permission denied");
    terminated = true;
  }
  
}